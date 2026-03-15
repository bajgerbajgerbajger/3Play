import { useState, useEffect } from 'react'
import { Download, Trash2, Play, FolderOpen } from 'lucide-react'
import { Link } from 'react-router-dom'

const Downloads = () => {
  const [downloads, setDownloads] = useState([])

  useEffect(() => {
    // Load downloads from localStorage
    const saved = localStorage.getItem('3play_downloads')
    if (saved) {
      setDownloads(JSON.parse(saved))
    }
  }, [])

  const removeDownload = (id) => {
    const updated = downloads.filter(d => d.id !== id)
    setDownloads(updated)
    localStorage.setItem('3play_downloads', JSON.stringify(updated))
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-3play-accent/20 rounded-xl flex items-center justify-center">
            <Download className="w-6 h-6 text-3play-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Downloads</h1>
            <p className="text-3play-text-secondary">{downloads.length} videos</p>
          </div>
        </div>

        {downloads.length > 0 && (
          <button
            onClick={() => {
              setDownloads([])
              localStorage.removeItem('3play_downloads')
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            <span>Clear all</span>
          </button>
        )}
      </div>

      {downloads.length > 0 ? (
        <div className="space-y-3">
          {downloads.map((video) => (
            <div
              key={video.id}
              className="flex items-center gap-4 p-4 bg-3play-card rounded-xl hover:bg-3play-border transition-colors group"
            >
              <div className="relative w-40 aspect-video rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <Play className="w-8 h-8" />
                </div>
                {video.duration > 0 && (
                  <div className="absolute bottom-1 right-1 bg-black/80 px-1 rounded text-xs">
                    {formatDuration(video.duration)}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{video.title}</h3>
                <p className="text-sm text-3play-text-secondary">{video.channelName}</p>
                <p className="text-sm text-3play-text-muted">
                  {formatFileSize(video.fileSize)} • Downloaded {new Date(video.downloadedAt).toLocaleDateString()}
                </p>
              </div>

              <button
                onClick={() => removeDownload(video.id)}
                className="p-2 text-3play-text-secondary hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-3play-card rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-10 h-10 text-3play-text-muted" />
          </div>
          <p className="text-xl font-medium mb-2">No downloads yet</p>
          <p className="text-3play-text-secondary mb-6">Videos you download will appear here</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-3play-accent hover:bg-3play-accent-hover rounded-xl font-medium transition-colors"
          >
            Browse videos
          </Link>
        </div>
      )}
    </div>
  )
}

export default Downloads
