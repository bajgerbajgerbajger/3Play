import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { Play, Clock } from 'lucide-react'

const VideoCard = ({ video, layout = 'grid' }) => {
  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`
    }
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`
    }
    return views.toString()
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (layout === 'list') {
    return (
      <Link
        to={`/watch/${video._id}`}
        className="flex gap-4 p-3 rounded-xl hover:bg-3play-card transition-colors group"
      >
        <div className="relative flex-shrink-0 w-40 sm:w-48 aspect-video rounded-lg overflow-hidden bg-3play-card"
        >
          <img
            src={video.thumbnailUrl || '/default-thumbnail.jpg'}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {video.duration > 0 && (
            <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-xs font-medium">
              {formatDuration(video.duration)}
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <Play className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base line-clamp-2 group-hover:text-3play-accent transition-colors">
            {video.title}
          </h3>
          <div className="mt-1 text-sm text-3play-text-secondary">
            <Link
              to={`/profile/${video.owner?._id}`}
              onClick={(e) => e.stopPropagation()}
              className="hover:text-white transition-colors"
            >
              {video.owner?.name || 'Unknown'}
            </Link>
          </div>
          <div className="mt-1 text-sm text-3play-text-muted flex items-center gap-2">
            <span>{formatViews(video.views || 0)} views</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}</span>
          </div>
          {video.description && (
            <p className="mt-2 text-sm text-3play-text-secondary line-clamp-2">{video.description}</p>
          )}
        </div>
      </Link>
    )
  }

  return (
    <Link
      to={`/watch/${video._id}`}
      className="block group card-hover"
    >
      <div className="relative aspect-video rounded-xl overflow-hidden bg-3play-card"
      >
        <img
          src={video.thumbnailUrl || '/default-thumbnail.jpg'}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {video.duration > 0 && (
          <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-xs font-medium">
            {formatDuration(video.duration)}
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      <div className="mt-3 flex gap-3"
      >
        <Link
          to={`/profile/${video.owner?._id}`}
          onClick={(e) => e.stopPropagation()}
          className="flex-shrink-0"
        >
          <div className="w-9 h-9 rounded-full bg-3play-accent flex items-center justify-center text-sm font-semibold hover:ring-2 ring-3play-accent/50 transition-all"
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

        <div className="flex-1 min-w-0"
        >
          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-3play-accent transition-colors"
          >
            {video.title}
          </h3>

          <div className="mt-1 text-sm text-3play-text-secondary"
          >
            <Link
              to={`/profile/${video.owner?._id}`}
              onClick={(e) => e.stopPropagation()}
              className="hover:text-white transition-colors"
            >
              {video.owner?.name || 'Unknown'}
            </Link>
          </div>

          <div className="text-sm text-3play-text-muted"
          >
            {formatViews(video.views || 0)} views • {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default VideoCard
