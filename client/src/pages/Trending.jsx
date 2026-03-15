import { useQuery } from '@tanstack/react-query'
import { TrendingUp, Flame, Music, Gamepad2, Newspaper } from 'lucide-react'
import VideoCard from '../components/Video/VideoCard'
import api from '../api/axios'

const Trending = () => {
  const { data: videos, isLoading } = useQuery({
    queryKey: ['trending'],
    queryFn: async () => {
      const response = await api.get('/videos/trending')
      return response.data.data.videos
    },
  })

  const categories = [
    { id: 'now', label: 'Now', icon: Flame },
    { id: 'music', label: 'Music', icon: Music },
    { id: 'gaming', label: 'Gaming', icon: Gamepad2 },
    { id: 'news', label: 'News', icon: Newspaper },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-3play-accent/20 rounded-xl flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-3play-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Trending</h1>
          <p className="text-3play-text-secondary">Popular videos right now</p>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-3play-card hover:bg-3play-border transition-colors whitespace-nowrap"
          >
            <cat.icon className="w-4 h-4" />
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Videos */}
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
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videos?.map((video, index) => (
            <div key={video._id} className="relative">
              <div className="absolute -top-2 -left-2 w-8 h-8 bg-3play-accent rounded-full flex items-center justify-center font-bold text-sm z-10">
                {index + 1}
              </div>
              <VideoCard video={video} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Trending
