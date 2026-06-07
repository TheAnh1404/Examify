import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { X } from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Sidebar for Desktop */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      <div className={`
        fixed inset-0 z-50 md:hidden transition-opacity duration-300 ease-out
        ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
      `}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-secondary-900/60 backdrop-blur-sm" 
          onClick={() => setIsSidebarOpen(false)} 
        />
        
        {/* Mobile Sidebar drawer */}
        <div className={`
          absolute top-0 bottom-0 left-0 w-64 bg-white transition-transform duration-300 ease-out flex flex-col shadow-2xl
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex justify-end p-4 border-b border-secondary-100">
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-xl text-secondary-500 hover:bg-secondary-50 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <Sidebar onClose={() => setIsSidebarOpen(false)} />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto animate-fade-in">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>

        <footer className="px-8 py-4 text-center sm:text-left">
          <p className="text-xs font-bold text-secondary-400 uppercase tracking-widest">
            © 2026 Examify Platforms. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
