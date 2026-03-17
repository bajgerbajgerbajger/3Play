import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Clock, Trash2, Play, X, Bookmark } from 'lucide-react'
import { Link } from 'react-router-dom'

const WatchLater = () => {
  const { t } = useTranslation()
  const [watchLater, setWatchLater] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load watch later from localStorage
    const loadWatchLater = () => {
      const saved = localStorage.getItem('watchLater')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setWatchLater(parsed)
        } catch (error) {
          console.error('Failed to parse watch later:', error)
          setWatchLater([])
        }
      }
      setIsLoading(false)
    }

    loadWatchLater()
  }, [])

  const clearAll = () => {
    if (window.confirm(t('watchLater.clearConfirm', 'Are you sure you want to clear your Watch Later list?'))) {
      localStorage.removeItem('watchLater')
      setWatchLater([])
    }
  }

  const removeFromList = (videoId) => {
    const updated = watchLater.filter(item => item._id !== videoId)
    setWatchLater(updated)
    localStorage.setItem('watchLater', JSON.stringify(updated))
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

  if (watchLater.length === 0) {
    return (
      <div className="text-center py-16">
        <Bookmark className="w-16 h-16 text-3play-text-muted mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">
          {t('watchLater.emptyTitle', 'Watch Later is empty')}
003e
        </h2>
        <p className="text-3play-text-secondary mb-6">
          {t('watchLater.emptyDescription', 'Save videos to watch later by clicking the bookmark button')}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-3play-accent text-white rounded-lg hover:bg-3play-accent/90 transition-colors"
        >
          <Play className="w-5 h-5" />
          {t('watchLater.browseVideos', 'Browse Videos')}
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
            {t('navigation.watchLater', 'Watch Later')}
          </h1>
          <p className="text-3play-text-secondary mt-1">
            {t('watchLater.videoCount', '{{count}} videos', { count: watchLater.length })}
          </p>
        </div>
        <button
          onClick={clearAll}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
        >
          <Trash2 className="w-5 h-5" />
          {t('watchLater.clearAll', 'Clear All')}
        </button>
      </div>

      {/* Video List */}
      <div className="space-y-4">
        {watchLater.map((video) => (
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
                {video.views} {t('video.views', 'views')} • {t('watchLater.savedOn', 'Saved on')} {new Date(video.savedAt).toLocaleDateString()}
              </p>
            </div>

            {/* Actions */}
            <div className="flex sm:flex-col items-center sm:items-end gap-2">
              <button
                onClick={() => removeFromList(video._id)}
                className="p-2 text-3play-text-secondary hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                title={t('watchLater.remove', 'Remove from list')}
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

export default WatchLater
