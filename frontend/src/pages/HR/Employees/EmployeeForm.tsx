import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { employeeAPI, departmentAPI, positionAPI } from '@/services/api';
import Button from '@/components/Button';

function HREmployeeFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    employee_no: '',
    name: '',
    email: '',
    password: '',
    phone: '',
    emergency_contact: '',
    emergency_phone: '',
    department_id: '',
    position_id: '',
    manager_id: '',
    hire_date: '',
    role: 'employee',
    status: 'inactive',
  });

  // 加载部门列表
  const loadDepartments = async () => {
    try {
      const response = await departmentAPI.getDepartments();
      setDepartments(response.data || []);
    } catch (err) {
      console.error('Failed to load departments:', err);
    }
  };

  // 加载职位列表
  const loadPositions = async (departmentId) => {
    try {
      const response = await positionAPI.getAllPositions({ department_id: departmentId });
      setPositions(response.data || []);
    } catch (err) {
      console.error('Failed to load positions:', err);
    }
  };

  // 加载员工数据（编辑模式）
  const loadEmployee = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await employeeAPI.getEmployee(id);
      const employee = response.data || response;

      setFormData({
        employee_no: employee.employee_no || '',
        name: employee.name || '',
        email: employee.email || '',
        password: '',
        phone: employee.phone || '',
        emergency_contact: employee.emergency_contact || '',
        emergency_phone: employee.emergency_phone || '',
        department_id: employee.department_id || '',
        position_id: employee.position_id || '',
        manager_id: employee.manager_id || '',
        hire_date: employee.hire_date || '',
        role: employee.role || 'employee',
        status: employee.status || 'inactive',
      });

      if (employee.department_id) {
        loadPositions(employee.department_id);
      }
    } catch (err) {
      console.error('Failed to load employee:', err);
      alert('加载员工信息失败');
      navigate('/hr/employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
    if (isEdit) {
      loadEmployee();
    }
  }, [id]);

  // 部门变化时加载职位
  const handleDepartmentChange = (e) => {
    const deptId = e.target.value;
    setFormData((prev) => ({ ...prev, department_id: deptId, position_id: '' }));
    if (deptId) {
      loadPositions(deptId);
    } else {
      setPositions([]);
    }
  };

  // 表单验证
  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '请输入姓名';
    }

    if (!isEdit) {
      if (!formData.email.trim()) {
        newErrors.email = '请输入邮箱';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = '邮箱格式不正确';
      }

      if (!formData.password) {
        newErrors.password = '请输入密码';
      } else if (formData.password.length < 6) {
        newErrors.password = '密码长度至少6位';
      }
    }

    if (!formData.hire_date) {
      newErrors.hire_date = '请选择入职日期';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 保存员工
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        // 更新员工（不更新密码字段）
        const updateData = { ...formData };
        delete updateData.password;
        delete updateData.email; // 邮箱不允许修改

        await employeeAPI.updateEmployee(id, updateData);
        alert('员工信息更新成功');
      } else {
        // 创建新员工
        await employeeAPI.createEmployee(formData);
        alert('员工创建成功');
      }
      navigate('/hr/employees');
    } catch (err) {
      console.error('Failed to save employee:', err);
      alert(err.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <h1 className="page-title">{isEdit ? '编辑员工' : '添加员工'}</h1>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="card-body">
            {/* 基本信息 */}
            <h3 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  员工编号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.employee_no ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={formData.employee_no}
                  onChange={(e) => setFormData((prev) => ({ ...prev, employee_no: e.target.value }))}
                  placeholder="如: EMP001"
                />
                {errors.employee_no && (
                  <p className="mt-1 text-sm text-red-500">{errors.employee_no}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  姓名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="请输入姓名"
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  邮箱 {!isEdit && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="email"
                  disabled={isEdit}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  } ${isEdit ? 'bg-gray-100' : ''}`}
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="请输入邮箱"
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  密码 {!isEdit && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="password"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder={isEdit ? '留空不修改密码' : '请输入密码'}
                  disabled={isEdit}
                />
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">手机号码</label>
                <input
                  type="tel"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="请输入手机号码"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">入职日期</label>
                <input
                  type="date"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.hire_date ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={formData.hire_date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, hire_date: e.target.value }))}
                />
                {errors.hire_date && <p className="mt-1 text-sm text-red-500">{errors.hire_date}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* 工作信息 */}
        <div className="card mt-6">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">工作信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">部门</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={formData.department_id}
                  onChange={handleDepartmentChange}
                >
                  <option value="">请选择部门</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">职位</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={formData.position_id}
                  onChange={(e) => setFormData((prev) => ({ ...prev, position_id: e.target.value }))}
                  disabled={!formData.department_id}
                >
                  <option value="">请选择职位</option>
                  {positions.map((pos) => (
                    <option key={pos.id} value={pos.id}>
                      {pos.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={formData.role}
                  onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                >
                  <option value="employee">员工</option>
                  <option value="manager">经理</option>
                  <option value="hr">HR</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={formData.status}
                  onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                >
                  <option value="inactive">待入职</option>
                  <option value="active">在职</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 紧急联系人 */}
        <div className="card mt-6">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">紧急联系人</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">联系人姓名</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={formData.emergency_contact}
                  onChange={(e) => setFormData((prev) => ({ ...prev, emergency_contact: e.target.value }))}
                  placeholder="请输入紧急联系人姓名"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">联系人电话</label>
                <input
                  type="tel"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={formData.emergency_phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, emergency_phone: e.target.value }))}
                  placeholder="请输入紧急联系人电话"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 提交按钮 */}
        <div className="flex justify-end space-x-4 mt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/hr/employees')}
          >
            取消
          </Button>
          <Button type="submit" variant="primary" loading={saving}>
            {isEdit ? '保存修改' : '创建员工'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default HREmployeeFormPage;
