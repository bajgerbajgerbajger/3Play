import { useQuery } from '@tanstack/react-query'
import { History, Clock, ThumbsUp, PlaySquare, Film } from 'lucide-react'
import { Link } from 'react-router-dom'
import VideoCard from '../components/Video/VideoCard'
import api from '../api/axios'

const Library = () => {
  const { data: userVideos, isLoading } = useQuery({
    queryKey: ['user-videos'],
    queryFn: async () => {
      const response = await api.get('/videos/user')
      return response.data.data.videos
    },
  })

  const sections = [
    { icon: History, label: 'History', path: '/history', count: 0 },
    { icon: Clock, label: 'Watch Later', path: '/watch-later', count: 0 },
    { icon: ThumbsUp, label: 'Liked Videos', path: '/liked', count: 0 },
    { icon: PlaySquare, label: 'Your Videos', path: '/profile', count: userVideos?.length || 0 },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Library</h1>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {sections.map((section) => (
          <Link
            key={section.path}
            to={section.path}
            className="flex items-center gap-3 p-4 bg-3play-card rounded-xl hover:bg-3play-border transition-colors"
          >
            <div className="w-10 h-10 bg-3play-accent/20 rounded-lg flex items-center justify-center">
              <section.icon className="w-5 h-5 text-3play-accent" />
            </div>
            <div>
              <p className="font-medium">{section.label}</p>
              <p className="text-sm text-3play-text-secondary">{section.count} videos</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Your Videos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Film className="w-5 h-5 text-3play-accent" />
            <h2 className="text-lg font-semibold">Your Videos</h2>
          </div>
          <Link to="/upload" className="text-3play-accent hover:underline text-sm">
            Upload new
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
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
        ) : userVideos?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {userVideos.slice(0, 4).map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-3play-card rounded-xl">
            <Film className="w-12 h-12 mx-auto mb-4 text-3play-text-muted" />
            <p className="text-3play-text-secondary mb-4">You haven't uploaded any videos yet</p>
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-6 py-3 bg-3play-accent hover:bg-3play-accent-hover rounded-xl font-medium transition-colors"
            >
              Upload your first video
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Library
