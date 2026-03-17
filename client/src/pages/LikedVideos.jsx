import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ThumbsUp, Play, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import api from '../api/axios'
import VideoCard from '../components/Video/VideoCard'

const LikedVideos = () => {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuthStore()
  const [videos, setVideos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchLikedVideos = async () => {
      if (!isAuthenticated) {
        setIsLoading(false)
        return
      }

      try {
        // For now, we'll use localStorage as a fallback
        // In a real app, this would call an API endpoint
        const savedLikes = localStorage.getItem('likedVideos')
        if (savedLikes) {
          const parsed = JSON.parse(savedLikes)
          setVideos(parsed)
        }
      } catch (err) {
        console.error('Failed to fetch liked videos:', err)
        setError(t('errors.loadVideos', 'Failed to load videos'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchLikedVideos()
  }, [isAuthenticated, t])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-3play-card rounded skeleton" />
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

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-3play-text-secondary">{error}</p>
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-16">
        <ThumbsUp className="w-16 h-16 text-3play-text-muted mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">
          {t('likedVideos.emptyTitle', 'No liked videos')}
        </h2>
        <p className="text-3play-text-secondary mb-6">
          {t('likedVideos.emptyDescription', 'Videos you like will appear here')}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-3play-accent text-white rounded-lg hover:bg-3play-accent/90 transition-colors"
        >
          <Play className="w-5 h-5" />
          {t('likedVideos.discoverVideos', 'Discover Videos')}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          {t('navigation.likedVideos', 'Liked Videos')}
        </h1>
        <p className="text-3play-text-secondary mt-1">
          {t('likedVideos.videoCount', '{{count}} videos', { count: videos.length })}
        </p>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {videos.map((video) => (
          <VideoCard key={video._id} video={video} />
        ))}
      </div>
    </div>
  )
}

export default LikedVideos
