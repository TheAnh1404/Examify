import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Menu, Bell, User, LogOut, ChevronDown, Search, HelpCircle, Settings } from 'lucide-react';

const Topbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const user = authService.getCurrentUser() || { name: 'Unknown User', role: 'STUDENT' };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Overview';
    if (path.includes('/users')) return 'User Management';
    if (path.includes('/subjects')) return 'Subject Categories';
    if (path.includes('/questions')) return 'Question Bank';
    if (path.includes('/exams')) return 'Exam Management';
    if (path.includes('/results')) return 'Results & Analytics';
    if (path.includes('/analytics')) return 'Analytics Hub';
    if (path.includes('/settings')) return 'System Settings';
    if (path.includes('/profile')) return 'My Profile';
    if (path.includes('/attempts')) return 'Exam History';
    return 'Dashboard';
  };

  return (
    <header className="h-16 bg-white border-b border-secondary-100 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-40">
      {/* Left Section: Mobile Menu & Page Title */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 rounded-xl text-secondary-500 hover:bg-secondary-50 md:hidden focus:outline-none transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>

        <h1 className="text-lg font-bold text-secondary-900 hidden sm:block">
          {getPageTitle()}
        </h1>
      </div>

      {/* Center Section: Search Bar (Desktop only) */}
      <div className="hidden lg:flex flex-1 max-w-md mx-8">
        <div className="relative w-full group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400 group-focus-within:text-primary-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search for exams, students or questions..." 
            className="w-full bg-secondary-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm text-secondary-900 placeholder-secondary-400 focus:ring-2 focus:ring-primary-500/10 transition-all"
          />
        </div>
      </div>

      {/* Right Section: Actions & User */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Help (Desktop) */}
        <button className="p-2 rounded-xl text-secondary-400 hover:text-secondary-900 hover:bg-secondary-50 transition-all hidden sm:flex">
          <HelpCircle className="h-5.5 w-5.5" />
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl text-secondary-400 hover:text-secondary-900 hover:bg-secondary-50 transition-all">
          <Bell className="h-5.5 w-5.5" />
          <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-danger-500 border-2 border-white"></span>
        </button>

        <div className="h-8 w-px bg-secondary-100 mx-1 hidden sm:block"></div>

        {/* User Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 p-1 rounded-xl hover:bg-secondary-50 transition-all focus:outline-none"
          >
            <div className="h-9 w-9 rounded-xl bg-primary-600 text-white font-bold flex items-center justify-center text-sm shadow-lg shadow-primary-500/20">
              {getInitials(user.name)}
            </div>
            
            <div className="hidden xl:block text-left">
              <p className="text-xs font-bold text-secondary-900 line-clamp-1 leading-none mb-1">{user.name}</p>
              <p className="text-[10px] text-primary-600 uppercase font-bold tracking-widest">{user.role}</p>
            </div>
            
            <ChevronDown className={`h-4 w-4 text-secondary-400 hidden xl:block transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>
              
              <div className="absolute right-0 mt-3 w-56 bg-white border border-secondary-200 rounded-2xl shadow-2xl py-2 z-50 animate-fade-in">
                <div className="px-5 py-3 border-b border-secondary-100 xl:hidden">
                  <p className="text-sm font-bold text-secondary-900">{user.name}</p>
                  <p className="text-[10px] text-primary-600 font-bold uppercase tracking-widest">{user.role}</p>
                </div>
                
                <div className="py-2">
                  <Link
                    to={`/${user.role.toLowerCase()}/profile`}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-5 py-2.5 text-sm font-semibold text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50 transition-colors"
                  >
                    <User className="h-4.5 w-4.5 text-secondary-400" />
                    My Profile
                  </Link>
                  <Link
                    to={`/${user.role.toLowerCase()}/settings`}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-5 py-2.5 text-sm font-semibold text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50 transition-colors"
                  >
                    <Settings className="h-4.5 w-4.5 text-secondary-400" />
                    Settings
                  </Link>
                </div>
                
                <div className="px-2 pt-2 border-t border-secondary-100">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm font-bold text-danger-600 hover:bg-danger-50 rounded-xl transition-colors"
                  >
                    <LogOut className="h-4.5 w-4.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
