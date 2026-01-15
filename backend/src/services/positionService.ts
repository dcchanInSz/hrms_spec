import { query } from '../models/db';
import { QueryResult } from 'pg';

/**
 * PositionService
 * 处理职位相关的业务逻辑
 */
class PositionService {
  /**
   * 获取所有职位
   */
  static async getAllPositions(params: any = {}): Promise<any[]> {
    const { department_id, is_active = true } = params;

    let sql = `
      SELECT p.*, d.name as department_name
      FROM positions p
      LEFT JOIN departments d ON p.department_id = d.id
      WHERE p.is_active = $1
    `;
    const values: any[] = [is_active];
    let paramIndex = 2;

    if (department_id) {
      sql += ` AND p.department_id = $${paramIndex++}`;
      values.push(department_id);
    }

    sql += ' ORDER BY p.level, p.title';

    const result: QueryResult = await query(sql, values);
    return result.rows;
  }

  /**
   * 获取职位详情
   */
  static async getPositionById(id: string | number): Promise<any> {
    const result: QueryResult = await query(
      `SELECT p.*, d.name as department_name
       FROM positions p
       LEFT JOIN departments d ON p.department_id = d.id
       WHERE p.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * 创建职位
   */
  static async createPosition(data: any): Promise<any> {
    const { title, code, level, department_id, description, salary_min, salary_max } = data;

    // 检查编码是否唯一
    if (code) {
      const existing: QueryResult = await query(
        'SELECT id FROM positions WHERE code = $1',
        [code]
      );
      if (existing.rows.length > 0) {
        throw new Error('职位编码已存在');
      }
    }

    const result: QueryResult = await query(
      `INSERT INTO positions (title, code, level, department_id, description, salary_min, salary_max)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, code, level || 1, department_id, description, salary_min, salary_max]
    );

    return result.rows[0];
  }

  /**
   * 更新职位
   */
  static async updatePosition(id: string | number, data: any): Promise<any> {
    const { title, code, level, department_id, description, salary_min, salary_max, is_active } = data;

    // 检查编码是否唯一
    if (code) {
      const existing: QueryResult = await query(
        'SELECT id FROM positions WHERE code = $1 AND id != $2',
        [code, id]
      );
      if (existing.rows.length > 0) {
        throw new Error('职位编码已存在');
      }
    }

    const result: QueryResult = await query(
      `UPDATE positions
       SET title = COALESCE($2, title),
           code = COALESCE($3, code),
           level = COALESCE($4, level),
           department_id = COALESCE($5, department_id),
           description = COALESCE($6, description),
           salary_min = COALESCE($7, salary_min),
           salary_max = COALESCE($8, salary_max),
           is_active = COALESCE($9, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id, title, code, level, department_id, description, salary_min, salary_max, is_active]
    );

    return result.rows[0] || null;
  }

  /**
   * 删除职位
   */
  static async deletePosition(id: string | number): Promise<any> {
    // 检查是否有员工
    const employees: QueryResult = await query(
      'SELECT id FROM employees WHERE position_id = $1',
      [id]
    );

    if (employees.rows.length > 0) {
      throw new Error('无法删除：该职位下有员工');
    }

    // 软删除
    const result: QueryResult = await query(
      `UPDATE positions SET is_active = false, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 RETURNING *`,
      [id]
    );

    return result.rows[0];
  }
}

export default PositionService;
