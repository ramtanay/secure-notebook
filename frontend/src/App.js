// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import PageWrapper from './components/PageWrapper';

// Lazy loaded components
const Login = React.lazy(() => import('./components/Login'));
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const NoteEditor = React.lazy(() => import('./components/NoteEditor'));
const Navbar = React.lazy(() => import('./components/Navbar'));
const FaceLogin = React.lazy(() => import('./components/FaceLogin'));
const Home = React.lazy(() => import('./components/Home'));
const FaceRegister = React.lazy(() => import('./components/FaceRegister'));
const Trash = React.lazy(() => import('./components/Trash'));
const SetPassword = React.lazy(() => import('./components/SetPassword'));

// Admin Components
const AdminLogin = React.lazy(() => import('./components/AdminLogin'));
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard'));

// -------- Layouts --------
function UserLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {children}
    </div>
  );
}

function App() {
  return (
    <Router>
      <React.Suspense
        fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}
      >
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <UserLayout>
                <PageWrapper><Home /></PageWrapper>
              </UserLayout>
            }
          />
          <Route
            path="/login"
            element={
              <UserLayout>
                <PageWrapper><Login /></PageWrapper>
              </UserLayout>
            }
          />
          <Route
            path="/face-login"
            element={
              <UserLayout>
                <PageWrapper><FaceLogin /></PageWrapper>
              </UserLayout>
            }
          />
          <Route
            path="/face-register"
            element={
              <UserLayout>
                <PageWrapper><FaceRegister /></PageWrapper>
              </UserLayout>
            }
          />

          {/* Protected User Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserLayout>
                  <PageWrapper><Dashboard /></PageWrapper>
                </UserLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/note/:id"
            element={
              <ProtectedRoute>
                <UserLayout>
                  <PageWrapper><NoteEditor /></PageWrapper>
                </UserLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/trash"
            element={
              <ProtectedRoute>
                <UserLayout>
                  <PageWrapper><Trash /></PageWrapper>
                </UserLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/set-password"
            element={
              <ProtectedRoute>
                <UserLayout>
                  <PageWrapper><SetPassword /></PageWrapper>
                </UserLayout>
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/login"
            element={
              <AdminLayout>
                <PageWrapper><AdminLogin /></PageWrapper>
              </AdminLayout>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminLayout>
                  <PageWrapper><AdminDashboard /></PageWrapper>
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route
            path="*"
            element={
              <UserLayout>
                <PageWrapper><Home /></PageWrapper>
              </UserLayout>
            }
          />
        </Routes>
      </React.Suspense>
    </Router>
  );
}

export default App;
