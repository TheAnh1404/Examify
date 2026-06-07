import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  FileSpreadsheet, 
  Settings, 
  HelpCircle, 
  FolderLock, 
  BookMarked,
  GraduationCap,
  LineChart,
  UserCheck,
  ClipboardList
} from 'lucide-react';

const Sidebar = () => {
  const role = localStorage.getItem('examify_role') || 'STUDENT';
  const roleUpper = role.toUpperCase();

  const getNavLinks = () => {
    switch (roleUpper) {
      case 'ADMIN':
        return [
          { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
          { name: 'User Management', path: '/admin/users', icon: Users },
          { name: 'Subject Categories', path: '/admin/subjects', icon: BookMarked },
          { name: 'System Results', path: '/admin/results', icon: FileSpreadsheet },
          { name: 'Global Settings', path: '/admin/settings', icon: Settings },
        ];
      case 'TEACHER':
        return [
          { name: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
          { name: 'Question Bank', path: '/teacher/questions', icon: FolderLock },
          { name: 'Exam Management', path: '/teacher/exams', icon: BookOpen },
          { name: 'Student Results', path: '/teacher/results', icon: ClipboardList },
          { name: 'Analytics Hub', path: '/teacher/analytics', icon: LineChart },
        ];
      case 'STUDENT':
      default:
        return [
          { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
          { name: 'Available Exams', path: '/student/exams', icon: BookOpen },
          { name: 'My Attempts', path: '/student/attempts', icon: ClipboardList },
          { name: 'My Profile', path: '/student/profile', icon: Users },
        ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <aside className="w-64 bg-secondary-900 text-slate-300 shrink-0 hidden md:flex md:flex-col border-r border-secondary-800">
      {/* Brand Logo header */}
      <div className="h-16 flex items-center gap-2.5 px-6 border-b border-secondary-800">
        <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center text-white shadow-md shadow-primary-500/10">
          <span className="font-display font-extrabold text-lg">E</span>
        </div>
        <div>
          <span className="font-semibold text-white tracking-wide text-base">Examify</span>
          <span className="text-[9px] text-accent block -mt-1 font-sans uppercase font-bold tracking-wider">
            {roleUpper} PORTAL
          </span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navLinks.map((link) => {
          const IconComponent = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                ${isActive 
                  ? 'bg-primary-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-secondary-800'}
              `}
            >
              <IconComponent className="h-4.5 w-4.5" />
              <span>{link.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Support footer */}
      <div className="p-4 border-t border-secondary-800 text-[10px] text-slate-500 text-center">
        Examify Enterprise Client v2.0
      </div>
    </aside>
  );
};

export default Sidebar;
