import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import { 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Timer, 
  BarChart3, 
  Database,
  Lock,
  Zap,
  Users,
  Award,
  BookOpen,
  MousePointer2,
  Sparkles,
  Globe
} from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white select-none overflow-hidden">
        
        {/* Hero Section */}
        <section className="relative pt-16 pb-24 lg:pt-28 lg:pb-32 px-6">
          {/* Background Gradient */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary-50 rounded-full blur-[120px] opacity-70" />
            <div className="absolute bottom-0 left-[-5%] w-[500px] h-[500px] bg-accent-50 rounded-full blur-[100px] opacity-60" />
          </div>

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8 text-center lg:text-left animate-fade-in">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-primary-50 border border-primary-100 text-primary-600 text-xs font-extrabold uppercase tracking-widest">
                <div className="h-2 w-2 rounded-full bg-primary-600 animate-pulse" />
                <span>Learn Smarter, Test Better</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-extrabold text-[#0F172A] leading-[1.05] tracking-tight">
                Online Exam Management <br className="hidden xl:block" />
                <span className="text-primary-600">Made Simple.</span>
              </h1>
              
              <p className="text-secondary-500 text-lg lg:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Create exams, manage question banks, automate grading, and track student performance with a powerful SaaS platform designed for modern education.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Button 
                  variant="primary" 
                  size="lg" 
                  onClick={() => navigate('/login')}
                  className="px-10 h-14 shadow-xl shadow-primary-500/25 text-base"
                  icon={<ArrowRight className="h-5 w-5" />}
                  iconRight
                >
                  Start Free Trial
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => navigate('/register')}
                  className="px-10 h-14 border-secondary-200 text-secondary-900 font-bold hover:bg-secondary-50 text-base bg-white"
                >
                  View Live Demo
                </Button>
              </div>

              {/* Social Proof Hero */}
              <div className="pt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-secondary-100 flex items-center justify-center overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="h-full w-full object-cover" />
                    </div>
                  ))}
                  <div className="h-10 w-10 rounded-full border-2 border-white bg-primary-600 flex items-center justify-center text-white text-[10px] font-bold">
                    +500
                  </div>
                </div>
                <p className="text-sm font-bold text-secondary-400">
                  Trusted by <span className="text-secondary-900">500+ educators</span> worldwide
                </p>
              </div>
            </div>

            {/* Right Content: Mockup */}
            <div className="relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="relative rounded-3xl border border-secondary-200 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] bg-white p-3 rotate-1 lg:rotate-3 hover:rotate-0 transition-transform duration-700">
                <div className="bg-bg rounded-2xl overflow-hidden aspect-[4/3] relative">
                  {/* Fake UI Content */}
                  <div className="absolute inset-0 p-6 space-y-6">
                    <div className="h-8 w-48 bg-white rounded-lg shadow-sm" />
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-24 bg-white rounded-xl shadow-sm border border-secondary-100" />
                      <div className="h-24 bg-white rounded-xl shadow-sm border border-secondary-100" />
                      <div className="h-24 bg-white rounded-xl shadow-sm border border-secondary-100" />
                    </div>
                    <div className="h-40 bg-white rounded-xl shadow-sm border border-secondary-100" />
                    <div className="h-20 bg-white rounded-xl shadow-sm border border-secondary-100" />
                  </div>
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/5 to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute top-10 -right-8 xl:-right-12 animate-bounce" style={{ animationDuration: '5s' }}>
                <div className="saas-card p-4 flex items-center gap-4 shadow-2xl border-primary-100">
                  <div className="h-10 w-10 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center">
                    <TrendingUpIcon />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Avg. Score</p>
                    <p className="text-lg font-bold text-secondary-900 leading-none">85.4%</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-8 xl:-left-12 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                <div className="saas-card p-4 flex items-center gap-4 shadow-2xl border-primary-100">
                  <div className="h-10 w-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Auto Grading</p>
                    <p className="text-lg font-bold text-secondary-900 leading-none">98% Accuracy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="bg-white border-y border-secondary-100 py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
              {[
                { label: 'Exams Created', value: '1.2K+', icon: BookOpen },
                { label: 'Student Attempts', value: '25K+', icon: MousePointer2 },
                { label: 'Auto Grading', value: '98%', icon: Zap },
                { label: 'Teachers Active', value: '500+', icon: Users }
              ].map((stat, idx) => (
                <div key={idx} className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                      <stat.icon className="h-4 w-4" />
                    </div>
                    <span className="text-3xl font-extrabold text-secondary-900 tracking-tighter">{stat.value}</span>
                  </div>
                  <p className="text-sm font-bold text-secondary-400 uppercase tracking-widest pl-11">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 lg:py-32 bg-secondary-50/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
              <h2 className="text-xs font-bold text-primary-600 uppercase tracking-[0.2em]">Core Capabilities</h2>
              <h3 className="text-3xl lg:text-5xl font-extrabold text-secondary-900 tracking-tight">Enterprise Assessment Infrastructure</h3>
              <p className="text-secondary-500 text-lg font-medium leading-relaxed">
                Everything you need to conduct high-stakes examinations at scale with confidence and security.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: ShieldCheck, color: 'bg-blue-50 text-blue-600', title: 'Smart Proctoring', desc: 'Real-time focus tracking and tab switching logs for every student attempt.' },
                { icon: Timer, color: 'bg-emerald-50 text-emerald-600', title: 'Automated Timers', desc: 'Precision countdowns with instant submission upon clock expiration.' },
                { icon: BarChart3, color: 'bg-indigo-50 text-indigo-600', title: 'Rich Analytics', desc: 'Detailed heatmaps and difficulty ratings for every question in your bank.' },
                { icon: Lock, color: 'bg-rose-50 text-rose-600', title: 'Payload Security', desc: 'Answers are never sent to the client. All grading logic is 100% server-side.' },
                { icon: Database, color: 'bg-amber-50 text-amber-600', title: 'Question Banking', desc: 'Build a centralized repository of questions tagged by subject and difficulty.' },
                { icon: Globe, color: 'bg-purple-50 text-purple-600', title: 'Global Access', desc: 'Students can attempt assessments from anywhere with a stable internet connection.' }
              ].map((feat, idx) => (
                <div key={idx} className="saas-card p-10 hover:translate-y-[-8px] transition-all duration-300 border-none shadow-sm hover:shadow-2xl hover:shadow-primary-500/10">
                  <div className={`h-14 w-14 rounded-2xl ${feat.color} flex items-center justify-center mb-8 shadow-sm`}>
                    <feat.icon className="h-7 w-7" />
                  </div>
                  <h4 className="text-xl font-bold text-secondary-900 mb-4 tracking-tight">{feat.title}</h4>
                  <p className="text-secondary-500 leading-relaxed font-medium text-sm">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 lg:py-32 px-6 bg-white">
          <div className="max-w-6xl mx-auto rounded-[3rem] bg-[#0F172A] p-12 lg:p-24 text-center relative overflow-hidden shadow-2xl">
            {/* Background Orbs */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-600/20 rounded-full blur-[120px] -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent-500/10 rounded-full blur-[100px] -ml-24 -mb-24" />
            
            <div className="relative z-10 max-w-3xl mx-auto space-y-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-widest">
                <Sparkles className="h-4 w-4 text-accent-400" />
                <span>Ready to start?</span>
              </div>
              
              <h2 className="text-4xl lg:text-6xl font-extrabold text-white tracking-tighter leading-[1.1]">
                Transform your assessment process today.
              </h2>
              
              <p className="text-secondary-400 text-lg lg:text-xl font-medium leading-relaxed">
                Join 500+ global institutions using Examify to deliver secure and intelligent examinations.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button variant="primary" size="lg" className="px-12 h-14 shadow-2xl shadow-primary-500/40 text-base" onClick={() => navigate('/login')}>
                  Get Started for Free
                </Button>
                <Button variant="outline" size="lg" className="px-12 h-14 border-white/20 text-white hover:bg-white/10 text-base bg-transparent">
                  Schedule Demo
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
  );
};

// Inline Icon
const TrendingUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 16 8.5 11 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
);

export default LandingPage;
