const LeaveRequestModel = require('../models/LeaveRequest');
const LeaveBalanceModel = require('../models/LeaveBalance');
const LeavePolicyModel = require('../models/LeavePolicy');
const NotificationModel = require('../models/Notification');
const EmployeeModel = require('../models/Employee');

/**
 * LeaveService
 * 处理请假相关的业务逻辑
 */
class LeaveService {
  /**
   * 获取员工的请假列表
   */
  static async getMyLeaves(employeeId, params) {
    return LeaveRequestModel.findByEmployeeId(employeeId, params);
  }

  /**
   * 获取请假申请详情
   */
  static async getLeaveById(id, employeeId) {
    const leave = await LeaveRequestModel.findById(id);
    if (!leave) {
      throw new Error('请假申请不存在');
    }

    // 验证权限
    if (leave.employee_id !== employeeId) {
      throw new Error('无权访问此请假申请');
    }

    return leave;
  }

  /**
   * 创建请假申请
   */
  static async createLeave(employeeId, data) {
    // 验证员工存在
    const employee = await EmployeeModel.findById(employeeId);
    if (!employee) {
      throw new Error('员工不存在');
    }

    // 获取当前年份
    const year = new Date(data.start_date).getFullYear();

    // 检查余额
    const balance = await LeaveBalanceModel.findByEmployeeTypeYear(
      employeeId,
      data.leave_type,
      year
    );

    if (!balance) {
      throw new Error('您还没有该类型的请假额度，请联系HR');
    }

    const availableDays = parseFloat(balance.total_days) +
                          parseFloat(balance.carryover_days) -
                          parseFloat(balance.used_days);

    if (availableDays < data.days) {
      throw new Error(`可用余额不足，当前可用 ${availableDays} 天`);
    }

    // 检查日期冲突
    const conflicts = await LeaveRequestModel.findByDateRange(
      employeeId,
      data.start_date,
      data.end_date
    );

    if (conflicts.length > 0) {
      throw new Error('该日期范围内已有待审批或已批准的请假申请');
    }

    // 创建申请
    const leave = await LeaveRequestModel.create({
      employee_id: employeeId,
      leave_type: data.leave_type,
      start_date: data.start_date,
      end_date: data.end_date,
      days: data.days,
      reason: data.reason,
    });

    // 通知经理
    if (employee.manager_id) {
      const manager = await EmployeeModel.findById(employee.manager_id);
      if (manager) {
        await NotificationModel.create({
          user_id: manager.id,
          type: 'leave_request',
          title: '有待审批的请假申请',
          message: `${employee.name} 提交了${this.getLeaveTypeName(data.leave_type)}请假申请`,
          link: `/manager/approvals`,
        });
      }
    }

    return leave;
  }

  /**
   * 撤回请假申请
   */
  static async cancelLeave(id, employeeId) {
    const leave = await LeaveRequestModel.findById(id);
    if (!leave) {
      throw new Error('请假申请不存在');
    }

    if (leave.employee_id !== employeeId) {
      throw new Error('无权操作此请假申请');
    }

    if (leave.status !== 'pending') {
      throw new Error('只能撤回待审批的申请');
    }

    return LeaveRequestModel.cancel(id, employeeId);
  }

  /**
   * 获取待审批列表 (经理)
   */
  static async getPendingApprovals(managerId) {
    // 验证经理身份
    const manager = await EmployeeModel.findById(managerId);
    if (!manager || (manager.role !== 'manager' && manager.role !== 'hr')) {
      throw new Error('您没有审批权限');
    }

    return LeaveRequestModel.findPendingForApproval(managerId);
  }

  /**
   * 审批请假申请
   */
  static async approveLeave(id, approverId) {
    const leave = await LeaveRequestModel.findById(id);
    if (!leave) {
      throw new Error('请假申请不存在');
    }

    if (leave.status !== 'pending') {
      throw new Error('只能审批待审批的申请');
    }

    // 验证审批人权限
    const approver = await EmployeeModel.findById(approverId);
    const employee = await EmployeeModel.findById(leave.employee_id);

    if (!approver) {
      throw new Error('审批人不存在');
    }

    // HR 可以审批所有人，经理只能审批团队成员
    if (approver.role !== 'hr' && employee.manager_id !== approverId) {
      throw new Error('您无权审批此申请');
    }

    // 更新请假状态
    const approved = await LeaveRequestModel.approve(id, approverId);

    if (approved) {
      // 扣减余额
      const year = new Date(leave.start_date).getFullYear();
      await LeaveBalanceModel.addUsedDays(
        leave.employee_id,
        leave.leave_type,
        year,
        leave.days
      );

      // 通知申请人
      await NotificationModel.createLeaveNotification(
        { employee_id: leave.employee_id, id, leave_type: leave.leave_type },
        'approved'
      );
    }

    return approved;
  }

  /**
   * 拒绝请假申请
   */
  static async rejectLeave(id, approverId, reason) {
    if (!reason || reason.trim() === '') {
      throw new Error('请填写拒绝原因');
    }

    const leave = await LeaveRequestModel.findById(id);
    if (!leave) {
      throw new Error('请假申请不存在');
    }

    if (leave.status !== 'pending') {
      throw new Error('只能拒绝待审批的申请');
    }

    // 验证审批人权限
    const approver = await EmployeeModel.findById(approverId);
    const employee = await EmployeeModel.findById(leave.employee_id);

    if (!approver) {
      throw new Error('审批人不存在');
    }

    if (approver.role !== 'hr' && employee.manager_id !== approverId) {
      throw new Error('您无权审批此申请');
    }

    const rejected = await LeaveRequestModel.reject(id, approverId, reason);

    if (rejected) {
      // 通知申请人
      await NotificationModel.createLeaveNotification(
        { employee_id: leave.employee_id, id, leave_type: leave.leave_type },
        'rejected'
      );
    }

    return rejected;
  }

  /**
   * 获取团队请假列表 (经理)
   */
  static async getTeamLeaves(managerId, params) {
    const manager = await EmployeeModel.findById(managerId);
    if (!manager || (manager.role !== 'manager' && manager.role !== 'hr')) {
      throw new Error('您没有权限查看团队请假');
    }

    return LeaveRequestModel.findByTeam(managerId, params);
  }

  /**
   * 获取团队日历 (经理)
   */
  static async getTeamCalendar(managerId, startDate, endDate) {
    const manager = await EmployeeModel.findById(managerId);
    if (!manager || (manager.role !== 'manager' && manager.role !== 'hr')) {
      throw new Error('您没有权限查看团队日历');
    }

    return LeaveRequestModel.findTeamByDateRange(managerId, startDate, endDate);
  }

  /**
   * 获取请假余额
   */
  static async getBalances(employeeId) {
    const balances = await LeaveBalanceModel.getCurrentBalances(employeeId);
    return balances.map(balance => ({
      type: balance.leave_type,
      total: parseFloat(balance.total_days),
      used: parseFloat(balance.used_days),
      carryover: parseFloat(balance.carryover_days),
      available: parseFloat(balance.total_days) +
                 parseFloat(balance.carryover_days) -
                 parseFloat(balance.used_days),
    }));
  }

  /**
   * 获取请假类型名称
   */
  static getLeaveTypeName(type) {
    const names = {
      annual: '年假',
      sick: '病假',
      personal: '事假',
      other: '其他',
    };
    return names[type] || type;
  }

  /**
   * 获取所有请假类型
   */
  static getLeaveTypes() {
    return [
      { value: 'annual', label: '年假' },
      { value: 'sick', label: '病假' },
      { value: 'personal', label: '事假' },
      { value: 'other', label: '其他' },
    ];
  }

  /**
   * 计算请假天数 (考虑周末)
   */
  static calculateDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let days = 0;

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        days++;
      }
    }

    return days;
  }
}

module.exports = LeaveService;
