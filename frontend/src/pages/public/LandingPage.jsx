import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import { 
  ArrowRight, 
  CheckCircle, 
  ShieldCheck, 
  Timer, 
  BarChart3, 
  Database,
  Search,
  BookOpen
} from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <PublicLayout>
      <div className="bg-bg space-y-16 py-12 md:py-20 select-none">
        
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-primary-600 text-xs font-semibold uppercase tracking-wider">
              <span>Examify SaaS Platform</span>
            </div>
            
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-secondary-800 leading-none tracking-tight">
              Learn Smarter,<br />
              <span className="text-primary-600">Test Better.</span>
            </h1>
            
            <p className="text-secondary-500 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Examify is a SaaS examination management platform. Conduct multiple-choice exams with automated proctor logs and detailed result keys.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <Button 
                variant="primary" 
                size="lg" 
                onClick={() => navigate('/login')}
                icon={<ArrowRight className="h-5 w-5" />}
                className="w-full sm:w-auto"
              >
                Launch Platform
              </Button>
              <Link 
                to="/register" 
                className="btn-secondary px-5 py-2.5 text-base w-full sm:w-auto text-center"
              >
                Register Account
              </Link>
            </div>
          </div>

          {/* Hero visual grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <Card className="border border-secondary-200 shadow-sm" bodyClassName="p-5 space-y-2">
                <div className="h-9 w-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-sm text-secondary-800">Visual Proctoring</h4>
                <p className="text-xs text-secondary-400">Automatic proctoring logs focus loss occurrences during testing.</p>
              </Card>
              <Card className="border border-secondary-200 shadow-sm" bodyClassName="p-5 space-y-2">
                <div className="h-9 w-9 rounded-lg bg-accent-50 text-accent-600 flex items-center justify-center">
                  <Timer className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-sm text-secondary-800">Countdown Timers</h4>
                <p className="text-xs text-secondary-400">Exams auto-submit the instant the countdown timer reaches zero.</p>
              </Card>
            </div>
            <div className="space-y-4 pt-8">
              <Card className="border border-secondary-200 shadow-sm" bodyClassName="p-5 space-y-2">
                <div className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-sm text-secondary-800">Analytics Panel</h4>
                <p className="text-xs text-secondary-400">Detailed analytics lists leaderboard charts and difficult items.</p>
              </Card>
              <Card className="border border-secondary-200 shadow-sm" bodyClassName="p-5 space-y-2">
                <div className="h-9 w-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Database className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-sm text-secondary-800">SQL-Ready Engine</h4>
                <p className="text-xs text-secondary-400">MVC backend architecture isolates logic for simple SQL integration.</p>
              </Card>
            </div>
          </div>
        </section>

        {/* Feature Sections */}
        <section className="bg-white border-y border-secondary-200 py-16">
          <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
            <div className="space-y-3">
              <h2 className="font-display font-bold text-3xl text-secondary-800 tracking-tight">Role-Based System Modules</h2>
              <p className="text-secondary-500 text-sm max-w-lg mx-auto">
                Examify includes features tailored for all academic roles. Explore portals for administrators, teachers, and students.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Admin Card */}
              <div className="border border-secondary-200 rounded-xl p-6 hover:shadow-md transition-shadow text-left space-y-4">
                <div className="h-10 w-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">1</div>
                <h3 className="font-semibold text-base text-secondary-850">Administrators</h3>
                <ul className="text-xs text-secondary-500 space-y-2.5">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-500 shrink-0" />
                    Create, edit, and delete system user accounts.
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-500 shrink-0" />
                    Configure subjects and review overall system results.
                  </li>
                </ul>
              </div>

              {/* Teacher Card */}
              <div className="border border-secondary-200 rounded-xl p-6 hover:shadow-md transition-shadow text-left space-y-4">
                <div className="h-10 w-10 rounded-lg bg-blue-50 text-primary-600 flex items-center justify-center font-bold">2</div>
                <h3 className="font-semibold text-base text-secondary-850">Teachers / Instructors</h3>
                <ul className="text-xs text-secondary-500 space-y-2.5">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary-600 shrink-0" />
                    Publish subject questions and construct exams.
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary-600 shrink-0" />
                    Review student answers and view cheating flags.
                  </li>
                </ul>
              </div>

              {/* Student Card */}
              <div className="border border-secondary-200 rounded-xl p-6 hover:shadow-md transition-shadow text-left space-y-4">
                <div className="h-10 w-10 rounded-lg bg-emerald-50 text-accent-600 flex items-center justify-center font-bold">3</div>
                <h3 className="font-semibold text-base text-secondary-850">Students</h3>
                <ul className="text-xs text-secondary-500 space-y-2.5">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-accent-600 shrink-0" />
                    Browse active quizzes and read test instructions.
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-accent-600 shrink-0" />
                    Submit assessments and review scoring details.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
};

export default LandingPage;
