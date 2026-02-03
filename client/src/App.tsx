import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuthStore } from './stores/authStore'

function App() {
  const { isAuthenticated, user } = useAuthStore()

  // Consider user fully authenticated only if both flags are true
  const isFullyAuthenticated = isAuthenticated && user;

  return (
    <Router>
      <div className="App">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        
        <Routes>
          <Route 
            path="/" 
            element={
              isFullyAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/login" 
            element={
              isFullyAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login />
              )
            } 
          />
          <Route 
            path="/register" 
            element={
              isFullyAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Register />
              )
            } 
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
