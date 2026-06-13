import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Menu, User, LogOut, ChevronDown, Settings, Activity } from 'lucide-react';

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
    <header className="h-20 bg-white border-b border-secondary-50 flex items-center justify-between px-4 sm:px-10 sticky top-0 z-40">
      {/* Left Section: Mobile Menu & Page Title */}
      <div className="flex items-center gap-6">
        <button 
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="p-2.5 rounded-xl text-secondary-500 hover:bg-secondary-50 md:hidden focus:outline-none transition-colors border border-transparent hover:border-secondary-100"
        >
          <Menu className="h-6 w-6" />
        </button>

        <h1 className="text-xl font-extrabold text-secondary-900 hidden sm:block tracking-tight">
          {getPageTitle()}
        </h1>
      </div>

      <div className="hidden lg:flex flex-1 justify-center mx-12">
        <div className="inline-flex items-center gap-2 rounded-xl bg-accent-50 border border-accent-100 px-4 py-2 text-[10px] font-extrabold uppercase tracking-widest text-accent-700">
          <Activity className="h-4 w-4" />
          Secure session active
        </div>
      </div>

      {/* Right Section: Actions & User */}
      <div className="flex items-center gap-3 sm:gap-6">
        {/* User Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-label="Open account menu"
            aria-expanded={dropdownOpen}
            className="flex items-center gap-3.5 p-1.5 rounded-2xl hover:bg-secondary-50 transition-all focus:outline-none border border-transparent hover:border-secondary-100"
          >
            <div className="h-10 w-10 rounded-xl bg-primary-500 text-white font-extrabold flex items-center justify-center text-sm shadow-lg shadow-primary-500/20 ring-4 ring-primary-500/5 overflow-hidden">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                getInitials(user.name)
              )}
            </div>
            
            <div className="hidden xl:block text-left">
              <p className="text-xs font-extrabold text-secondary-900 line-clamp-1 leading-none mb-1">{user.name}</p>
              <p className="text-[9px] text-primary-500 uppercase font-extrabold tracking-widest leading-none">{user.role}</p>
            </div>
            
            <ChevronDown className={`h-4 w-4 text-secondary-300 hidden xl:block transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>
              
              <div className="absolute right-0 mt-4 w-64 bg-white border border-secondary-100 rounded-3xl shadow-2xl py-3 z-50 animate-fade-in ring-1 ring-secondary-900/5">
                <div className="px-6 py-4 border-b border-secondary-50 xl:hidden">
                  <p className="text-sm font-extrabold text-secondary-900">{user.name}</p>
                  <p className="text-[10px] text-primary-500 font-extrabold uppercase tracking-widest">{user.role}</p>
                </div>
                
                <div className="py-2 px-2">
                  <Link
                    to={user.role === 'ADMIN' ? '/admin/profile' : user.role === 'TEACHER' ? '/teacher/profile' : '/student/profile'}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3.5 px-4 py-3 text-sm font-bold text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-2xl transition-all"
                  >
                    <div className="p-2 rounded-xl bg-secondary-50 text-secondary-400">
                      <User className="h-4.5 w-4.5" />
                    </div>
                    My Profile
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link
                      to="/admin/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3.5 px-4 py-3 text-sm font-bold text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-2xl transition-all"
                    >
                      <div className="p-2 rounded-xl bg-secondary-50 text-secondary-400">
                        <Settings className="h-4.5 w-4.5" />
                      </div>
                      System Settings
                    </Link>
                  )}
                </div>
                
                <div className="px-3 pt-2 mt-2 border-t border-secondary-50">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left text-sm font-extrabold text-danger-600 hover:bg-danger-50 rounded-2xl transition-all"
                  >
                    <div className="p-2 rounded-xl bg-danger-100/50">
                      <LogOut className="h-4.5 w-4.5" />
                    </div>
                    Sign Out System
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
