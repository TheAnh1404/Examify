import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { X, GraduationCap } from 'lucide-react';
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
  ClipboardList
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
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
    <div className="min-h-screen bg-secondary-50 flex overflow-hidden">
      {/* Desktop Sidebar (visible on md+) */}
      <Sidebar />

      {/* Mobile Drawer (visible on mobile only when toggled) */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-secondary-900/60 backdrop-blur-sm" 
            onClick={() => setMobileSidebarOpen(false)}
          ></div>
          
          {/* Mobile Sidebar Content */}
          <aside className="relative w-64 max-w-xs bg-secondary-900 text-slate-350 flex flex-col z-50 animate-slide-right border-r border-secondary-800">
            <div className="h-16 flex items-center justify-between px-6 border-b border-secondary-800">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold">E</div>
                <span className="font-semibold text-white tracking-wide">Examify</span>
              </div>
              <button 
                onClick={() => setMobileSidebarOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
              {navLinks.map((link) => {
                const IconComponent = link.icon;
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileSidebarOpen(false)}
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
            <div className="p-4 border-t border-secondary-800 text-[10px] text-slate-500 text-center">
              Examify Mobile v2.0
            </div>
          </aside>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Topbar onMenuClick={() => setMobileSidebarOpen(true)} />
        
        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
