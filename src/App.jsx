import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Setup from './pages/Setup';
import Dashboard from './pages/Dashboard';
import WorkflowEditor from './pages/WorkflowEditor';
import ProtectedRoute from './components/ProtectedRoute';
import apiClient from './api/client';

export default function App() {
  const [setupStatus, setSetupStatus] = useState(null); // null = lädt noch

  useEffect(() => {
    checkSetupStatus();
  }, []);

  async function checkSetupStatus() {
    try {
      const { data } = await apiClient.get('/auth/setup-status');
      setSetupStatus(data.isSetupComplete);
    } catch (err) {
      setSetupStatus(true);
    }
  }

  if (setupStatus === null) {
    return (
      <div style={styles.loadingContainer}>
        <p style={styles.loadingText}>Lädt...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/setup"
          element={setupStatus ? <Navigate to="/login" replace /> : <Setup />}
        />
        <Route
          path="/login"
          element={setupStatus ? <Login /> : <Navigate to="/setup" replace />}
        />
        <Route
          path="/"
          element={
            !setupStatus ? (
              <Navigate to="/setup" replace />
            ) : (
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            )
          }
        />
        <Route
          path="/workflows/:id"
          element={
            <ProtectedRoute>
              <WorkflowEditor />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

const styles = {
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: '#0f1117',
  },
  loadingText: { color: '#8b8fa3', fontFamily: 'system-ui, sans-serif' },
};
