import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  Download,
  MoreHorizontal,
  Bell,
  CheckCircle2,
  Flag,
  Save,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  SkipBack,
  SkipForward
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const VideoPlayer = ({ video }) => {
  const apiBaseUrl = api?.defaults?.baseURL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [userReaction, setUserReaction] = useState(null)
  const [likes, setLikes] = useState(video.likes?.length || 0)
  const [dislikes, setDislikes] = useState(video.dislikes?.length || 0)
  const [views, setViews] = useState(video.views || 0)

  const videoRef = useRef(null)
  const playerRef = useRef(null)
  const controlsTimeoutRef = useRef(null)
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    // Increment views when video starts playing
    const incrementViews = async () => {
      try {
        await api.post(`/videos/${video._id}/view`)
        setViews(prev => prev + 1)
      } catch (error) {
        console.error('Failed to increment views:', error)
      }
    }

    if (isPlaying) {
      incrementViews()
    }
  }, [isPlaying, video._id])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value)
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value)
    if (videoRef.current) {
      videoRef.current.volume = vol
      setVolume(vol)
      setIsMuted(vol === 0)
    }
  }

  const toggleFullscreen = () => {
    if (playerRef.current) {
      if (!isFullscreen) {
        playerRef.current.requestFullscreen()
      } else {
        document.exitFullscreen()
      }
    }
  }

  const formatTime = (time) => {
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to like videos')
      return
    }

    try {
      await api.post(`/videos/${video._id}/like`)
      if (userReaction === 'like') {
        setUserReaction(null)
        setLikes(prev => prev - 1)
      } else {
        setUserReaction('like')
        setLikes(prev => prev + 1)
        if (userReaction === 'dislike') {
          setDislikes(prev => prev - 1)
        }
      }
    } catch (error) {
      toast.error('Failed to like video')
    }
  }

  const handleDislike = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to dislike videos')
      return
    }

    try {
      await api.post(`/videos/${video._id}/dislike`)
      if (userReaction === 'dislike') {
        setUserReaction(null)
        setDislikes(prev => prev - 1)
      } else {
        setUserReaction('dislike')
        setDislikes(prev => prev + 1)
        if (userReaction === 'like') {
          setLikes(prev => prev - 1)
        }
      }
    } catch (error) {
      toast.error('Failed to dislike video')
    }
  }

  const handleDownload = async () => {
    try {
      const response = await api.get(`/videos/${video._id}/download`, {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${video.title}.${video.format || 'mp4'}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success('Download started!')
    } catch (error) {
      toast.error('Failed to download video')
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: video.title,
      text: `Check out this video on 3Play: ${video.title}`,
      url: window.location.href
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.log('Share cancelled')
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to subscribe')
      return
    }

    try {
      await api.post(`/users/${video.owner?._id}/subscribe`)
      setIsSubscribed(!isSubscribed)
      toast.success(isSubscribed ? 'Unsubscribed' : 'Subscribed!')
    } catch (error) {
      toast.error('Failed to subscribe')
    }
  }

  const showControlsTemporarily = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }

  return (
    <div className="space-y-4">
      {/* Video Player */}
      <div
        ref={playerRef}
        className="relative aspect-video bg-black rounded-xl overflow-hidden group"
        onMouseMove={showControlsTemporarily}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        <video
          ref={videoRef}
          src={`${apiBaseUrl}/videos/${video._id}/stream`}
          className="w-full h-full"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          onClick={togglePlay}
        />

        {/* Play/Pause Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
            onClick={togglePlay}
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-3play-accent/90 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
            >
              <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white ml-1" />
            </div>
          </div>
        )}

        {/* Controls */}
        <div
          className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
            showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Progress bar */}
          <div className="mb-4"
          >
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #e94560 ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) ${(currentTime / duration) * 100}%)`
              }}
            />
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-between"
          >
            <div className="flex items-center gap-4"
            >
              <button onClick={togglePlay} className="hover:text-3play-accent transition-colors"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>

              <button className="hover:text-3play-accent transition-colors"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button className="hover:text-3play-accent transition-colors"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2"
              >
                <button onClick={toggleMute} className="hover:text-3play-accent transition-colors"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-white/30 rounded-full"
                />
              </div>

              <span className="text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-4"
            >
              <button className="hover:text-3play-accent transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>

              <button onClick={toggleFullscreen} className="hover:text-3play-accent transition-colors"
              >
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Info */}
      <div className="space-y-4"
      >
        <h1 className="text-xl sm:text-2xl font-bold">{video.title}</h1>

        <div className="flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex items-center gap-2 text-3play-text-secondary"
          >
            <span>{views.toLocaleString()} views</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}</span>
          </div>

          <div className="flex items-center gap-2"
          >
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                userReaction === 'like'
                  ? 'bg-3play-accent text-white'
                  : 'bg-3play-card hover:bg-3play-border'
              }`}
            >
              <ThumbsUp className="w-5 h-5" />
              <span className="font-medium">{likes.toLocaleString()}</span>
            </button>

            <button
              onClick={handleDislike}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                userReaction === 'dislike'
                  ? 'bg-3play-accent text-white'
                  : 'bg-3play-card hover:bg-3play-border'
              }`}
            >
              <ThumbsDown className="w-5 h-5" />
              <span className="font-medium">{dislikes.toLocaleString()}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-3play-card hover:bg-3play-border transition-colors"
            >
              <Share2 className="w-5 h-5" />
              <span className="font-medium hidden sm:inline">Share</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-3play-card hover:bg-3play-border transition-colors"
            >
              <Download className="w-5 h-5" />
              <span className="font-medium hidden sm:inline">Download</span>
            </button>

            <button className="p-2 rounded-full bg-3play-card hover:bg-3play-border transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        <hr className="border-3play-border" />

        {/* Channel Info */}
        <div className="flex items-start justify-between gap-4"
        >
          <div className="flex items-center gap-3"
          >
            <Link to={`/profile/${video.owner?._id}`}
            >
              <div className="w-12 h-12 rounded-full bg-3play-accent flex items-center justify-center text-lg font-semibold hover:ring-2 ring-3play-accent/50 transition-all"
              >
                {video.owner?.avatar ? (
                  <img
                    src={video.owner.avatar}
                    alt={video.owner.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  video.owner?.name?.[0]?.toUpperCase() || 'U'
                )}
              </div>
            </Link>

            <div>
              <Link
                to={`/profile/${video.owner?._id}`}
                className="font-semibold hover:text-3play-accent transition-colors"
              >
                {video.owner?.name || 'Unknown Channel'}
              </Link>
              <p className="text-sm text-3play-text-secondary">
                {video.owner?.subscribers?.toLocaleString() || 0} subscribers
              </p>
            </div>
          </div>

          <button
            onClick={handleSubscribe}
            className={`px-6 py-2 rounded-full font-semibold transition-colors ${
              isSubscribed
                ? 'bg-3play-card hover:bg-3play-border text-white'
                : 'bg-3play-accent hover:bg-3play-accent-hover text-white'
            }`}
          >
            {isSubscribed ? 'Subscribed' : 'Subscribe'}
          </button>
        </div>

        {/* Description */}
        {video.description && (
          <div className="bg-3play-card rounded-xl p-4"
          >
            <p className="text-sm whitespace-pre-wrap">{video.description}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default VideoPlayer
