import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import HealthData from './pages/HealthData';
import HealthAnalysis from './pages/HealthAnalysis';
import Copilot from './pages/Copilot';
import Medications from './pages/Medications';
import Symptoms from './pages/Symptoms';
import Profile from './pages/Profile';
import Nutrition from './pages/Nutrition';
import Loading from './components/Loading';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loading text="Verifying session credentials..." fullPage={true} />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// Layout Wrapper
function Layout() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Pages where sidebar should be visible
  const isAppRoute = [
    '/dashboard',
    '/health',
    '/health-analysis',
    '/copilot',
    '/medications',
    '/symptoms',
    '/nutrition',
    '/profile',
  ].some((path) => location.pathname.startsWith(path));

  const showSidebar = isAuthenticated && isAppRoute;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <Toast />

      <div style={{ display: 'flex', flex: 1, width: '100%' }}>
        {showSidebar && <Sidebar />}

        <main className="main-content" style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/signup" element={<Register />} />

            {/* Public/Hybrid Pages */}
            <Route path="/medications" element={<Medications />} />
            <Route path="/symptoms" element={<Symptoms />} />

            {/* Protected Pages */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/health"
              element={
                <ProtectedRoute>
                  <HealthData />
                </ProtectedRoute>
              }
            />
            <Route
              path="/health-analysis"
              element={
                <ProtectedRoute>
                  <HealthAnalysis />
                </ProtectedRoute>
              }
            />
            <Route
              path="/copilot"
              element={
                <ProtectedRoute>
                  <Copilot />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nutrition"
              element={
                <ProtectedRoute>
                  <Nutrition />
                </ProtectedRoute>
              }
            />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Layout />
      </HashRouter>
    </AuthProvider>
  );
}
