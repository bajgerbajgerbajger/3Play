import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Play, Check, X } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { register, isLoading, error, clearError } = useAuthStore()

  const passwordRequirements = [
    { label: 'At least 8 characters', test: (p) => p.length >= 8 },
    { label: 'Contains uppercase letter', test: (p) => /[A-Z]/.test(p) },
    { label: 'Contains lowercase letter', test: (p) => /[a-z]/.test(p) },
    { label: 'Contains number', test: (p) => /\d/.test(p) },
    { label: 'Contains special character', test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
  ]

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (error) clearError()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      return
    }

    const result = await register(formData.name, formData.email, formData.password)
    if (result.success) {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-3play-dark px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-3play-accent rounded-2xl mb-4">
            <Play className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Create account</h1>
          <p className="text-3play-text-secondary">Join 3Play today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              minLength={2}
              maxLength={50}
              className="w-full px-4 py-3 bg-3play-card border border-3play-border rounded-xl focus:outline-none focus:border-3play-accent transition-colors"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-3play-card border border-3play-border rounded-xl focus:outline-none focus:border-3play-accent transition-colors"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-3play-card border border-3play-border rounded-xl focus:outline-none focus:border-3play-accent transition-colors"
                placeholder="Create a password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-3play-text-secondary hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Password requirements */}
            {formData.password && (
              <ul className="mt-2 space-y-1">
                {passwordRequirements.map((req, i) => (
                  <li
                    key={i}
                    className={`flex items-center gap-2 text-sm ${
                      req.test(formData.password) ? 'text-green-400' : 'text-3play-text-muted'
                    }`}
                  >
                    {req.test(formData.password) ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                    {req.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-3play-card border border-3play-border rounded-xl focus:outline-none focus:border-3play-accent transition-colors"
              placeholder="Confirm your password"
            />
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="mt-1 text-sm text-red-400">Passwords do not match</p>
            )}
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="terms"
              required
              className="mt-1 rounded border-3play-border bg-3play-card text-3play-accent focus:ring-3play-accent"
            />
            <label htmlFor="terms" className="text-sm text-3play-text-secondary">
              I agree to the{' '}
              <Link to="/terms" className="text-3play-accent hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-3play-accent hover:underline">Privacy Policy</Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading || formData.password !== formData.confirmPassword}
            className="w-full py-3 bg-3play-accent hover:bg-3play-accent-hover rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-center text-3play-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-3play-accent hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Register
