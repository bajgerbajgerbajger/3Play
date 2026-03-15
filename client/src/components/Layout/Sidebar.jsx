import { Link, useLocation } from 'react-router-dom'
import {
  Home,
  TrendingUp,
  Users,
  Library,
  History,
  Clock,
  ThumbsUp,
  Settings,
  HelpCircle,
  Flag,
  MessageSquare,
  Download
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation()
  const { isAuthenticated } = useAuthStore()

  const mainLinks = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: TrendingUp, label: 'Trending', path: '/trending' },
    { icon: Users, label: 'Subscriptions', path: '/subscriptions', auth: true },
  ]

  const libraryLinks = [
    { icon: Library, label: 'Library', path: '/library', auth: true },
    { icon: History, label: 'History', path: '/history', auth: true },
    { icon: Clock, label: 'Watch Later', path: '/watch-later', auth: true },
    { icon: ThumbsUp, label: 'Liked Videos', path: '/liked', auth: true },
    { icon: Download, label: 'Downloads', path: '/downloads', auth: true },
  ]

  const moreLinks = [
    { icon: Settings, label: 'Settings', path: '/settings', auth: true },
    { icon: Flag, label: 'Report history', path: '/reports', auth: true },
    { icon: HelpCircle, label: 'Help', path: '/help' },
    { icon: MessageSquare, label: 'Send feedback', path: '/feedback' },
  ]

  const isActive = (path) => location.pathname === path

  const renderLink = (link) => {
    if (link.auth && !isAuthenticated) return null

    const Icon = link.icon
    const active = isActive(link.path)

    return (
      <Link
        key={link.path}
        to={link.path}
        onClick={onClose}
        className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
          active
            ? 'bg-3play-accent/20 text-3play-accent font-medium'
            : 'hover:bg-3play-card text-3play-text-secondary hover:text-white'
        }`}
      >
        <Icon className={`w-5 h-5 ${active ? 'text-3play-accent' : ''}`} />
        <span>{link.label}</span>
      </Link>
    )
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 bottom-0 w-64 bg-3play-dark border-r border-3play-border z-50 transform transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } overflow-y-auto`}
      >
        <div className="p-3 space-y-6">
          {/* Main section */}
          <div className="space-y-1">
            {mainLinks.map(renderLink)}
          </div>

          <hr className="border-3play-border" />

          {/* Library section */}
          {isAuthenticated && (
            <>
              <div className="space-y-1">
                <p className="px-4 text-sm font-semibold text-3play-text-secondary uppercase tracking-wider">
                  Library
                </p>
                {libraryLinks.map(renderLink)}
              </div>
              <hr className="border-3play-border" />
            </>
          )}

          {/* More section */}
          <div className="space-y-1">
            <p className="px-4 text-sm font-semibold text-3play-text-secondary uppercase tracking-wider">
              More
            </p>
            {moreLinks.map(renderLink)}
          </div>

          <hr className="border-3play-border" />

          {/* Footer */}
          <div className="px-4 py-2 text-xs text-3play-text-muted">
            <p>© 2024 3Play Inc.</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Link to="/about" className="hover:text-white">About</Link>
              <Link to="/privacy" className="hover:text-white">Privacy</Link>
              <Link to="/terms" className="hover:text-white">Terms</Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
