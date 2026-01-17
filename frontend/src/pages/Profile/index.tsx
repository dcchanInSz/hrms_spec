import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { employeeAPI } from '@/services/api';
import Input from '@/components/Form/Input';
import Button from '@/components/Button';

interface ProfileFormData {
  name: string;
  phone: string;
  emergency_contact: string;
  emergency_phone: string;
}

const ProfilePage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    phone: '',
    emergency_contact: '',
    emergency_phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // 加载用户资料
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await employeeAPI.getProfile() as any;
        const data = response.data?.data || response.data;
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          emergency_contact: data.emergency_contact || '',
          emergency_phone: data.emergency_phone || '',
        });
      } catch (err) {
        console.error('Failed to load profile:', err);
        setError('加载资料失败');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadProfile();
    }
  }, [user]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError('');

    try {
      await employeeAPI.updateProfile(formData) as any;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || '保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="page-title">个人资料</h1>

      <div className="card">
        <div className="card-body">
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              资料更新成功
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
              <Input
                label="联系电话"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="请输入联系电话"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">员工编号</label>
                <input
                  type="text"
                  value={user?.employee_no || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">紧急联系人</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="紧急联系人姓名"
                  name="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={handleChange}
                  placeholder="请输入紧急联系人姓名"
                />
                <Input
                  label="紧急联系人电话"
                  name="emergency_phone"
                  value={formData.emergency_phone}
                  onChange={handleChange}
                  placeholder="请输入紧急联系人电话"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" variant="primary" loading={saving}>
                保存修改
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
