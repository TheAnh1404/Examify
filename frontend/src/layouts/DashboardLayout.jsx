import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { formatRole } from '../utils/i18n';
import { 
  GraduationCap, 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Award, 
  LogOut, 
  Menu, 
  X, 
  User 
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Define navigation based on user roles
  const getNavLinks = () => {
    switch (user?.role?.toUpperCase()) {
      case 'admin':
      case 'ADMIN':
        return [
          { name: 'Tổng quan', path: '/admin', icon: LayoutDashboard },
          { name: 'Quản lý người dùng', path: '/admin/users', icon: Users },
        ];
      case 'teacher':
      case 'TEACHER':
        return [
          { name: 'Bảng điều khiển', path: '/teacher', icon: LayoutDashboard },
          { name: 'Bài thi của tôi', path: '/teacher/exams', icon: BookOpen },
          { name: 'Sổ điểm', path: '/teacher/submissions', icon: Award },
        ];
      case 'student':
      case 'STUDENT':
        return [
          { name: 'Bảng điều khiển', path: '/student', icon: LayoutDashboard },
          { name: 'Làm bài thi', path: '/student/exams', icon: BookOpen },
          { name: 'Bài đã nộp', path: '/student/history', icon: Award },
        ];
      default:
        return [];
    }
  };

  const links = getNavLinks();
  const currentPathName = links.find(l => location.pathname === l.path)?.name || 'Bảng điều khiển';

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-dark-900 border-r border-dark-800 shrink-0">
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-dark-800">
          <GraduationCap className="h-8 w-8 text-brand-500" />
          <span className="font-display font-bold text-xl tracking-wide bg-gradient-to-r from-brand-400 to-indigo-400 bg-clip-text text-transparent">
            Examify
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {links.map((link) => {
            const IconComponent = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/admin' || link.path === '/teacher' || link.path === '/student'}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-150
                  ${isActive 
                    ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-dark-800/50 border border-transparent'}
                `}
              >
                <IconComponent className="h-5 w-5" />
                {link.name}
              </NavLink>
            );
          })}
        </nav>

        {/* User profile footer */}
        <div className="p-4 border-t border-dark-800 bg-dark-900/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-10 w-10 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold font-display">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-200 truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{formatRole(user?.role)}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-dark-700 bg-dark-800 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 text-slate-300 font-medium text-sm transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      <div className={`
        fixed inset-0 z-50 md:hidden transition-opacity duration-300 ease-out
        ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
      `}>
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        
        {/* Sidebar content */}
        <aside className={`
          absolute top-0 bottom-0 left-0 w-64 bg-dark-900 border-r border-dark-800 flex flex-col transition-transform duration-300 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="h-16 flex items-center justify-between px-6 border-b border-dark-800">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-brand-500" />
              <span className="font-display font-bold text-xl tracking-wide bg-gradient-to-r from-brand-400 to-indigo-400 bg-clip-text text-transparent">
                Examify
              </span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-slate-200" aria-label="Đóng menu điều hướng">
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            {links.map((link) => {
              const IconComponent = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/admin' || link.path === '/teacher' || link.path === '/student'}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-150
                    ${isActive 
                      ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-dark-800/50 border border-transparent'}
                  `}
                >
                  <IconComponent className="h-5 w-5" />
                  {link.name}
                </NavLink>
              );
            })}
          </nav>

          <div className="p-4 border-t border-dark-800 bg-dark-900/50">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="h-10 w-10 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold font-display">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-200 truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate">{formatRole(user?.role)}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-dark-700 bg-dark-800 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 text-slate-300 font-medium text-sm transition-all duration-200"
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </button>
          </div>
        </aside>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-dark-900 border-b border-dark-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-slate-400 hover:text-slate-200 focus:outline-none"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-slate-200 tracking-tight">
              {currentPathName}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs px-2.5 py-1 rounded-full border border-brand-500/20 bg-brand-500/5 text-brand-400 font-semibold uppercase tracking-wide">
              Cổng {formatRole(user?.role)}
            </span>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
