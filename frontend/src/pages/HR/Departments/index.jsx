import { useState, useEffect } from 'react';
import { departmentAPI } from '@/services/api';
import Table from '@/components/Table';
import Button from '@/components/Button';
import Modal from '@/components/Modal';

function HRDepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    parent_id: '',
    sort_order: 0,
    is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [errors, setErrors] = useState({});

  // 加载部门列表
  const loadDepartments = async () => {
    setLoading(true);
    try {
      const response = await departmentAPI.getDepartments();
      setDepartments(response.data || response);
    } catch (err) {
      console.error('Failed to load departments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  // 打开新增弹窗
  const handleAdd = () => {
    setEditingDepartment(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      parent_id: '',
      sort_order: 0,
      is_active: true,
    });
    setErrors({});
    setModalOpen(true);
  };

  // 打开编辑弹窗
  const handleEdit = (department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name || '',
      code: department.code || '',
      description: department.description || '',
      parent_id: department.parent_id || '',
      sort_order: department.sort_order || 0,
      is_active: department.is_active,
    });
    setErrors({});
    setModalOpen(true);
  };

  // 表单验证
  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = '请输入部门名称';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 保存部门
  const handleSave = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSaving(true);
    try {
      if (editingDepartment) {
        await departmentAPI.updateDepartment(editingDepartment.id, formData);
      } else {
        await departmentAPI.createDepartment(formData);
      }
      setModalOpen(false);
      loadDepartments();
    } catch (err) {
      console.error('Failed to save department:', err);
      alert(err.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  // 删除部门
  const handleDelete = async () => {
    if (!selectedDepartment) return;

    setDeleting(true);
    try {
      await departmentAPI.deleteDepartment(selectedDepartment.id);
      setDeleteModalOpen(false);
      setSelectedDepartment(null);
      loadDepartments();
    } catch (err) {
      console.error('Failed to delete department:', err);
      alert(err.message || '删除失败');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      title: '部门编码',
      dataIndex: 'code',
      width: '120px',
    },
    {
      title: '部门名称',
      dataIndex: 'name',
      render: (value, record) => (
        <div className="flex items-center">
          {record.parent_name && (
            <span className="text-gray-400 mr-1">└─</span>
          )}
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      title: '上级部门',
      dataIndex: 'parent_name',
    },
    {
      title: '部门经理',
      dataIndex: 'manager_name',
    },
    {
      title: '排序',
      dataIndex: 'sort_order',
      width: '80px',
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      width: '100px',
      render: (value) => (
        <span className={`badge ${value ? 'badge-success' : 'badge-gray'}`}>
          {value ? '启用' : '禁用'}
        </span>
      ),
    },
    {
      title: '操作',
      dataIndex: 'actions',
      width: '150px',
      render: (_, record) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(record)}
            className="text-primary-600 hover:text-primary-700 text-sm"
          >
            编辑
          </button>
          <button
            onClick={() => {
              setSelectedDepartment(record);
              setDeleteModalOpen(true);
            }}
            className="text-red-600 hover:text-red-700 text-sm"
          >
            删除
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">部门管理</h1>
        <Button variant="primary" onClick={handleAdd}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          添加部门
        </Button>
      </div>

      <div className="card">
        <div className="card-body p-0">
          <Table
            columns={columns}
            data={departments}
            loading={loading}
            emptyMessage="暂无部门数据"
            rowKey="id"
          />
        </div>
      </div>

      {/* 新增/编辑弹窗 */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingDepartment ? '编辑部门' : '新增部门'}
        size="md"
      >
        <form onSubmit={handleSave}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                部门名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="请输入部门名称"
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">部门编码</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.code}
                onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                placeholder="如: DEV"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">上级部门</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.parent_id}
                onChange={(e) => setFormData((prev) => ({ ...prev, parent_id: e.target.value }))}
              >
                <option value="">无（顶级部门）</option>
                {departments
                  .filter((d) => d.id !== editingDepartment?.id)
                  .map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="请输入部门描述"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">排序</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={formData.sort_order}
                  onChange={(e) => setFormData((prev) => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={formData.is_active}
                  onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.value === 'true' }))}
                >
                  <option value="true">启用</option>
                  <option value="false">禁用</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              取消
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              保存
            </Button>
          </div>
        </form>
      </Modal>

      {/* 删除确认弹窗 */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedDepartment(null);
        }}
        title="确认删除"
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          确定要删除部门「{selectedDepartment?.name}」吗？删除后该部门将被禁用。
        </p>
        <div className="flex justify-end space-x-4">
          <Button
            variant="secondary"
            onClick={() => {
              setDeleteModalOpen(false);
              setSelectedDepartment(null);
            }}
          >
            取消
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={deleting}>
            确定删除
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default HRDepartmentsPage;
