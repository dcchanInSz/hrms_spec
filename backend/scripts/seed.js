require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'hr_system',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

async function seed() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 创建默认部门
    const deptResult = await client.query(`
      INSERT INTO departments (name, code, description) VALUES
      ('人力资源部', 'HR', '负责公司人事管理'),
      ('技术部', 'TECH', '负责产品研发和技术支持'),
      ('市场部', 'MKT', '负责市场营销和品牌推广'),
      ('财务部', 'FIN', '负责公司财务管理')
      ON CONFLICT (code) DO NOTHING
      RETURNING id, code;
    `);
    console.log('Departments created');

    // 获取部门ID
    const departments = await client.query('SELECT id, code FROM departments');
    const deptMap = {};
    departments.rows.forEach(row => {
      deptMap[row.code] = row.id;
    });

    // 创建默认职位
    await client.query(`
      INSERT INTO positions (title, code, level, department_id) VALUES
      ('HR 经理', 'HR_MGR', 3, $1),
      ('HR 专员', 'HR_SPEC', 1, $1),
      ('技术总监', 'TECH_DIR', 4, $2),
      ('高级工程师', 'SENIOR_ENG', 3, $2),
      ('工程师', 'ENG', 2, $2),
      ('市场总监', 'MKT_DIR', 4, $3),
      ('市场专员', 'MKT_SPEC', 2, $3),
      ('财务总监', 'FIN_DIR', 4, $4),
      ('会计', 'ACCOUNTANT', 2, $4)
      ON CONFLICT (code) DO NOTHING
    `, [deptMap['HR'], deptMap['TECH'], deptMap['MKT'], deptMap['FIN']]);
    console.log('Positions created');

    // 获取职位ID
    const positions = await client.query('SELECT id, code FROM positions');
    const posMap = {};
    positions.rows.forEach(row => {
      posMap[row.code] = row.id;
    });

    // 创建默认密码哈希
    const passwordHash = await bcrypt.hash('password123', 10);

    // 创建默认用户
    await client.query(`
      INSERT INTO employees (employee_no, name, email, password_hash, department_id, position_id, hire_date, role) VALUES
      ('EMP001', '系统管理员', 'admin@company.com', $1, $2, $3, '2020-01-01', 'hr'),
      ('EMP002', '张伟', 'zhangwei@company.com', $1, $4, $5, '2020-03-15', 'hr'),
      ('EMP003', '李明', 'liming@company.com', $1, $6, $7, '2021-06-01', 'manager'),
      ('EMP004', '王芳', 'wangfang@company.com', $1, $6, $8, '2022-01-10', 'employee'),
      ('EMP005', '刘强', 'liuqiang@company.com', $1, $6, $9, '2022-03-20', 'employee')
      ON CONFLICT (email) DO NOTHING
    `, [passwordHash, deptMap['HR'], posMap['HR_MGR'], deptMap['HR'], posMap['HR_SPEC'],
        deptMap['TECH'], posMap['SENIOR_ENG'], posMap['ENG'], posMap['ENG']]);
    console.log('Employees created');

    // 设置经理关系
    await client.query(`
      UPDATE employees SET manager_id = e.id
      FROM employees e
      WHERE employees.employee_no = 'EMP004' AND e.employee_no = 'EMP003';
    `);

    await client.query(`
      UPDATE employees SET manager_id = e.id
      FROM employees e
      WHERE employees.employee_no = 'EMP005' AND e.employee_no = 'EMP003';
    `);

    // 更新部门经理
    await client.query(`
      UPDATE departments SET manager_id = e.id
      FROM employees e
      WHERE departments.code = 'HR' AND e.employee_no = 'EMP002';
    `);

    await client.query(`
      UPDATE departments SET manager_id = e.id
      FROM employees e
      WHERE departments.code = 'TECH' AND e.employee_no = 'EMP003';
    `);

    // 创建请假政策
    await client.query(`
      INSERT INTO leave_policies (leave_type, name, default_days, carryover_limit, requires_approval, advance_notice_days) VALUES
      ('annual', '年假', 10, 5, TRUE, 3),
      ('sick', '病假', 10, 0, TRUE, 0),
      ('personal', '事假', 5, 0, TRUE, 2),
      ('other', '其他', 3, 0, TRUE, 5)
      ON CONFLICT (leave_type) DO NOTHING
    `);
    console.log('Leave policies created');

    // 为员工创建年度余额
    await client.query(`
      INSERT INTO leave_balances (employee_id, leave_type, year, total_days, used_days, carryover_days)
      SELECT e.id, lp.leave_type, 2025, lp.default_days, 0, 0
      FROM employees e
      CROSS JOIN leave_policies lp
      ON CONFLICT (employee_id, leave_type, year) DO NOTHING
    `);
    console.log('Leave balances created');

    await client.query('COMMIT');
    console.log('Seed completed successfully');
    console.log('\nDefault login credentials:');
    console.log('  Admin: admin@company.com / password123');
    console.log('  HR: zhangwei@company.com / password123');
    console.log('  Manager: liming@company.com / password123');
    console.log('  Employee: wangfang@company.com / password123');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', e);
    throw e;
  } finally {
    client.release();
    pool.end();
  }
}

seed().catch(console.error);
