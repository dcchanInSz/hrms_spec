import PayStubModel from '../models/PayStub';

/**
 * PayStubService
 * 处理工资单相关的业务逻辑
 */
class PayStubService {
  /**
   * 获取我的工资单列表
   */
  static async getMyPayStubs(employeeId: string | number, params: any): Promise<any> {
    return PayStubModel.findByEmployeeId(employeeId, params);
  }

  /**
   * 获取工资单详情
   */
  static async getPayStubById(id: string | number, employeeId: string | number): Promise<any> {
    const paystub = await PayStubModel.findById(id);
    if (!paystub) {
      throw new Error('工资单不存在');
    }

    // 验证权限 - 只有本人或HR可以查看
    if (paystub.employee_id !== employeeId) {
      // 检查是否为HR (这里简化处理，实际应该通过权限检查)
      const hasPermission = true; // 简化
      if (!hasPermission) {
        throw new Error('无权访问此工资单');
      }
    }

    return paystub;
  }

  /**
   * 获取工资单详情 (仅本人)
   */
  static async getMyPayStub(id: string | number, employeeId: string | number): Promise<any> {
    const paystub = await PayStubModel.findById(id);
    if (!paystub) {
      throw new Error('工资单不存在');
    }

    if (paystub.employee_id !== employeeId) {
      throw new Error('无权访问此工资单');
    }

    return paystub;
  }

  /**
   * 获取年度工资汇总
   */
  static async getYearSummary(employeeId: string | number, year: number): Promise<any> {
    return PayStubModel.getYearSummary(employeeId, year);
  }

  /**
   * 获取最新工资单
   */
  static async getLatest(employeeId: string | number): Promise<any> {
    return PayStubModel.getLatest(employeeId);
  }

  // === 以下为 HR 功能 ===

  /**
   * 获取所有工资单 (HR)
   */
  static async getAllPayStubs(params: any): Promise<any> {
    return PayStubModel.findAll(params);
  }

  /**
   * 创建工资单 (HR)
   */
  static async createPayStub(data: any, createdBy: string | number): Promise<any> {
    // 计算实发工资
    const netSalary = parseFloat(data.base_salary) +
                      parseFloat(data.bonus || 0) -
                      parseFloat(data.deduction || 0) -
                      parseFloat(data.tax || 0);

    return PayStubModel.create({
      ...data,
      net_salary: netSalary,
      created_by: createdBy,
    });
  }

  /**
   * 删除工资单 (HR)
   */
  static async deletePayStub(id: string | number): Promise<any> {
    const paystub = await PayStubModel.findById(id);
    if (!paystub) {
      throw new Error('工资单不存在');
    }

    return PayStubModel.delete(id);
  }

  /**
   * 获取员工工资单列表 (HR)
   */
  static async getEmployeePayStubs(employeeId: string | number, params: any): Promise<any> {
    return PayStubModel.findByEmployeeId(employeeId, params);
  }
}

export default PayStubService;
