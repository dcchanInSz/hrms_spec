import LeaveRequestModel from '../models/LeaveRequest';
import LeaveBalanceModel from '../models/LeaveBalance';
import LeavePolicyModel from '../models/LeavePolicy';
import NotificationModel from '../models/Notification';
import EmployeeModel from '../models/Employee';

/**
 * LeaveService
 * 处理请假相关的业务逻辑
 */
class LeaveService {
  /**
   * 获取员工的请假列表
   */
  static async getMyLeaves(employeeId: string | number, params: any): Promise<any> {
    return LeaveRequestModel.findByEmployeeId(employeeId, params);
  }

  /**
   * 获取请假申请详情
   */
  static async getLeaveById(id: string | number, employeeId: string | number): Promise<any> {
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
  static async createLeave(employeeId: string | number, data: any): Promise<any> {
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
  static async cancelLeave(id: string | number, employeeId: string | number): Promise<any> {
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
   * 获取请假类型列表
   */
  static async getLeaveTypes(): Promise<any[]> {
    return [
      { value: 'annual', label: '年假' },
      { value: 'sick', label: '病假' },
      { value: 'personal', label: '事假' },
      { value: 'maternity', label: '产假' },
      { value: 'paternity', label: '陪产假' },
      { value: 'bereavement', label: '丧假' },
      { value: 'study', label: '学习假' },
      { value: 'unpaid', label: '无薪假' },
    ];
  }

  /**
   * 获取请假余额
   */
  static async getBalance(employeeId: string | number): Promise<any[]> {
    const balances = await LeaveBalanceModel.getCurrentBalances(employeeId);
    return balances;
  }

  /**
   * 获取请假政策
   */
  static async getPolicies(): Promise<any[]> {
    return LeavePolicyModel.findAll();
  }

  /**
   * 获取请假类型名称
   */
  private static getLeaveTypeName(type: string): string {
    const typeMap: any = {
      annual: '年假',
      sick: '病假',
      personal: '事假',
      maternity: '产假',
      paternity: '陪产假',
      unpaid: '无薪假',
    };
    return typeMap[type] || type;
  }

  /**
   * 获取待审批列表 (经理)
   */
  static async getPendingApprovals(managerId: string | number): Promise<any[]> {
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
  static async approveLeave(id: string | number, approverId: string | number): Promise<any> {
    const leave = await LeaveRequestModel.findById(id);
    if (!leave) {
      throw new Error('请假申请不存在');
    }

    if (leave.status !== 'pending') {
      throw new Error('只能审批待审批的申请');
    }

    // 更新请假申请状态
    const updatedLeave = await LeaveRequestModel.approve(id, approverId);

    // 更新请假余额
    const year = new Date(leave.start_date).getFullYear();
    await LeaveBalanceModel.addUsedDays(
      leave.employee_id,
      leave.leave_type,
      year,
      leave.days
    );

    // 通知员工
    await NotificationModel.createLeaveNotification(updatedLeave, 'approved');

    return updatedLeave;
  }

  /**
   * 拒绝请假申请
   */
  static async rejectLeave(id: string | number, approverId: string | number, rejectionReason: string): Promise<any> {
    const leave = await LeaveRequestModel.findById(id);
    if (!leave) {
      throw new Error('请假申请不存在');
    }

    if (leave.status !== 'pending') {
      throw new Error('只能拒绝待审批的申请');
    }

    // 更新请假申请状态
    const updatedLeave = await LeaveRequestModel.reject(id, approverId, rejectionReason);

    // 通知员工
    await NotificationModel.createLeaveNotification(updatedLeave, 'rejected');

    return updatedLeave;
  }

  /**
   * 获取团队成员的请假列表
   */
  static async getTeamLeaves(managerId: string | number, params: any): Promise<any> {
    return LeaveRequestModel.findByTeam(managerId, params);
  }

  /**
   * 获取请假类型名称
   */
  private static getLeaveTypeName(type: string): string {
    const typeMap: any = {
      annual: '年假',
      sick: '病假',
      personal: '事假',
      maternity: '产假',
      paternity: '陪产假',
      unpaid: '无薪假',
    };
    return typeMap[type] || type;
  }
}

export default LeaveService;
