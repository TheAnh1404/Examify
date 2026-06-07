import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Layout & Protect Route
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Common Pages
import Unauthorized from './pages/common/Unauthorized';
import NotFound from './pages/common/NotFound';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import ExamBuilder from './pages/teacher/ExamBuilder';
import TeacherSubmissions from './pages/teacher/TeacherSubmissions';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import ExamTake from './pages/student/ExamTake';
import ExamResults from './pages/student/ExamResults';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Root Portal Redirection */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Admin routes (Layout wrapped) */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout>
                <AdminDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout>
                <UserManagement />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Teacher routes (Layout wrapped) */}
          <Route path="/teacher" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <DashboardLayout>
                <TeacherDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/teacher/exams" element={
            <Navigate to="/teacher" replace />
          } />
          <Route path="/teacher/exams/new" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <DashboardLayout>
                <ExamBuilder />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/teacher/exams/edit/:id" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <DashboardLayout>
                <ExamBuilder />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/teacher/submissions" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <DashboardLayout>
                <TeacherSubmissions />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Student routes (Layout wrapped) */}
          <Route path="/student" element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout>
                <StudentDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/student/exams" element={
            <Navigate to="/student" replace />
          } />
          <Route path="/student/history" element={
            <Navigate to="/student" replace />
          } />
          <Route path="/student/history/:id" element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout>
                <ExamResults />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Dynamic Immersive Proctored Exam Taking Route (No Sidebar Layout!) */}
          <Route path="/student/exams/take/:id" element={
            <ProtectedRoute allowedRoles={['student']}>
              <ExamTake />
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
