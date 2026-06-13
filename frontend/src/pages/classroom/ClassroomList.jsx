import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { classroomService } from '../../services/classroomService';
import { subjectService } from '../../services/subjectService';
import { authService } from '../../services/authService';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Select from '../../components/common/Select';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import { GraduationCap, Users, BookOpen, Plus, Search, School, ArrowRight, User } from 'lucide-react';

const ClassroomList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();
  const isTeacher = user?.role === 'TEACHER';
  const isStudent = user?.role === 'STUDENT';

  const [classrooms, setClassrooms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    subjectId: '',
    schoolName: user?.schoolName || '',
    bannerUrl: '',
    description: ''
  });

  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      const res = await classroomService.getAll({ search: searchQuery });
      setClassrooms(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    if (!isTeacher) return;
    try {
      const res = await subjectService.getAll();
      setSubjects(res.data.map(s => ({ value: s.id, label: s.name })));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchClassrooms();
    fetchSubjects();
  }, [searchQuery]);

  const handleCreateClass = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...formData };
      if (!payload.code.trim()) delete payload.code;
      if (!payload.bannerUrl.trim()) delete payload.bannerUrl;

      await classroomService.create(payload);
      setIsAddModalOpen(false); // Sửa thành setIsModalOpen nếu cần, nhưng thực tế modal ở đây là isModalOpen
      setIsModalOpen(false);
      setFormData({ name: '', code: '', subjectId: '', schoolName: user?.schoolName || '', bannerUrl: '', description: '' });
      fetchClassrooms();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader 
        title={isTeacher ? "My Teaching Classrooms" : "Enrolled Classrooms"} 
        subtitle={isTeacher ? "Manage your virtual classrooms, assign subjects, and track student progress." : "Access your registered classes and view instructor information."}
        actions={
          isTeacher && (
            <Button variant="primary" onClick={() => setIsModalOpen(true)} icon={<Plus className="h-4.5 w-4.5" />}>
              New Classroom
            </Button>
          )
        }
      />

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
          <input
            type="text"
            placeholder="Search by class name, code, or school..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-secondary-100 rounded-2xl focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 outline-none transition-all font-medium text-secondary-900"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <Loading message="Syncing classroom directory..." />
      ) : classrooms.length === 0 ? (
        <EmptyState 
          icon={GraduationCap}
          title="No Classrooms Found"
          description={searchQuery ? "Try adjusting your search filters." : (isTeacher ? "Get started by creating your first virtual classroom." : "You haven't been enrolled in any classes yet.")}
          action={isTeacher && !searchQuery ? (
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>Create First Class</Button>
          ) : null}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {classrooms.map((cls) => (
            <Card 
              key={cls.id} 
              className="group hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-500 border-none bg-white p-0 overflow-hidden cursor-pointer"
              onClick={() => navigate(`${location.pathname}/${cls.id}`)}
            >
              {cls.bannerUrl ? (
                <div className="h-32 w-full overflow-hidden">
                  <img src={cls.bannerUrl} alt={cls.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
              ) : (
                <div className="h-3 bg-primary-600 w-full" />
              )}
              
              <div className="p-8 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="h-14 w-14 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500">
                    <GraduationCap className="h-7 w-7" />
                  </div>
                  <Badge variant="slate" className="font-mono text-[10px] tracking-widest uppercase">{cls.code}</Badge>
                </div>

                <div>
                  <h3 className="text-xl font-black text-secondary-900 group-hover:text-primary-600 transition-colors line-clamp-1">{cls.name}</h3>
                  <p className="text-sm font-bold text-secondary-400 mt-1 uppercase tracking-wider">{cls.subject?.name}</p>
                </div>

                <div className="space-y-3.5 pt-4 border-t border-secondary-50">
                  <div className="flex items-center gap-3 text-xs font-bold text-secondary-500">
                    <School className="h-4 w-4 text-secondary-300" />
                    <span className="truncate">{cls.schoolName || 'Global Institution'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-secondary-500">
                    <User className="h-4 w-4 text-secondary-300" />
                    <span>{isTeacher ? `${cls.studentCount} Students Enrolled` : `Instructor: ${cls.teacher?.fullName}`}</span>
                  </div>
                </div>
              </div>
              <div className="px-8 py-4 bg-secondary-50/50 flex items-center justify-between group-hover:bg-primary-50 transition-colors">
                <span className="text-[10px] font-black text-secondary-400 uppercase tracking-widest group-hover:text-primary-600">View Classroom</span>
                <ArrowRight className="h-4 w-4 text-secondary-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Virtual Classroom"
      >
        <form onSubmit={handleCreateClass} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Class Name"
              placeholder="e.g. Mathematics 10A1"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Class Code (Optional)"
              placeholder="Auto-generated if empty"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            />
          </div>
          <Select
            label="Subject"
            options={subjects}
            value={formData.subjectId}
            onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
            placeholder="Select a subject"
            required
          />
          <Input
            label="Banner Image URL (Optional)"
            value={formData.bannerUrl}
            onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
            placeholder="https://images.unsplash.com/..."
          />
          <Input
            label="School / Institution"
            value={formData.schoolName}
            onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
            placeholder="e.g. International High School"
          />
          <Input
            label="Short Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief overview of the class goals..."
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={submitting}>Launch Classroom</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClassroomList;
