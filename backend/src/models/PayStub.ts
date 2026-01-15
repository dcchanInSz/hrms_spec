import { query } from './db';
import { QueryResult } from 'pg';

/**
 * PayStub 数据模型
 * 提供工资单相关的数据库操作
 */
class PayStubModel {
  /**
   * 根据 ID 查询工资单
   */
  static async findById(id: string | number): Promise<any> {
    const result: QueryResult = await query(
      `SELECT ps.*,
              e.name as employee_name, e.employee_no,
              c.name as created_by_name
       FROM pay_stubs ps
       JOIN employees e ON ps.employee_id = e.id
       LEFT JOIN employees c ON ps.created_by = c.id
       WHERE ps.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * 根据员工 ID 查询工资单列表
   */
  static async findByEmployeeId(employeeId: string | number, params: any = {}): Promise<any> {
    const { year, page = 1, limit = 20 } = params;
    const offset = (page - 1) * limit;

    let where: string[] = ['employee_id = $1'];
    let values: any[] = [employeeId];
    let paramIndex = 2;

    if (year) {
      where.push(`EXTRACT(YEAR FROM pay_period_end) = $${paramIndex++}`);
      values.push(year);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    // 查询数据
    const dataResult: QueryResult = await query(
      `SELECT * FROM pay_stubs
       ${whereClause}
       ORDER BY pay_period_end DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...values, limit, offset]
    );

    // 查询总数
    const countResult: QueryResult = await query(
      `SELECT COUNT(*) FROM pay_stubs WHERE employee_id = $1`,
      [employeeId]
    );

    return {
      data: dataResult.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        page,
        limit,
        totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
      },
    };
  }

  /**
   * 查询所有工资单 (HR 功能)
   */
  static async findAll(params: any = {}): Promise<any> {
    const { employee_id, year, page = 1, limit = 20 } = params;
    const offset = (page - 1) * limit;

    let where: string[] = [];
    let values: any[] = [];
    let paramIndex = 1;

    if (employee_id) {
      where.push(`ps.employee_id = $${paramIndex++}`);
      values.push(employee_id);
    }

    if (year) {
      where.push(`EXTRACT(YEAR FROM ps.pay_period_end) = $${paramIndex++}`);
      values.push(year);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    // 查询数据
    const dataResult: QueryResult = await query(
      `SELECT ps.*, e.name as employee_name, e.employee_no
       FROM pay_stubs ps
       JOIN employees e ON ps.employee_id = e.id
       ${whereClause}
       ORDER BY ps.pay_period_end DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...values, limit, offset]
    );

    // 查询总数
    const countResult: QueryResult = await query(
      `SELECT COUNT(*) FROM pay_stubs ps ${whereClause}`,
      values
    );

    return {
      data: dataResult.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        page,
        limit,
        totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
      },
    };
  }

  /**
   * 创建工资单
   */
  static async create(data: any): Promise<any> {
    const {
      employee_id,
      pay_period_start,
      pay_period_end,
      base_salary,
      bonus = 0,
      deduction = 0,
      tax = 0,
      net_salary,
      notes,
      created_by,
    } = data;

    const result: QueryResult = await query(
      `INSERT INTO pay_stubs
       (employee_id, pay_period_start, pay_period_end, base_salary,
        bonus, deduction, tax, net_salary, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [employee_id, pay_period_start, pay_period_end, base_salary,
        bonus, deduction, tax, net_salary, notes, created_by]
    );

    return result.rows[0];
  }

  /**
   * 删除工资单
   */
  static async delete(id: string | number): Promise<any> {
    const result: QueryResult = await query(
      'DELETE FROM pay_stubs WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * 获取员工最近工资单
   */
  static async getLatest(employeeId: string | number): Promise<any> {
    const result: QueryResult = await query(
      `SELECT * FROM pay_stubs
       WHERE employee_id = $1
       ORDER BY pay_period_end DESC
       LIMIT 1`,
      [employeeId]
    );
    return result.rows[0] || null;
  }

  /**
   * 计算年度工资汇总
   */
  static async getYearSummary(employeeId: string | number, year: number): Promise<any> {
    const result: QueryResult = await query(
      `SELECT
         SUM(base_salary) as total_base_salary,
         SUM(bonus) as total_bonus,
         SUM(deduction) as total_deduction,
         SUM(tax) as total_tax,
         SUM(net_salary) as total_net_salary,
         COUNT(*) as month_count
       FROM pay_stubs
       WHERE employee_id = $1
         AND EXTRACT(YEAR FROM pay_period_end) = $2`,
      [employeeId, year]
    );
    return result.rows[0] || null;
  }
}

export default PayStubModel;
