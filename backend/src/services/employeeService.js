const EmployeeModel = require('../models/Employee');
const { hashPassword } = require('../utils/password');

/**
 * EmployeeService
 * 处理员工相关的业务逻辑
 */
class EmployeeService {
  /**
   * 获取员工个人资料
   */
  static async getProfile(employeeId) {
    const employee = await EmployeeModel.getProfile(employeeId);
    if (!employee) {
      throw new Error('员工不存在');
    }
    return employee;
  }

  /**
   * 更新个人资料
   */
  static async updateProfile(employeeId, data) {
    // 验证员工存在
    const existing = await EmployeeModel.findById(employeeId);
    if (!existing) {
      throw new Error('员工不存在');
    }

    // 过滤可更新字段
    const updateData = {};
    const allowedFields = ['phone', 'emergency_contact', 'emergency_phone'];
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return existing;
    }

    return EmployeeModel.updateProfile(employeeId, updateData);
  }

  /**
   * 创建新员工
   */
  static async createEmployee(data) {
    // 验证邮箱唯一性
    const existingByEmail = await EmployeeModel.findByEmail(data.email);
    if (existingByEmail) {
      throw new Error('邮箱已被使用');
    }

    // 验证员工编号唯一性
    if (data.employee_no) {
      const existingByNo = await EmployeeModel.findByEmployeeNo(data.employee_no);
      if (existingByNo) {
        throw new Error('员工编号已存在');
      }
    }

    // 密码加密
    if (data.password) {
      data.password_hash = await hashPassword(data.password);
      delete data.password;
    }

    return EmployeeModel.create(data);
  }

  /**
   * 更新员工信息
   */
  static async updateEmployee(id, data) {
    // 验证员工存在
    const existing = await EmployeeModel.findById(id);
    if (!existing) {
      throw new Error('员工不存在');
    }

    // 如果更新邮箱，检查唯一性
    if (data.email && data.email !== existing.email) {
      const existingByEmail = await EmployeeModel.findByEmail(data.email);
      if (existingByEmail) {
        throw new Error('邮箱已被使用');
      }
    }

    return EmployeeModel.update(id, data);
  }

  /**
   * 删除员工 (软删除)
   */
  static async deleteEmployee(id) {
    const existing = await EmployeeModel.findById(id);
    if (!existing) {
      throw new Error('员工不存在');
    }

    return EmployeeModel.delete(id);
  }

  /**
   * 获取所有员工列表 (HR)
   */
  static async getAllEmployees(params) {
    return EmployeeModel.findAll(params);
  }

  /**
   * 根据 ID 获取员工 (公开信息)
   */
  static async getEmployeePublic(id) {
    const employee = await EmployeeModel.findById(id);
    if (!employee) {
      return null;
    }

    // 返回公开信息
    return {
      id: employee.id,
      name: employee.name,
      employee_no: employee.employee_no,
      department_name: employee.department_name,
      position_title: employee.position_title,
      avatar_url: employee.avatar_url,
    };
  }

  /**
   * 获取团队成员列表 (经理)
   */
  static async getTeamMembers(managerId) {
    return EmployeeModel.findByManager(managerId);
  }

  /**
   * 验证员工是否为指定经理的团队成员
   */
  static async isTeamMember(employeeId, managerId) {
    const employee = await EmployeeModel.findById(employeeId);
    return employee && employee.manager_id === managerId;
  }

  /**
   * 更改员工密码
   */
  static async changePassword(employeeId, currentPassword, newPassword) {
    const employee = await EmployeeModel.findById(employeeId);
    if (!employee) {
      throw new Error('员工不存在');
    }

    const { verifyPassword } = require('../utils/password');
    const isValid = await verifyPassword(currentPassword, employee.password_hash);
    if (!isValid) {
      throw new Error('当前密码错误');
    }

    const newHash = await hashPassword(newPassword);
    return EmployeeModel.update(employeeId, { password_hash: newHash });
  }
}

module.exports = EmployeeService;
