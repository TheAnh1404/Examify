import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Layouts & Routing Guards
import ProtectedRoute from './components/layout/ProtectedRoute';
import RoleBasedRoute from './components/layout/RoleBasedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import PublicLayout from './components/layout/PublicLayout';

// Public & Auth Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import Unauthorized from './pages/auth/Unauthorized';
import NotFound from './pages/auth/NotFound';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import CreateUser from './pages/admin/CreateUser';
import EditUser from './pages/admin/EditUser';
import SubjectManagement from './pages/admin/SubjectManagement';
import AdminResults from './pages/admin/AdminResults';
import SystemSettings from './pages/admin/SystemSettings';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import QuestionBank from './pages/teacher/QuestionBank';
import CreateQuestion from './pages/teacher/CreateQuestion';
import QuestionDetail from './pages/teacher/QuestionDetail';
import EditQuestion from './pages/teacher/EditQuestion';
import ExamList from './pages/teacher/ExamList';
import CreateExamWizard from './pages/teacher/CreateExamWizard';
import ExamDetail from './pages/teacher/ExamDetail';
import ManageExamQuestions from './pages/teacher/ManageExamQuestions';
import ResultsManagement from './pages/teacher/ResultsManagement';
import AttemptDetail from './pages/teacher/AttemptDetail';
import Analytics from './pages/teacher/Analytics';
import ClassroomList from './pages/classroom/ClassroomList';
import ClassroomDetail from './pages/classroom/ClassroomDetail';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import AvailableExams from './pages/student/AvailableExams';
import ExamInstruction from './pages/student/ExamInstruction';
import ExamTaking from './pages/student/ExamTaking';
import StudentResult from './pages/student/StudentResult';
import ExamHistory from './pages/student/ExamHistory';
import Profile from './pages/student/Profile';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public & Guest Routes */}
          <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          {/* Error pages */}
          <Route path="/403" element={<Unauthorized />} />
          <Route path="/404" element={<NotFound />} />

          {/* ADMIN PORTAL (Dashboard Layout Wrapped) */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['ADMIN']}>
                <DashboardLayout><AdminDashboard /></DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['ADMIN']}>
                <DashboardLayout><UserManagement /></DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/admin/users/create" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['ADMIN']}>
                <DashboardLayout><CreateUser /></DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/admin/users/:id/edit" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['ADMIN']}>
                <DashboardLayout><EditUser /></DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/admin/subjects" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['ADMIN']}>
                <DashboardLayout><SubjectManagement /></DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/admin/results" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['ADMIN']}>
                <DashboardLayout><AdminResults /></DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/admin/results/:id" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['ADMIN']}>
                <DashboardLayout><AttemptDetail /></DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['ADMIN']}>
                <DashboardLayout><SystemSettings /></DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/admin/profile" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['ADMIN']}>
                <DashboardLayout><Profile /></DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />

          {/* TEACHER PORTAL (Dashboard Layout Wrapped) */}
          <Route path="/teacher" element={<Navigate to="/teacher/dashboard" replace />} />
          <Route path="/teacher/dashboard" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['TEACHER']}>
                <DashboardLayout><TeacherDashboard /></DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/teacher/classrooms" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['TEACHER']}>
                <DashboardLayout><ClassroomList /></DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/teacher/classrooms/:id" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['TEACHER']}>
                <DashboardLayout><ClassroomDetail /></DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/teacher/questions" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['TEACHER']}>
                <DashboardLayout><QuestionBank /></DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/teacher/questions/create" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['TEACHER']}>
                <DashboardLayout><CreateQuestion /></DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/teacher/questions/:id" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['TEACHER']}>
                <DashboardLayout><QuestionDetail /></DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/teacher/questions/:id/edit" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['TEACHER']}>
                <DashboardLayout><EditQuestion /></DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/teacher/exams" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['TEACHER']}>
                <DashboardLayout><ExamList /></DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/teacher/exams/create" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['TEACHER']}>
                <DashboardLayout><CreateExamWizard /></DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/teacher/exams/:id" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['TEACHER']}>
                <DashboardLayout><ExamDetail /></DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/teacher/exams/:id/questions" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['TEACHER']}>
                <DashboardLayout><ManageExamQuestions /></DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/teacher/results" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['TEACHER']}>
                <DashboardLayout><ResultsManagement /></DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/teacher/results/:id" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['TEACHER']}>
                <DashboardLayout><AttemptDetail /></DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/teacher/analytics" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['TEACHER']}>
                <DashboardLayout><Analytics /></DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/teacher/profile" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['TEACHER']}>
                <DashboardLayout><Profile /></DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />

          {/* STUDENT PORTAL */}
          <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
          <Route path="/student/dashboard" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['STUDENT']}>
                <DashboardLayout><StudentDashboard /></DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/student/classrooms" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['STUDENT']}>
                <DashboardLayout><ClassroomList /></DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/student/classrooms/:id" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['STUDENT']}>
                <DashboardLayout><ClassroomDetail /></DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/student/exams" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['STUDENT']}>
                <DashboardLayout><AvailableExams /></DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/student/exams/:id/instruction" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['STUDENT']}>
                <DashboardLayout><ExamInstruction /></DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/student/results/:attemptId" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['STUDENT']}>
                <DashboardLayout><StudentResult /></DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/student/attempts" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['STUDENT']}>
                <DashboardLayout><ExamHistory /></DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/student/profile" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['STUDENT']}>
                <DashboardLayout><Profile /></DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />

          {/* Dynamic Immersive Proctored Exam Taking Route (No Sidebar Layout!) */}
          <Route path="/student/exams/:id/take" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['STUDENT']}>
                <ExamTaking />
              </RoleBasedRoute>
            </ProtectedRoute>
          } />

          {/* Catch-all 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
