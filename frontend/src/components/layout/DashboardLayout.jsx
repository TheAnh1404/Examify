import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { X } from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      {/* Sidebar for Desktop */}
      <Sidebar />

      {/* Mobile Sidebar Overlay */}
      <div className={`
        fixed inset-0 z-50 md:hidden transition-opacity duration-300 ease-out
        ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
      `}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" 
          onClick={() => setIsSidebarOpen(false)} 
        />
        
        {/* Mobile Sidebar drawer */}
        <div className={`
          absolute top-0 bottom-0 left-0 w-72 bg-[#0F172A] transition-transform duration-300 ease-out flex flex-col shadow-2xl
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex justify-end p-6 border-b border-slate-800/50">
            <button 
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Đóng menu điều hướng"
              className="p-2.5 rounded-xl text-slate-400 hover:bg-white/5 transition-colors border border-white/5"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <Sidebar mobile onClose={() => setIsSidebarOpen(false)} />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 p-6 sm:p-10 overflow-y-auto animate-fade-in">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>

        <footer className="px-10 py-6 border-t border-secondary-50 bg-white/50 backdrop-blur-sm">
          <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-[10px] font-extrabold text-secondary-400 uppercase tracking-widest">
              © 2026 Examify Enterprise. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Privacy Policy</span>
              <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Terms of Service</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
