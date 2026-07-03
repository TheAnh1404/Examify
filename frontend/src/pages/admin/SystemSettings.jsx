import { useEffect, useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { settingsService } from '../../services/settingsService';
import { Save, CheckCircle, Shield, Settings, ShieldAlert } from 'lucide-react';

const SystemSettings = () => {
  const [formData, setFormData] = useState({
    siteName: 'Examify - Hệ thống đánh giá',
    contactEmail: 'support@examify.com',
    proctoringEnforced: true,
    tabFocusWarnings: 3,
    registrationOpen: true
  });

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await settingsService.get();
        setFormData(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setSaving(true);
    try {
      const response = await settingsService.update(formData);
      setFormData(response.data);
      setSuccess('Cập nhật cấu hình hệ thống thành công.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading message="Đang tải cấu hình hệ thống..." />;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageHeader 
        title="Tham số hệ thống"
        subtitle="Quản lý ngưỡng giám sát, đăng ký tài khoản và email liên hệ."
      />

      {success && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-accent-50 border border-accent-100 text-accent-700 text-sm animate-slide-up">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-danger-50 border border-danger-100 text-danger-700 text-sm">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Card title="Bảng cài đặt hệ thống" subtitle="Cấu hình các quy tắc vận hành">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* General Section */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-secondary-800 flex items-center gap-2 border-b border-secondary-100 pb-2">
              <Settings className="h-4 w-4 text-primary-600" />
              Cấu hình chung
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Tên nền tảng"
                name="siteName"
                value={formData.siteName}
                onChange={handleInputChange}
                required
              />
              <Input 
                label="Email liên hệ"
                name="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={handleInputChange}
                required
              />
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer py-1 text-sm font-medium text-secondary-700">
              <input
                type="checkbox"
                name="registrationOpen"
                checked={formData.registrationOpen}
                onChange={handleInputChange}
                className="h-4.5 w-4.5 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
              />
              <span>Cho phép học sinh tự đăng ký tài khoản mới</span>
            </label>
          </div>

          {/* Proctor Section */}
          <div className="space-y-4 pt-2">
            <h4 className="font-semibold text-sm text-secondary-800 flex items-center gap-2 border-b border-secondary-100 pb-2">
              <Shield className="h-4 w-4 text-accent-600" />
              Quy tắc giám sát bài thi
            </h4>
            
            <label className="flex items-center gap-2.5 cursor-pointer py-1 text-sm font-medium text-secondary-700">
              <input
                type="checkbox"
                name="proctoringEnforced"
                checked={formData.proctoringEnforced}
                onChange={handleInputChange}
                className="h-4.5 w-4.5 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
              />
              <span>Bật theo dõi chuyển tab/mất tập trung trong bài thi của học sinh</span>
            </label>

            <Input 
              label="Ngưỡng cảnh báo giám sát (số lần chuyển tab tối đa trước khi đánh dấu)"
              name="tabFocusWarnings"
              type="number"
              value={formData.tabFocusWarnings}
              onChange={handleInputChange}
              min={1}
              max={10}
              disabled={!formData.proctoringEnforced}
              className="max-w-md"
            />
          </div>

          <div className="pt-4 border-t border-secondary-200">
            <Button
              type="submit"
              variant="primary"
              loading={saving}
              className="w-full flex items-center justify-center gap-2"
              icon={<Save className="h-4.5 w-4.5" />}
            >
              Lưu cài đặt
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default SystemSettings;
