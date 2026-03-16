import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { CheckCircle, XCircle, Loader2, Mail, Home, RefreshCw } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const VerifyEmail = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { verifyEmail, resendVerification, user } = useAuthStore()

  const [status, setStatus] = useState('loading') // 'loading', 'success', 'error'
  const [message, setMessage] = useState('')
  const [countdown, setCountdown] = useState(3)
  const [isResending, setIsResending] = useState(false)

  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link. No token provided.')
      return
    }

    const verify = async () => {
      const result = await verifyEmail(token)

      if (result.success) {
        setStatus('success')
        setMessage(result.message)
        toast.success('Email verified successfully!')
      } else {
        setStatus('error')
        setMessage(result.message)
        toast.error(result.message || 'Verification failed')
      }
    }

    verify()
  }, [token, verifyEmail])

  // Auto-redirect on success
  useEffect(() => {
    if (status === 'success' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (status === 'success' && countdown === 0) {
      navigate('/')
    }
  }, [status, countdown, navigate])

  const handleResend = async () => {
    if (!user?.email) {
      setMessage('Please log in to resend the verification email.')
      return
    }

    setIsResending(true)
    const result = await resendVerification()
    setIsResending(false)

    if (result.success) {
      setMessage('A new verification email has been sent. Please check your inbox.')
      toast.success('Verification email sent! Check your inbox.')
    } else {
      setMessage(result.message)
      toast.error(result.message || 'Failed to resend email')
    }
  }

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <>
            <div className="w-20 h-20 bg-3play-accent/20 rounded-full flex items-center justify-center mb-6">
              <Loader2 className="w-10 h-10 text-3play-accent animate-spin" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Verifying your email...</h1>
            <p className="text-3play-text-secondary">Please wait while we verify your email address.</p>
          </>
        )

      case 'success':
        return (
          <>
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2 text-green-400">Email Verified!</h1>
            <p className="text-3play-text-secondary mb-4">{message}</p>
            <p className="text-sm text-3play-text-secondary">
              Redirecting to home in <span className="text-3play-accent font-medium">{countdown}</span> seconds...
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-3play-accent hover:bg-3play-accent-hover rounded-xl font-medium transition-colors"
            >
              <Home className="w-4 h-4" />
              Go Home Now
            </Link>
          </>
        )

      case 'error':
        return (
          <>
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2 text-red-400">Verification Failed</h1>
            <p className="text-3play-text-secondary mb-6 max-w-md">{message}</p>

            <div className="flex flex-col sm:flex-row gap-3">
              {user?.email && (
                <button
                  onClick={handleResend}
                  disabled={isResending}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-3play-accent hover:bg-3play-accent-hover disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium transition-colors"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Resend Email
                    </>
                  )}
                </button>
              )}
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-3play-card hover:bg-3play-card/80 border border-3play-border rounded-xl font-medium transition-colors"
              >
                <Home className="w-4 h-4" />
                Go Home
              </Link>
            </div>

            {!user?.email && (
              <p className="mt-4 text-sm text-3play-text-secondary">
                <Link to="/login" className="text-3play-accent hover:underline">
                  Log in
                </Link>{' '}
                to resend the verification email.
              </p>
            )}
          </>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-3play-dark px-4">
      <div className="w-full max-w-md">
        <div className="text-center">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-3play-accent rounded-2xl mb-8">
            <Mail className="w-8 h-8 text-white" />
          </div>

          {/* Content */}
          <div className="bg-3play-card border border-3play-border rounded-2xl p-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail
