require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'hr_system',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

const migrationsDir = path.join(__dirname, '..', 'migrations');

async function migrate() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 创建枚举类型
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE employee_status AS ENUM ('active', 'inactive');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE employee_role AS ENUM ('employee', 'manager', 'hr');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE leave_type AS ENUM ('annual', 'sick', 'personal', 'other');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE leave_status AS ENUM ('pending', 'approved', 'rejected', 'archived');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE notification_type AS ENUM ('leave_request', 'leave_approved', 'leave_rejected', 'system');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Employee 表
    await client.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_no VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        emergency_contact VARCHAR(100),
        emergency_phone VARCHAR(20),
        department_id UUID,
        position_id UUID,
        manager_id UUID REFERENCES employees(id),
        hire_date DATE NOT NULL,
        termination_date DATE,
        status employee_status DEFAULT 'active',
        role employee_role DEFAULT 'employee',
        avatar_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Department 表
    await client.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        code VARCHAR(20) UNIQUE,
        description TEXT,
        parent_id UUID REFERENCES departments(id),
        manager_id UUID REFERENCES employees(id),
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Position 表
    await client.query(`
      CREATE TABLE IF NOT EXISTS positions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(100) NOT NULL,
        code VARCHAR(20) UNIQUE,
        level INTEGER DEFAULT 1,
        department_id UUID REFERENCES departments(id),
        description TEXT,
        salary_min DECIMAL(10,2),
        salary_max DECIMAL(10,2),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // LeaveRequest 表
    await client.query(`
      CREATE TABLE IF NOT EXISTS leave_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL REFERENCES employees(id),
        leave_type leave_type NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        days DECIMAL(3,1) NOT NULL,
        reason TEXT,
        status leave_status DEFAULT 'pending',
        approver_id UUID REFERENCES employees(id),
        approved_at TIMESTAMP,
        rejection_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // LeaveBalance 表
    await client.query(`
      CREATE TABLE IF NOT EXISTS leave_balances (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL REFERENCES employees(id),
        leave_type leave_type NOT NULL,
        year INTEGER NOT NULL,
        total_days DECIMAL(4,1) NOT NULL,
        used_days DECIMAL(4,1) DEFAULT 0,
        carryover_days DECIMAL(4,1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (employee_id, leave_type, year)
      );
    `);

    // PayStub 表
    await client.query(`
      CREATE TABLE IF NOT EXISTS pay_stubs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL REFERENCES employees(id),
        pay_period_start DATE NOT NULL,
        pay_period_end DATE NOT NULL,
        base_salary DECIMAL(10,2) NOT NULL,
        bonus DECIMAL(10,2) DEFAULT 0,
        deduction DECIMAL(10,2) DEFAULT 0,
        tax DECIMAL(10,2) DEFAULT 0,
        net_salary DECIMAL(10,2) NOT NULL,
        notes TEXT,
        created_by UUID REFERENCES employees(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // AuditLog 表
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES employees(id),
        action VARCHAR(50) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id UUID NOT NULL,
        old_value JSONB,
        new_value JSONB,
        ip_address VARCHAR(45),
        user_agent VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Notification 表
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES employees(id),
        type notification_type NOT NULL,
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        link VARCHAR(500),
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // LeavePolicy 表
    await client.query(`
      CREATE TABLE IF NOT EXISTS leave_policies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        leave_type leave_type UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        default_days DECIMAL(4,1) NOT NULL,
        carryover_limit DECIMAL(4,1) DEFAULT 0,
        carryover_allowed BOOLEAN DEFAULT FALSE,
        requires_approval BOOLEAN DEFAULT TRUE,
        advance_notice_days INTEGER DEFAULT 0,
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 创建索引
    // Employee indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_employee_no ON employees(employee_no);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_email ON employees(email);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_department ON employees(department_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_manager ON employees(manager_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_status ON employees(status);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_role ON employees(role);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_hire_date ON employees(hire_date);`);

    // Department indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_parent ON departments(parent_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_dept_manager ON departments(manager_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_dept_active ON departments(is_active);`);

    // Position indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_pos_dept ON positions(department_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_pos_level ON positions(level);`);

    // LeaveRequest indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_emp_leave ON leave_requests(employee_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_approver ON leave_requests(approver_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_leave_status ON leave_requests(status);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_leave_dates ON leave_requests(start_date, end_date);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_leave_type ON leave_requests(leave_type);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_leave_created ON leave_requests(created_at);`);

    // LeaveBalance indexes (composite index for year-based queries)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_balance_emp_year ON leave_balances(employee_id, year);`);

    // PayStub indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_paystub_emp_period ON pay_stubs(employee_id, pay_period_start);`);

    // AuditLog indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);`);

    // Notification indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_user_unread ON notifications(user_id, is_read);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_notif_created ON notifications(created_at);`);

    await client.query('COMMIT');
    console.log('Migrations completed successfully');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', e);
    throw e;
  } finally {
    client.release();
    pool.end();
  }
}

migrate().catch(console.error);
