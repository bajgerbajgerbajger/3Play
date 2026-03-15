import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Settings, Edit, Grid, List } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import VideoCard from '../components/Video/VideoCard'
import api from '../api/axios'

const Profile = () => {
  const { id } = useParams()
  const { user: currentUser } = useAuthStore()
  const [viewMode, setViewMode] = useState('grid')
  const [isSubscribed, setIsSubscribed] = useState(false)

  const userId = id || currentUser?.id
  const isOwnProfile = userId === currentUser?.id

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const response = await api.get(`/users/${userId}`)
      return response.data.data
    },
    enabled: !!userId,
  })

  const handleSubscribe = async () => {
    try {
      await api.post(`/users/${userId}/subscribe`)
      setIsSubscribed(!isSubscribed)
    } catch (error) {
      console.error('Subscribe error:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="h-48 bg-3play-card rounded-xl skeleton" />
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-3play-card skeleton" />
          <div className="space-y-2">
            <div className="h-8 w-48 bg-3play-card rounded skeleton" />
            <div className="h-4 w-32 bg-3play-card rounded skeleton" />
          </div>
        </div>
      </div>
    )
  }

  const { user, videos } = profileData || {}

  return (
    <div className="max-w-6xl mx-auto">
      {/* Banner */}
      <div className="h-32 sm:h-48 bg-gradient-to-r from-3play-accent/20 to-purple-600/20 rounded-xl mb-8" />

      {/* Profile Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-3play-accent flex items-center justify-center text-3xl font-bold">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            user?.name?.[0]?.toUpperCase()
          )}
        </div>

        <div className="flex-1">
          <h1 className="text-2xl font-bold">{user?.name}</h1>
          <p className="text-3play-text-secondary">
            @{user?.name?.toLowerCase().replace(/\s/g, '')} • {user?.subscribers?.toLocaleString()} subscribers • {user?.totalVideos} videos
          </p>
        </div>

        <div className="flex gap-2">
          {isOwnProfile ? (
            <>
              <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-3play-card hover:bg-3play-border transition-colors">
                <Edit className="w-4 h-4" />
                <span>Customize channel</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-3play-card hover:bg-3play-border transition-colors">
                <Settings className="w-4 h-4" />
                <span>Manage videos</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleSubscribe}
              className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                isSubscribed
                  ? 'bg-3play-card hover:bg-3play-border'
                  : 'bg-3play-accent hover:bg-3play-accent-hover'
              }`}
            >
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-3play-border mb-6">
        <div className="flex gap-6">
          {['Home', 'Videos', 'Playlists', 'Community', 'Channels', 'About'].map((tab) => (
            <button
              key={tab}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                tab === 'Videos'
                  ? 'border-3play-accent text-white'
                  : 'border-transparent text-3play-text-secondary hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Videos Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Videos</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-3play-card' : 'hover:bg-3play-card'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-3play-card' : 'hover:bg-3play-card'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {videos?.length > 0 ? (
          <div className={`grid ${
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          } gap-4`}>
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} layout={viewMode} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-3play-card rounded-xl">
            <p className="text-3play-text-secondary">No videos yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
