import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, Menu, Bell, Upload, User, LogOut, Settings } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useTranslation } from 'react-i18next'

const Navbar = ({ onMenuClick }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { t } = useTranslation()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
    setShowUserMenu(false)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-3play-dark/95 backdrop-blur-md border-b border-3play-border">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-full hover:bg-3play-card transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-3play-accent rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <span className="text-xl font-bold hidden sm:block">3Play</span>
          </Link>
        </div>

        {/* Center section - Search */}
        <div className="flex-1 max-w-2xl mx-4 hidden sm:block">
          <form onSubmit={handleSearch} className="relative">
            <div className="flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('navigation.searchPlaceholder')}
                className="flex-1 bg-3play-card border border-3play-border rounded-l-full px-4 py-2 focus:outline-none focus:border-3play-accent transition-colors"
              />
              <button
                type="submit"
                className="bg-3play-card border border-l-0 border-3play-border rounded-r-full px-5 py-2 hover:bg-3play-border transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Mobile search button */}
          <button
            className="sm:hidden p-2 rounded-full hover:bg-3play-card transition-colors"
            onClick={() => navigate('/search')}
          >
            <Search className="w-6 h-6" />
          </button>

          {isAuthenticated ? (
            <>
              <Link
                to="/upload"
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-3play-card hover:bg-3play-border transition-colors"
              >
                <Upload className="w-5 h-5" />
                <span className="font-medium">{t('navigation.upload')}</span>
              </Link>

              <button className="p-2 rounded-full hover:bg-3play-card transition-colors relative">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-3play-accent rounded-full"></span>
              </button>

              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-9 h-9 rounded-full bg-3play-accent flex items-center justify-center font-semibold hover:ring-2 ring-3play-accent/50 transition-all"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span>{user?.name?.[0]?.toUpperCase() || 'U'}</span>
                  )}
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-3play-card rounded-xl shadow-xl border border-3play-border py-2 animate-fade-in">
                    <div className="px-4 py-3 border-b border-3play-border">
                      <p className="font-semibold truncate">{user?.name}</p>
                      <p className="text-sm text-3play-text-secondary truncate">{user?.email}</p>
                    </div>

                    <Link
                      to={`/profile/${user?.id}`}
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-3play-dark transition-colors"
                    >
                      <User className="w-5 h-5" />
                      <span>{t('navigation.yourChannel')}</span>
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-3play-dark transition-colors"
                    >
                      <Settings className="w-5 h-5" />
                      <span>{t('navigation.settings')}</span>
                    </Link>

                    <hr className="my-2 border-3play-border" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-3play-dark transition-colors text-red-400"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>{t('navigation.signOut')}</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 rounded-full border border-3play-border hover:bg-3play-card transition-colors"
              >
                {t('navigation.signIn')}
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-full bg-3play-accent hover:bg-3play-accent-hover transition-colors font-medium"
              >
                {t('navigation.signUp')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
