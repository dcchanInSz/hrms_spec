const { query } = require('../models/db');

/**
 * Employee 数据模型
 * 提供员工相关的数据库操作
 */
class EmployeeModel {
  /**
   * 根据 ID 查询员工
   */
  static async findById(id) {
    const result = await query(
      `SELECT e.*, d.name as department_name, p.title as position_title
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN positions p ON e.position_id = p.id
       WHERE e.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * 根据邮箱查询员工
   */
  static async findByEmail(email) {
    const result = await query(
      'SELECT * FROM employees WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  /**
   * 根据员工编号查询
   */
  static async findByEmployeeNo(employeeNo) {
    const result = await query(
      'SELECT * FROM employees WHERE employee_no = $1',
      [employeeNo]
    );
    return result.rows[0] || null;
  }

  /**
   * 获取当前用户的个人资料 (不包含敏感信息)
   */
  static async getProfile(id) {
    const result = await query(
      `SELECT e.id, e.employee_no, e.name, e.email, e.phone,
              e.emergency_contact, e.emergency_phone, e.hire_date,
              e.status, e.role, e.avatar_url, e.department_id,
              d.name as department_name, p.title as position_title,
              m.id as manager_id, m.name as manager_name
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN positions p ON e.position_id = p.id
       LEFT JOIN employees m ON e.manager_id = m.id
       WHERE e.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * 更新个人资料
   */
  static async updateProfile(id, data) {
    const { phone, emergency_contact, emergency_phone } = data;

    const result = await query(
      `UPDATE employees
       SET phone = COALESCE($2, phone),
           emergency_contact = COALESCE($3, emergency_contact),
           emergency_phone = COALESCE($4, emergency_phone),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id, phone, emergency_contact, emergency_phone]
    );

    return result.rows[0] || null;
  }

  /**
   * 根据经理 ID 查询团队成员
   */
  static async findByManager(managerId) {
    const result = await query(
      `SELECT e.*, d.name as department_name, p.title as position_title
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN positions p ON e.position_id = p.id
       WHERE e.manager_id = $1 AND e.status = 'active'
       ORDER BY e.name`,
      [managerId]
    );
    return result.rows;
  }

  /**
   * 查询所有员工 (HR 功能)
   */
  static async findAll(params = {}) {
    const { department_id, status, role, search, page = 1, limit = 20 } = params;
    const offset = (page - 1) * limit;

    let where = [];
    let values = [];
    let paramIndex = 1;

    if (department_id) {
      where.push(`e.department_id = $${paramIndex++}`);
      values.push(department_id);
    }

    if (status) {
      where.push(`e.status = $${paramIndex++}`);
      values.push(status);
    }

    if (role) {
      where.push(`e.role = $${paramIndex++}`);
      values.push(role);
    }

    if (search) {
      where.push(`(e.name ILIKE $${paramIndex} OR e.email ILIKE $${paramIndex} OR e.employee_no ILIKE $${paramIndex})`);
      values.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    // 查询数据
    const dataResult = await query(
      `SELECT e.*, d.name as department_name, p.title as position_title
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN positions p ON e.position_id = p.id
       ${whereClause}
       ORDER BY e.created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...values, limit, offset]
    );

    // 查询总数
    const countResult = await query(
      `SELECT COUNT(*) FROM employees e ${whereClause}`,
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
   * 创建新员工
   */
  static async create(data) {
    const {
      employee_no,
      name,
      email,
      password_hash,
      phone,
      department_id,
      position_id,
      manager_id,
      hire_date,
      role = 'employee',
    } = data;

    const result = await query(
      `INSERT INTO employees
       (employee_no, name, email, password_hash, phone, department_id,
        position_id, manager_id, hire_date, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [employee_no, name, email, password_hash, phone, department_id,
        position_id, manager_id, hire_date, role]
    );

    return result.rows[0];
  }

  /**
   * 更新员工信息
   */
  static async update(id, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const allowedFields = [
      'name', 'email', 'phone', 'department_id', 'position_id',
      'manager_id', 'hire_date', 'termination_date', 'status', 'role'
    ];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = $${paramIndex++}`);
        values.push(data[field]);
      }
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE employees SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  /**
   * 根据经理 ID 查询团队成员 (别名方法)
   */
  static async findByManagerId(managerId) {
    return EmployeeModel.findByManager(managerId);
  }

  /**
   * 根据状态查询员工
   */
  static async findByStatus(status) {
    const result = await query(
      `SELECT e.*, d.name as department_name, p.title as position_title
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN positions p ON e.position_id = p.id
       WHERE e.status = $1
       ORDER BY e.name`,
      [status]
    );
    return result.rows;
  }

  /**
   * 删除员工 (软删除 - 更新状态)
   */
  static async delete(id) {
    const result = await query(
      `UPDATE employees SET status = 'inactive', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0] || null;
  }
}

module.exports = EmployeeModel;
