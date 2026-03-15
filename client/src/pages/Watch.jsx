import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import VideoPlayer from '../components/Video/VideoPlayer'
import VideoCard from '../components/Video/VideoCard'
import api from '../api/axios'

const Watch = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: videoData, isLoading, error } = useQuery({
    queryKey: ['video', id],
    queryFn: async () => {
      const response = await api.get(`/videos/${id}`)
      return response.data.data
    },
  })

  const { data: relatedVideos } = useQuery({
    queryKey: ['related-videos', id],
    queryFn: async () => {
      const response = await api.get('/videos', { params: { limit: 10 } })
      return response.data.data.videos.filter(v => v._id !== id)
    },
    enabled: !!id,
  })

  useEffect(() => {
    if (error) {
      navigate('/')
    }
  }, [error, navigate])

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="aspect-video bg-3play-card rounded-xl skeleton" />
            <div className="h-8 bg-3play-card rounded skeleton w-3/4" />
            <div className="flex justify-between">
              <div className="h-4 bg-3play-card rounded skeleton w-32" />
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-10 w-20 bg-3play-card rounded-full skeleton" />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <p className="font-semibold">Related Videos</p>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-40 aspect-video bg-3play-card rounded-lg skeleton flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-3play-card rounded skeleton" />
                  <div className="h-3 bg-3play-card rounded skeleton w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!videoData?.video) {
    return (
      <div className="text-center py-12">
        <p className="text-3play-text-secondary">Video not found.</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VideoPlayer video={videoData.video} />
        </div>

        <div className="space-y-4">
          <p className="font-semibold text-lg">Related Videos</p>
          <div className="space-y-3">
            {relatedVideos?.map((video) => (
              <VideoCard key={video._id} video={video} layout="list" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Watch
