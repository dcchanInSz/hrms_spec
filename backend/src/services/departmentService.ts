import { query } from '../models/db';
import { QueryResult } from 'pg';

/**
 * DepartmentService
 * 处理部门相关的业务逻辑
 */
class DepartmentService {
  /**
   * 获取所有部门
   */
  static async getAllDepartments(): Promise<any[]> {
    const result: QueryResult = await query(
      `SELECT d.*, m.name as manager_name,
              (SELECT name FROM departments WHERE id = d.parent_id) as parent_name
       FROM departments d
       LEFT JOIN employees m ON d.manager_id = m.id
       WHERE d.is_active = true
       ORDER BY d.sort_order, d.name`,
      []
    );
    return result.rows;
  }

  /**
   * 获取部门详情
   */
  static async getDepartmentById(id: string | number): Promise<any> {
    const result: QueryResult = await query(
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
   * 创建部门
   */
  static async createDepartment(data: any): Promise<any> {
    const { name, code, description, parent_id, manager_id, sort_order } = data;

    // 检查编码是否唯一
    if (code) {
      const existing: QueryResult = await query(
        'SELECT id FROM departments WHERE code = $1',
        [code]
      );
      if (existing.rows.length > 0) {
        throw new Error('部门编码已存在');
      }
    }

    const result: QueryResult = await query(
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
  static async updateDepartment(id: string | number, data: any): Promise<any> {
    const { name, code, description, parent_id, manager_id, sort_order, is_active } = data;

    // 检查编码是否唯一
    if (code) {
      const existing: QueryResult = await query(
        'SELECT id FROM departments WHERE code = $1 AND id != $2',
        [code, id]
      );
      if (existing.rows.length > 0) {
        throw new Error('部门编码已存在');
      }
    }

    const result: QueryResult = await query(
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
   * 删除部门
   */
  static async deleteDepartment(id: string | number): Promise<any> {
    // 检查是否有子部门
    const children: QueryResult = await query(
      'SELECT id FROM departments WHERE parent_id = $1',
      [id]
    );

    if (children.rows.length > 0) {
      throw new Error('无法删除：该部门下有子部门');
    }

    // 检查是否有员工
    const employees: QueryResult = await query(
      'SELECT id FROM employees WHERE department_id = $1',
      [id]
    );

    if (employees.rows.length > 0) {
      throw new Error('无法删除：该部门下有员工');
    }

    // 软删除
    const result: QueryResult = await query(
      `UPDATE departments SET is_active = false, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 RETURNING *`,
      [id]
    );

    return result.rows[0];
  }

  /**
   * 获取部门层级树
   */
  static async getDepartmentTree(): Promise<any[]> {
    const result: QueryResult = await query(
      `SELECT id, name, parent_id FROM departments WHERE is_active = true ORDER BY sort_order, name`,
      []
    );

    const buildTree = (parentId: any) => {
      return result.rows
        .filter((d: any) => d.parent_id === parentId)
        .map((d: any) => ({
          ...d,
          children: buildTree(d.id),
        }));
    };

    return buildTree(null);
  }

  /**
   * 获取部门的所有祖先（用于层级验证）
   */
  static async getAncestors(departmentId: string | number): Promise<any[]> {
    const ancestors: any[] = [];
    let currentId = departmentId;

    while (currentId) {
      const result: QueryResult = await query(
        'SELECT id, parent_id FROM departments WHERE id = $1',
        [currentId]
      );

      if (result.rows.length === 0) break;

      const department = result.rows[0];
      if (department.parent_id) {
        ancestors.push(department.parent_id);
        currentId = department.parent_id;
      } else {
        break;
      }
    }

    return ancestors;
  }

  /**
   * 获取部门的所有后代
   */
  static async getDescendants(departmentId: string | number): Promise<any[]> {
    const result: QueryResult = await query(
      `WITH RECURSIVE dept_tree AS (
        SELECT id, name, code, parent_id, manager_id, 1 as level
        FROM departments
        WHERE id = $1
        UNION ALL
        SELECT d.id, d.name, d.code, d.parent_id, d.manager_id, dt.level + 1
        FROM departments d
        INNER JOIN dept_tree dt ON d.parent_id = dt.id
      )
      SELECT * FROM dept_tree WHERE id != $1 ORDER BY level, name`,
      [departmentId]
    );
    return result.rows;
  }

  /**
   * 验证层级结构（防止循环引用）
   */
  static async validateHierarchy(departmentId: string | number, newParentId: string | number | null): Promise<{valid: boolean, message?: string}> {
    // 如果没有设置父部门，或者设置为自己，则无效
    if (!newParentId || newParentId === departmentId) {
      return { valid: true };
    }

    // 检查是否是自身的祖先（循环引用检测）
    const ancestors = await DepartmentService.getAncestors(departmentId);
    if (ancestors.includes(newParentId)) {
      return {
        valid: false,
        message: '无法将部门设置为其自身的子部门（循环引用）',
      };
    }

    return { valid: true };
  }

  /**
   * 检查部门是否在指定层级范围内
   */
  static async isWithinMaxDepth(departmentId: string | number, maxLevel: number = 3): Promise<boolean> {
    const ancestors = await DepartmentService.getAncestors(departmentId);
    return ancestors.length < maxLevel;
  }

  /**
   * 更新审批链
   * 当部门经理变更时，更新相关的审批链信息
   */
  static async updateApprovalChain(departmentId: string | number, newManagerId: string | number | null, operatorId: string | number): Promise<any> {
    // 获取当前部门信息
    const currentDept = await DepartmentService.getDepartmentById(departmentId);
    if (!currentDept) {
      throw new Error('部门不存在');
    }

    const oldManagerId = currentDept.manager_id;

    // 如果经理没有变化，直接返回
    if (oldManagerId === newManagerId) {
      return { updated: false, message: '经理未变更' };
    }

    // 更新部门的经理
    const result: QueryResult = await query(
      `UPDATE departments
       SET manager_id = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [departmentId, newManagerId]
    );

    // 记录审计日志
    // 注意：这里需要导入AuditLogService，但由于循环依赖，使用动态导入
    const AuditLogService = await import('./auditLogService');
    await AuditLogService.default.createLog({
      user_id: operatorId,
      action: 'reassign_manager',
      entity_type: 'department',
      entity_id: departmentId,
      old_value: { manager_id: oldManagerId },
      new_value: { manager_id: newManagerId },
    });

    // 获取该部门下所有需要该经理审批的员工
    const employeesResult: QueryResult = await query(
      `SELECT id, name FROM employees WHERE department_id = $1 AND manager_id = $2 AND status = 'active'`,
      [departmentId, newManagerId]
    );

    return {
      updated: true,
      department: result.rows[0],
      affectedEmployees: employeesResult.rows,
    };
  }

  /**
   * 批量更新子部门的审批链
   * 当父部门经理变更时，递归更新所有子部门中直接汇报给该经理的员工
   */
  static async batchUpdateChildApprovalChains(parentDepartmentId: string | number, oldManagerId: string | number | null, newManagerId: string | number | null, operatorId: string | number): Promise<any> {
    // 获取所有子部门
    const descendants = await DepartmentService.getDescendants(parentDepartmentId);
    const departmentIds = [parentDepartmentId, ...descendants.map((d: any) => d.id)];

    // 统计更新数量
    let totalUpdated = 0;

    for (const deptId of departmentIds) {
      const result: QueryResult = await query(
        `UPDATE employees
         SET manager_id = $3, updated_at = CURRENT_TIMESTAMP
         WHERE department_id = $1 AND manager_id = $2 AND status = 'active'
         RETURNING id`,
        [deptId, oldManagerId, newManagerId]
      );

      if (result.rows.length > 0) {
        // 记录审计日志
        const AuditLogService = await import('./auditLogService');
        await AuditLogService.default.createLog({
          user_id: operatorId,
          action: 'batch_reassign_manager',
          entity_type: 'department',
          entity_id: deptId,
          old_value: { manager_id: oldManagerId },
          new_value: { manager_id: newManagerId },
        });
        totalUpdated += result.rows.length;
      }
    }

    return {
      updated: true,
      departmentCount: departmentIds.length,
      employeeCount: totalUpdated,
    };
  }

  /**
   * 移动部门到新的父部门
   */
  static async moveDepartment(departmentId: string | number, newParentId: string | number | null, operatorId: string | number): Promise<any> {
    // 验证层级
    const validation = await DepartmentService.validateHierarchy(departmentId, newParentId);
    if (!validation.valid) {
      throw new Error(validation.message);
    }

    // 获取当前信息
    const current = await DepartmentService.getDepartmentById(departmentId);
    if (!current) {
      throw new Error('部门不存在');
    }

    // 执行移动
    const result: QueryResult = await query(
      `UPDATE departments
       SET parent_id = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [departmentId, newParentId]
    );

    // 记录审计日志
    const AuditLogService = await import('./auditLogService');
    await AuditLogService.default.createLog({
      user_id: operatorId,
      action: 'move_department',
      entity_type: 'department',
      entity_id: departmentId,
      old_value: { parent_id: current.parent_id },
      new_value: { parent_id: newParentId },
    });

    return {
      moved: true,
      department: result.rows[0],
    };
  }
}

export default DepartmentService;
