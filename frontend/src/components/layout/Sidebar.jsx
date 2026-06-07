import React from 'react';
import { NavLink, Link } from 'react-router-dom';
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

const Sidebar = ({ onClose }) => {
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
    <aside className="w-64 bg-secondary-900 text-slate-350 shrink-0 hidden md:flex md:flex-col border-r border-secondary-800">
      {/* Brand Logo header */}
      <div className="h-16 flex items-center gap-2.5 px-6 border-b border-secondary-800">
        <Logo className="h-8 w-8" />
        <div>
          <span className="font-semibold text-white tracking-wide text-base">Examify</span>
          <span className="text-[9px] text-accent block -mt-1 font-sans uppercase font-bold tracking-wider">
            {roleUpper} PORTAL
          </span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto">
        {navLinks.map((link) => {
          const IconComponent = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group
                ${isActive 
                  ? 'bg-primary-50 text-primary-600 shadow-sm shadow-primary-500/5' 
                  : 'text-secondary-500 hover:text-secondary-900 hover:bg-secondary-50'}
              `}
            >
              {({ isActive }) => (
                <>
                  <IconComponent className={`h-5 w-5 transition-colors ${isActive ? 'text-primary-600' : 'group-hover:text-secondary-900'}`} />
                  <span>{link.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Version footer */}
      <div className="p-6 border-t border-secondary-100 bg-secondary-50/30">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-secondary-200 shadow-sm">
          <div className="h-8 w-8 rounded-lg bg-secondary-100 flex items-center justify-center text-secondary-500">
            <span className="text-xs font-bold">v2</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-secondary-900 uppercase">Version 2.0.4</span>
            <span className="text-[9px] text-secondary-400 font-medium">Stable Release</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
