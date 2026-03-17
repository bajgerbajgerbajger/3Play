import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Clock, Trash2, Play, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import VideoCard from '../components/Video/VideoCard'

const History = () => {
  const { t } = useTranslation()
  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load history from localStorage
    const loadHistory = () => {
      const savedHistory = localStorage.getItem('watchHistory')
      if (savedHistory) {
        try {
          const parsed = JSON.parse(savedHistory)
          setHistory(parsed)
        } catch (error) {
          console.error('Failed to parse history:', error)
          setHistory([])
        }
      }
      setIsLoading(false)
    }

    loadHistory()
  }, [])

  const clearHistory = () => {
    if (window.confirm(t('history.clearConfirm', 'Are you sure you want to clear your watch history?'))) {
      localStorage.removeItem('watchHistory')
      setHistory([])
    }
  }

  const removeFromHistory = (videoId) => {
    const updatedHistory = history.filter(item => item._id !== videoId)
    setHistory(updatedHistory)
    localStorage.setItem('watchHistory', JSON.stringify(updatedHistory))
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-3play-card rounded skeleton" />
          <div className="h-10 w-32 bg-3play-card rounded skeleton" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-video bg-3play-card rounded-xl skeleton" />
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-3play-card skeleton flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-3play-card rounded skeleton" />
                  <div className="h-3 bg-3play-card rounded skeleton w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-16">
        <Clock className="w-16 h-16 text-3play-text-muted mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">
          {t('history.emptyTitle', 'No watch history')}
        </h2>
        <p className="text-3play-text-secondary mb-6">
          {t('history.emptyDescription', 'Videos you watch will appear here')}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-3play-accent text-white rounded-lg hover:bg-3play-accent/90 transition-colors"
        >
          <Play className="w-5 h-5" />
          {t('history.startWatching', 'Start Watching')}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {t('history.title', 'Watch History')}
          </h1>
          <p className="text-3play-text-secondary mt-1">
            {t('history.videoCount', '{{count}} videos', { count: history.length })}
          </p>
        </div>
        <button
          onClick={clearHistory}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
        >
          <Trash2 className="w-5 h-5" />
          {t('history.clearAll', 'Clear History')}
        </button>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {history.map((video) => (
          <div
            key={video._id}
            className="group flex flex-col sm:flex-row gap-4 p-4 bg-3play-card rounded-xl hover:bg-3play-border transition-colors"
          >
            {/* Thumbnail */}
            <Link to={`/watch/${video._id}`} className="relative flex-shrink-0">
              <div className="aspect-video sm:w-48 lg:w-64 rounded-lg overflow-hidden bg-3play-dark">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {video.duration && (
                  <span className="absolute bottom-2 right-2 px-2 py-1 text-xs font-medium bg-black/80 text-white rounded">
                    {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                  </span>
                )}
              </div>
            </Link>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <Link to={`/watch/${video._id}`}>
                <h3 className="text-white font-semibold line-clamp-2 group-hover:text-3play-accent transition-colors">
                  {video.title}
                </h3>
              </Link>
              <p className="text-3play-text-secondary text-sm mt-1">
                {video.owner?.name || t('video.unknownChannel', 'Unknown Channel')}
              </p>
              <p className="text-3play-text-muted text-sm mt-1">
                {video.views} {t('video.views', 'views')} • {new Date(video.watchedAt).toLocaleDateString()}
              </p>
            </div>

            {/* Actions */}
            <div className="flex sm:flex-col items-center sm:items-end gap-2">
              <button
                onClick={() => removeFromHistory(video._id)}
                className="p-2 text-3play-text-secondary hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                title={t('history.remove', 'Remove from history')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default History
