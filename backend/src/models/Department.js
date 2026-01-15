const { query } = require('../models/db');

/**
 * Department 数据模型
 * 提供部门相关的数据库操作
 */
class DepartmentModel {
  /**
   * 根据 ID 查询部门
   */
  static async findById(id) {
    const result = await query(
      `SELECT d.*, m.name as manager_name,
              (SELECT name FROM departments WHERE id = d.parent_id) as parent_name
       FROM departments d
       LEFT JOIN employees m ON d.manager_id = m.id
       WHERE d.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * 根据编码查询部门
   */
  static async findByCode(code) {
    const result = await query(
      'SELECT * FROM departments WHERE code = $1',
      [code]
    );
    return result.rows[0] || null;
  }

  /**
   * 获取所有部门
   */
  static async findAll(params = {}) {
    const { is_active, parent_id, search } = params;

    const where = [];
    const values = [];
    let paramIndex = 1;

    if (is_active !== undefined) {
      where.push(`d.is_active = $${paramIndex++}`);
      values.push(is_active);
    }

    if (parent_id !== undefined) {
      if (parent_id === null) {
        where.push('d.parent_id IS NULL');
      } else {
        where.push(`d.parent_id = $${paramIndex++}`);
        values.push(parent_id);
      }
    }

    if (search) {
      where.push(`(d.name ILIKE $${paramIndex} OR d.code ILIKE $${paramIndex})`);
      values.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const result = await query(
      `SELECT d.*, m.name as manager_name
       FROM departments d
       LEFT JOIN employees m ON d.manager_id = m.id
       ${whereClause}
       ORDER BY d.sort_order, d.name`,
      values
    );

    return result.rows;
  }

  /**
   * 获取直接子部门
   */
  static async findChildren(parentId) {
    const result = await query(
      `SELECT d.*, m.name as manager_name
       FROM departments d
       LEFT JOIN employees m ON d.manager_id = m.id
       WHERE d.parent_id = $1
       ORDER BY d.sort_order, d.name`,
      [parentId]
    );
    return result.rows;
  }

  /**
   * 获取所有活跃部门 (简化查询)
   */
  static async findAllActive() {
    const result = await query(
      `SELECT d.*, m.name as manager_name
       FROM departments d
       LEFT JOIN employees m ON d.manager_id = m.id
       WHERE d.is_active = true
       ORDER BY d.sort_order, d.name`,
      []
    );
    return result.rows;
  }

  /**
   * 创建部门
   */
  static async create(data) {
    const { name, code, description, parent_id, manager_id, sort_order } = data;

    const result = await query(
      `INSERT INTO departments (name, code, description, parent_id, manager_id, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, code, description, parent_id, manager_id, sort_order || 0]
    );

    return result.rows[0];
  }

  /**
   * 更新部门
   */
  static async update(id, data) {
    const { name, code, description, parent_id, manager_id, sort_order, is_active } = data;

    const result = await query(
      `UPDATE departments
       SET name = COALESCE($2, name),
           code = COALESCE($3, code),
           description = COALESCE($4, description),
           parent_id = COALESCE($5, parent_id),
           manager_id = COALESCE($6, manager_id),
           sort_order = COALESCE($7, sort_order),
           is_active = COALESCE($8, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id, name, code, description, parent_id, manager_id, sort_order, is_active]
    );

    return result.rows[0] || null;
  }

  /**
   * 删除部门 (软删除)
   */
  static async delete(id) {
    const result = await query(
      `UPDATE departments SET is_active = false, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * 检查部门是否有子部门
   */
  static async hasChildren(id) {
    const result = await query(
      'SELECT id FROM departments WHERE parent_id = $1 LIMIT 1',
      [id]
    );
    return result.rows.length > 0;
  }

  /**
   * 检查部门是否有员工
   */
  static async hasEmployees(id) {
    const result = await query(
      'SELECT id FROM employees WHERE department_id = $1 LIMIT 1',
      [id]
    );
    return result.rows.length > 0;
  }

  /**
   * 获取部门经理
   */
  static async getManager(id) {
    const result = await query(
      `SELECT e.*, d.name as department_name, p.title as position_title
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN positions p ON e.position_id = p.id
       WHERE e.id = (SELECT manager_id FROM departments WHERE id = $1)`,
      [id]
    );
    return result.rows[0] || null;
  }
}

module.exports = DepartmentModel;
