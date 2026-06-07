import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Globe, Mail, Shield, Zap } from 'lucide-react';
import Button from '../common/Button';
import Logo from '../common/Logo';

const PublicLayout = ({ children }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('examify_token');
  const role = localStorage.getItem('examify_role');

  const getDashboardRedirect = () => {
    if (!role) return '/login';
    const r = role.toLowerCase();
    return `/${r}/dashboard`;
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col font-sans selection:bg-primary-500 selection:text-white">
      {/* Sticky Navigation */}
      <header className="bg-white/90 backdrop-blur-md border-b border-secondary-100 sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <Logo className="h-10 w-10 shadow-lg group-hover:scale-105 transition-transform duration-300" />
            <div className="flex flex-col">
              <span className="font-bold text-secondary-900 text-xl tracking-tight leading-none">Examify</span>
              <span className="text-[10px] text-primary-600 font-bold uppercase tracking-[0.2em] mt-1">Platform</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-10">
            <a href="#features" className="text-sm font-bold text-secondary-500 hover:text-primary-600 transition-colors">Features</a>
            <a href="#solutions" className="text-sm font-bold text-secondary-500 hover:text-primary-600 transition-colors">Solutions</a>
            <a href="#pricing" className="text-sm font-bold text-secondary-500 hover:text-primary-600 transition-colors">Pricing</a>
            <a href="#contact" className="text-sm font-bold text-secondary-500 hover:text-primary-600 transition-colors">Contact</a>
          </nav>

          <div className="flex items-center gap-4">
            {token ? (
              <Button 
                variant="primary"
                onClick={() => navigate(getDashboardRedirect())}
                icon={<ArrowRight className="h-4.5 w-4.5" />}
                iconRight
                className="px-6"
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="hidden sm:inline-flex text-secondary-600 font-bold hover:text-primary-600 transition-colors px-6">
                    Log in
                  </Button>
                </Link>
                <Button 
                  variant="primary"
                  onClick={() => navigate('/register')}
                  className="px-6 shadow-lg shadow-primary-500/20"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Premium Footer - Dark Navy (#0B1120) */}
      <footer className="bg-[#0B1120] text-white pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
            {/* Brand & Desc */}
            <div className="lg:col-span-2 space-y-6">
              <Link to="/" className="flex items-center gap-3">
                <Logo className="h-10 w-10 shadow-lg" />
                <span className="font-bold text-white text-2xl tracking-tight">Examify</span>
              </Link>
              <p className="text-secondary-400 text-sm leading-relaxed max-w-sm">
                Empowering educational institutions with secure, scalable, and intelligent assessment tools designed for the modern world.
              </p>
              <div className="flex items-center gap-5">
                <a href="#" className="text-secondary-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">Facebook</a>
                <a href="#" className="text-secondary-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">Twitter</a>
                <a href="#" className="text-secondary-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">LinkedIn</a>
              </div>
            </div>

            {/* Links */}
            <div className="space-y-6">
              <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-secondary-500">Product</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-secondary-400 text-sm hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-secondary-400 text-sm hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="text-secondary-400 text-sm hover:text-white transition-colors">Proctoring</a></li>
                <li><a href="#" className="text-secondary-400 text-sm hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-secondary-500">Resources</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-secondary-400 text-sm hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-secondary-400 text-sm hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-secondary-400 text-sm hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="text-secondary-400 text-sm hover:text-white transition-colors">API Reference</a></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-secondary-500">Company</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-secondary-400 text-sm hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-secondary-400 text-sm hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-secondary-400 text-sm hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-secondary-400 text-sm hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-secondary-500 text-xs font-medium uppercase tracking-widest">
              &copy; {new Date().getFullYear()} Examify SaaS Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-8">
              <span className="text-[10px] font-bold text-secondary-600 uppercase tracking-widest">Status: Fully Operational</span>
              <span className="text-[10px] font-bold text-secondary-600 uppercase tracking-widest">Server: AWS US-East-1</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
