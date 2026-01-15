import EmployeeModel from '../models/Employee';
import { hashPassword } from '../utils/password';

/**
 * EmployeeService
 * 处理员工相关的业务逻辑
 */
class EmployeeService {
  /**
   * 获取员工个人资料
   */
  static async getProfile(employeeId: string | number): Promise<any> {
    const employee = await EmployeeModel.getProfile(employeeId);
    if (!employee) {
      throw new Error('员工不存在');
    }
    return employee;
  }

  /**
   * 更新个人资料
   */
  static async updateProfile(employeeId: string | number, data: any): Promise<any> {
    // 验证员工存在
    const existing = await EmployeeModel.findById(employeeId);
    if (!existing) {
      throw new Error('员工不存在');
    }

    // 过滤可更新字段
    const updateData: any = {};
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
  static async createEmployee(data: any): Promise<any> {
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
  static async updateEmployee(id: string | number, data: any): Promise<any> {
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
  static async deleteEmployee(id: string | number): Promise<any> {
    const existing = await EmployeeModel.findById(id);
    if (!existing) {
      throw new Error('员工不存在');
    }

    return EmployeeModel.delete(id);
  }

  /**
   * 获取员工列表
   */
  static async getEmployees(params: any = {}): Promise<any> {
    return EmployeeModel.findAll(params);
  }

  /**
   * 根据 ID 获取员工
   */
  static async getEmployeeById(id: string | number): Promise<any> {
    const employee = await EmployeeModel.findById(id);
    if (!employee) {
      throw new Error('员工不存在');
    }
    return employee;
  }

  /**
   * 根据邮箱获取员工
   */
  static async getEmployeeByEmail(email: string): Promise<any> {
    return EmployeeModel.findByEmail(email);
  }

  /**
   * 获取团队成员
   */
  static async getTeamMembers(managerId: string | number): Promise<any[]> {
    return EmployeeModel.findByManager(managerId);
  }

  /**
   * 根据状态获取员工
   */
  static async getEmployeesByStatus(status: string): Promise<any[]> {
    return EmployeeModel.findByStatus(status);
  }
}

export default EmployeeService;
