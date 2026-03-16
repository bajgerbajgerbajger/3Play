import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import Layout from './components/Layout/Layout'
import Home from './pages/Home'
import Watch from './pages/Watch'
import Upload from './pages/Upload'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Search from './pages/Search'
import Subscriptions from './pages/Subscriptions'
import Trending from './pages/Trending'
import Library from './pages/Library'
import Downloads from './pages/Downloads'
import VerifyEmail from './pages/VerifyEmail'

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-3play-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-3play-accent"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

// Public route (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-3play-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-3play-accent"></div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return children
}

function App() {
  const { checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/watch/:id" element={<Layout><Watch /></Layout>} />
        <Route path="/search" element={<Layout><Search /></Layout>} />
        <Route path="/trending" element={<Layout><Trending /></Layout>} />
        <Route path="/upload" element={
          <ProtectedRoute>
            <Layout><Upload /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/profile/:id?" element={
          <ProtectedRoute>
            <Layout><Profile /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/subscriptions" element={
          <ProtectedRoute>
            <Layout><Subscriptions /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/library" element={
          <ProtectedRoute>
            <Layout><Library /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/downloads" element={
          <ProtectedRoute>
            <Layout><Downloads /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="*" element={<Layout><div className="p-8 text-center">Page not found</div></Layout>} />
      </Routes>
    </Router>
  )
}

export default App
