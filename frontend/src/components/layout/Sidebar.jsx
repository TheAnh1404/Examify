import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, 
  Users, 
  BookOpen, 
  FileSpreadsheet, 
  Settings, 
  FolderLock, 
  BookMarked,
  LineChart,
  ClipboardList,
  GraduationCap
} from 'lucide-react';
import Logo from '../common/Logo';
import { formatRole } from '../../utils/i18n';

const Sidebar = ({ onClose, mobile = false }) => {
  const role = localStorage.getItem('examify_role') || 'STUDENT';
  const roleUpper = role.toUpperCase();

  const getNavLinks = () => {
    switch (roleUpper) {
      case 'ADMIN':
        return [
          { name: 'Bảng điều khiển', path: '/admin/dashboard', icon: LayoutDashboard },
          { name: 'Quản lý người dùng', path: '/admin/users', icon: Users },
          { name: 'Môn học', path: '/admin/subjects', icon: BookMarked },
          { name: 'Kết quả hệ thống', path: '/admin/results', icon: FileSpreadsheet },
          { name: 'Cài đặt hệ thống', path: '/admin/settings', icon: Settings },
        ];
      case 'TEACHER':
        return [
          { name: 'Bảng điều khiển', path: '/teacher/dashboard', icon: LayoutDashboard },
          { name: 'Lớp học', path: '/teacher/classrooms', icon: GraduationCap },
          { name: 'Ngân hàng câu hỏi', path: '/teacher/questions', icon: FolderLock },
          { name: 'Quản lý bài thi', path: '/teacher/exams', icon: BookOpen },
          { name: 'Kết quả học sinh', path: '/teacher/results', icon: ClipboardList },
          { name: 'Thống kê', path: '/teacher/analytics', icon: LineChart },
        ];
      case 'STUDENT':
      default:
        return [
          { name: 'Bảng điều khiển', path: '/student/dashboard', icon: LayoutDashboard },
          { name: 'Lớp học của tôi', path: '/student/classrooms', icon: GraduationCap },
          { name: 'Bài thi có thể làm', path: '/student/exams', icon: BookOpen },
          { name: 'Lịch sử làm bài', path: '/student/attempts', icon: ClipboardList },
          { name: 'Hồ sơ cá nhân', path: '/student/profile', icon: Users },
        ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <aside className={`${mobile ? 'flex flex-col w-full h-full' : 'w-72 h-screen sticky top-0 hidden md:flex md:flex-col'} bg-[#0F172A] text-slate-400 shrink-0 border-r border-slate-800/50`}>
      {/* Brand Logo header */}
      <div className="h-24 flex items-center gap-4 px-8 border-b border-slate-800/50">
        <Logo className="h-10 w-10" />
        <div>
          <span className="font-extrabold text-white tracking-tight text-xl block">Examify</span>
          <span className="text-[10px] text-primary-400 block -mt-0.5 font-bold uppercase tracking-widest">
            Cổng {formatRole(roleUpper)}
          </span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto">
        {navLinks.map((link) => {
          const IconComponent = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={onClose}
              aria-label={link.name}
              className={({ isActive }) => `
                flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 group
                ${isActive 
                  ? 'bg-primary-500/10 text-primary-400 shadow-sm' 
                  : 'hover:text-white hover:bg-white/5'}
              `}
            >
              {({ isActive }) => (
                <>
                  <IconComponent className={`h-5 w-5 transition-colors ${isActive ? 'text-primary-400' : 'text-slate-500 group-hover:text-primary-400'}`} />
                  <span>{link.name}</span>
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Version footer */}
      <div className="p-6 border-t border-slate-800/50">
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
          <div className="h-9 w-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
            <span className="text-xs font-bold">v2</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-white uppercase tracking-tight">Phiên bản 2.0.4</span>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Sẵn sàng triển khai</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
