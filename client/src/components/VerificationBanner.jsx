import { useState } from 'react'
import { AlertCircle, X, Loader2 } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const VerificationBanner = () => {
  const { user, isAuthenticated, resendVerification } = useAuthStore()
  const [isResending, setIsResending] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  // Only show for authenticated users with unverified emails
  if (!isAuthenticated || !user || user.isVerified || isDismissed) {
    return null
  }

  const handleResend = async () => {
    setIsResending(true)

    const result = await resendVerification()

    setIsResending(false)
    if (result.success) {
      toast.success('Verification email sent! Check your inbox.')
    } else {
      toast.error(result.message || 'Failed to resend verification email')
    }
  }

  return (
    <div className="sticky top-16 z-40 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border-b border-amber-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-amber-100">
                <span className="font-medium">Please verify your email</span>
                <span className="hidden sm:inline"> to unlock all features including video uploads</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleResend}
              disabled={isResending}
              className="px-4 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-amber-200 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              {isResending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Sending...</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Resend Email</span>
                  <span className="sm:hidden">Resend</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsDismissed(true)}
              className="p-1.5 text-amber-400/60 hover:text-amber-200 hover:bg-amber-500/10 rounded-lg transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerificationBanner
