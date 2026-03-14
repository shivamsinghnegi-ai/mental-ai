import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import LoginPage from './pages/Login/LoginPage';
import SignupPage from './pages/Signup/SignupPage';
import DashboardPage from './pages/Home/DashboardPage';
import ChatPage from './pages/Chat/ChatPage';
import HistoryPage from './pages/History/HistoryPage';
import MoodLogPage from './pages/Mood/MoodLogPage';
import BreathePage from './pages/Breathe/BreathePage';
import MeditatePage from './pages/Meditate/MeditatePage';
import JournalPage from './pages/Journal/JournalPage';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/breathe" element={<BreathePage />} />
            <Route path="/meditate" element={<MeditatePage />} />
            <Route path="/journal" element={<JournalPage />} />
          </Route>

          {/* Protected Routes without Navbar */}
          <Route path="/chat" element={
            <ProtectedRouteWrapper>
              <ChatPage />
            </ProtectedRouteWrapper>
          } />
          <Route path="/mood" element={
            <ProtectedRouteWrapper>
              <MoodLogPage />
            </ProtectedRouteWrapper>
          } />

          {/* Fallback routing */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>

      <Toaster 
        position="top-center" 
        containerStyle={{ zIndex: 99999 }}
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: 'Inter, sans-serif',
            borderRadius: '12px',
            background: '#FFFFFF',
            color: '#1F2937',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            border: '1px solid #E5E7EB',
            padding: '12px 16px',
            fontSize: '14px',
            maxWidth: '400px',
          },
          success: {
            iconTheme: {
              primary: 'var(--primary)',
              secondary: 'white',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: '#FEF2F2',
              color: '#991B1B',
              border: '1px solid #FECACA',
            },
            iconTheme: {
              primary: '#EF4444',
              secondary: 'white',
            },
          },
        }} 
      />
    </>
  );
}

// Helper wrapper for protected pages that shouldn't show the Navbar
import useAuthStore from './store/authStore';
function ProtectedRouteWrapper({ children }) {
  const token = useAuthStore((state) => state.token);
  if (!token) return <Navigate to="/login" replace />;
  return <main className="animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>{children}</main>;
}

export default App;
