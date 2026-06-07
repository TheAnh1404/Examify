import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Menu, Bell, User, LogOut, ChevronDown } from 'lucide-react';

const Topbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const user = authService.getCurrentUser() || { name: 'Unknown User', role: 'STUDENT' };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <header className="h-16 bg-white border-b border-secondary-200 flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Mobile Menu Toggle */}
      <button 
        onClick={onMenuClick}
        className="p-1.5 rounded-lg text-secondary-500 hover:bg-secondary-100 md:hidden focus:outline-none"
      >
        <Menu className="h-5.5 w-5.5" />
      </button>

      {/* Spacing alignment */}
      <div className="hidden md:block text-xs text-secondary-400 font-semibold tracking-wider font-sans uppercase">
        Examify Assessments Systems
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4 ml-auto">
        {/* Notifications */}
        <button className="relative p-1.5 rounded-lg text-secondary-500 hover:bg-secondary-100 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1.5 h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        {/* User Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1 rounded-full hover:bg-secondary-50 transition-colors focus:outline-none text-left"
          >
            <div className="h-9 w-9 rounded-full bg-primary-100 border border-primary-200 text-primary-700 font-bold flex items-center justify-center text-sm font-display shadow-sm">
              {getInitials(user.name)}
            </div>
            
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-secondary-800 line-clamp-1">{user.name}</p>
              <p className="text-[10px] text-secondary-400 uppercase font-semibold tracking-wider">{user.role}</p>
            </div>
            
            <ChevronDown className="h-4 w-4 text-secondary-400 hidden sm:block shrink-0" />
          </button>

          {dropdownOpen && (
            <>
              {/* Overlay blocker */}
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>
              
              {/* Dropdown Card */}
              <div className="absolute right-0 mt-2.5 w-48 bg-white border border-secondary-200 rounded-lg shadow-lg py-1.5 z-50 animate-slide-up">
                <div className="px-4 py-2 border-b border-secondary-100 sm:hidden">
                  <p className="text-xs font-bold text-secondary-800">{user.name}</p>
                  <p className="text-[10px] text-secondary-400 uppercase tracking-wider">{user.role}</p>
                </div>
                
                <button
                  onClick={() => { setDropdownOpen(false); navigate(`/${user.role.toLowerCase()}/profile`); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-left text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                >
                  <User className="h-4 w-4 text-secondary-400" />
                  My Profile
                </button>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-secondary-100"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
