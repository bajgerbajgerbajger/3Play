import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import VideoCard from '../components/Video/VideoCard'
import api from '../api/axios'

const Home = () => {
  const [activeCategory, setActiveCategory] = useState('all')
  const { t } = useTranslation()

  const categories = [
    { id: 'all', label: t('home.categories.all') },
    { id: 'entertainment', label: t('home.categories.entertainment') },
    { id: 'music', label: t('home.categories.music') },
    { id: 'gaming', label: t('home.categories.gaming') },
    { id: 'education', label: t('home.categories.education') },
    { id: 'sports', label: t('home.categories.sports') },
    { id: 'technology', label: t('home.categories.technology') },
    { id: 'news', label: t('home.categories.news') },
  ]

  const { data: videos, isLoading, error } = useQuery({
    queryKey: ['videos', activeCategory],
    queryFn: async () => {
      const params = activeCategory !== 'all' ? { category: activeCategory } : {}
      const response = await api.get('/videos', { params })
      return response.data.data.videos
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Category skeleton */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-8 w-20 bg-3play-card rounded-full skeleton flex-shrink-0" />
          ))}
        </div>

        {/* Video grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
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
        <p className="text-3play-text-secondary">Failed to load videos. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 hide-scrollbar">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === category.id
                ? 'bg-3play-accent text-white'
                : 'bg-3play-card text-3play-text-secondary hover:bg-3play-border hover:text-white'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Video Grid */}
      {videos?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-3play-text-secondary">No videos found.</p>
        </div>
      )}
    </div>
  )
}

export default Home
