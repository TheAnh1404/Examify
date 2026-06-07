import React, { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Save, CheckCircle, Shield, Eye, Settings } from 'lucide-react';

const SystemSettings = () => {
  const [formData, setFormData] = useState({
    siteName: 'Examify Assessment Engine',
    contactEmail: 'support@examify.com',
    proctoringEnforced: true,
    tabFocusWarnings: 3,
    registrationOpen: true
  });

  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess('');
    setTimeout(() => {
      setSuccess('System configuration parameters updated successfully.');
    }, 300);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageHeader 
        title="Global System Parameters" 
        subtitle="Manage proctoring thresholds, register configurations, and email targets."
      />

      {success && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-accent-50 border border-accent-100 text-accent-700 text-sm animate-slide-up">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <Card title="System Settings Panel" subtitle="Configure system rules">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* General Section */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-secondary-800 flex items-center gap-2 border-b border-secondary-100 pb-2">
              <Settings className="h-4 w-4 text-primary-600" />
              General Configuration
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Site/Platform Name"
                name="siteName"
                value={formData.siteName}
                onChange={handleInputChange}
                required
              />
              <Input 
                label="Contact E-mail Target"
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
              <span>Enable Self-Registration routes for new Student/Teacher accounts</span>
            </label>
          </div>

          {/* Proctor Section */}
          <div className="space-y-4 pt-2">
            <h4 className="font-semibold text-sm text-secondary-800 flex items-center gap-2 border-b border-secondary-100 pb-2">
              <Shield className="h-4 w-4 text-accent-600" />
              Proctoring Security Rules
            </h4>
            
            <label className="flex items-center gap-2.5 cursor-pointer py-1 text-sm font-medium text-secondary-700">
              <input
                type="checkbox"
                name="proctoringEnforced"
                checked={formData.proctoringEnforced}
                onChange={handleInputChange}
                className="h-4.5 w-4.5 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
              />
              <span>Enforce document visibility change/focus tracking for student tests</span>
            </label>

            <Input 
              label="Proctor warnings threshold (Max tab switches permitted before auto-flags)"
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
              className="w-full flex items-center justify-center gap-2"
              icon={<Save className="h-4.5 w-4.5" />}
            >
              Save Configuration Settings
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default SystemSettings;
