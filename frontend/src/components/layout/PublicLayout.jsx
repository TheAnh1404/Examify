import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight } from 'lucide-react';

const PublicLayout = ({ children }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('examify_token');
  const role = localStorage.getItem('examify_role');

  const getDashboardRedirect = () => {
    if (!role) return '/login';
    if (role === 'ADMIN') return '/admin/dashboard';
    if (role === 'TEACHER') return '/teacher/dashboard';
    return '/student/dashboard';
  };

  return (
    <div className="min-h-screen bg-secondary-50 flex flex-col font-sans">
      {/* Public Header */}
      <header className="bg-white border-b border-secondary-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-primary-600 flex items-center justify-center text-white shadow-md shadow-primary-500/10">
              <span className="font-display font-extrabold text-xl">E</span>
            </div>
            <div>
              <span className="font-semibold text-secondary-800 text-lg tracking-wide">Examify</span>
              <span className="text-[10px] text-primary-600 block -mt-1 font-medium font-sans">SaaS Proctoring</span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            {token ? (
              <button 
                onClick={() => navigate(getDashboardRedirect())}
                className="btn-primary flex items-center gap-1.5 py-1.5 text-xs font-semibold"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <>
                <Link to="/login" className="text-secondary-600 hover:text-primary-600 text-sm font-semibold transition-all">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary py-1.5 px-4 text-xs font-semibold">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main content body */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-secondary-900 border-t border-secondary-800 py-8 text-center text-secondary-400 text-xs shrink-0">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-wide">Examify</span>
            <span className="text-secondary-500">|</span>
            <span>Learn Smarter, Test Better</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} Examify SaaS Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
