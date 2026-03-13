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
        toastOptions={{
          style: {
            fontFamily: 'Inter, sans-serif',
            borderRadius: '12px',
            background: 'var(--surface)',
            color: 'var(--text-main)',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--border)',
          },
          success: {
            iconTheme: {
              primary: 'var(--primary)',
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
