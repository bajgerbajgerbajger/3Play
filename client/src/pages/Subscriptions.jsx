import { useQuery } from '@tanstack/react-query'
import { Users, Bell } from 'lucide-react'
import VideoCard from '../components/Video/VideoCard'
import { useAuthStore } from '../store/authStore'
import api from '../api/axios'

const Subscriptions = () => {
  const { user } = useAuthStore()

  const { data: videos, isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      const response = await api.get('/users/subscriptions/videos')
      return response.data.data.videos
    },
  })

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-3play-accent/20 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-3play-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Subscriptions</h1>
            <p className="text-3play-text-secondary">Latest videos from channels you follow</p>
          </div>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-3play-card hover:bg-3play-border transition-colors">
          <Bell className="w-5 h-5" />
          <span className="hidden sm:inline">Manage</span>
        </button>
      </div>

      {isLoading ? (
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
      ) : videos?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Users className="w-16 h-16 mx-auto mb-4 text-3play-text-muted" />
          <p className="text-xl font-medium mb-2">No subscriptions yet</p>
          <p className="text-3play-text-secondary mb-6">Subscribe to channels to see their latest videos here</p>
        </div>
      )}
    </div>
  )
}

export default Subscriptions
