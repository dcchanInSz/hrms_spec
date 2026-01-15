const { query } = require('../models/db');

/**
 * Position 数据模型
 * 提供职位相关的数据库操作
 */
class PositionModel {
  /**
   * 根据 ID 查询职位
   */
  static async findById(id) {
    const result = await query(
      `SELECT p.*, d.name as department_name
       FROM positions p
       LEFT JOIN departments d ON p.department_id = d.id
       WHERE p.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * 根据编码查询职位
   */
  static async findByCode(code) {
    const result = await query(
      'SELECT * FROM positions WHERE code = $1',
      [code]
    );
    return result.rows[0] || null;
  }

  /**
   * 获取所有职位
   */
  static async findAll(params = {}) {
    const { department_id, is_active = true, level } = params;

    const where = [];
    const values = [];
    let paramIndex = 1;

    if (is_active !== undefined) {
      where.push(`p.is_active = $${paramIndex++}`);
      values.push(is_active);
    }

    if (department_id) {
      where.push(`p.department_id = $${paramIndex++}`);
      values.push(department_id);
    }

    if (level) {
      where.push(`p.level = $${paramIndex++}`);
      values.push(level);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const result = await query(
      `SELECT p.*, d.name as department_name
       FROM positions p
       LEFT JOIN departments d ON p.department_id = d.id
       ${whereClause}
       ORDER BY p.level, p.title`,
      values
    );

    return result.rows;
  }

  /**
   * 获取所有活跃职位 (简化查询)
   */
  static async findAllActive() {
    const result = await query(
      `SELECT p.*, d.name as department_name
       FROM positions p
       LEFT JOIN departments d ON p.department_id = d.id
       WHERE p.is_active = true
       ORDER BY p.level, p.title`,
      []
    );
    return result.rows;
  }

  /**
   * 根据部门获取职位
   */
  static async findByDepartment(departmentId) {
    const result = await query(
      `SELECT p.*, d.name as department_name
       FROM positions p
       LEFT JOIN departments d ON p.department_id = d.id
       WHERE p.department_id = $1 AND p.is_active = true
       ORDER BY p.level, p.title`,
      [departmentId]
    );
    return result.rows;
  }

  /**
   * 获取职位层级
   */
  static async findByLevel(level) {
    const result = await query(
      `SELECT p.*, d.name as department_name
       FROM positions p
       LEFT JOIN departments d ON p.department_id = d.id
       WHERE p.level = $1 AND p.is_active = true
       ORDER BY p.title`,
      [level]
    );
    return result.rows;
  }

  /**
   * 创建职位
   */
  static async create(data) {
    const { title, code, level, department_id, description, salary_min, salary_max } = data;

    const result = await query(
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
  static async update(id, data) {
    const { title, code, level, department_id, description, salary_min, salary_max, is_active } = data;

    const result = await query(
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
   * 删除职位 (软删除)
   */
  static async delete(id) {
    const result = await query(
      `UPDATE positions SET is_active = false, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * 检查职位是否有员工
   */
  static async hasEmployees(id) {
    const result = await query(
      'SELECT id FROM employees WHERE position_id = $1 LIMIT 1',
      [id]
    );
    return result.rows.length > 0;
  }

  /**
   * 获取职位薪资范围
   */
  static async getSalaryRange(id) {
    const result = await query(
      'SELECT salary_min, salary_max FROM positions WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }
}

module.exports = PositionModel;
