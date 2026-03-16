import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload as UploadIcon, Video, Image, X, CheckCircle, AlertCircle, Mail } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'

const Upload = () => {
  const [videoFile, setVideoFile] = useState(null)
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    visibility: 'public',
    tags: ''
  })

  const navigate = useNavigate()
  const { user, resendVerification } = useAuthStore()
  const [isResending, setIsResending] = useState(false)

  // Check if user is verified
  if (!user?.isVerified) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-3play-card border border-3play-border rounded-2xl p-8 text-center">
          <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold mb-3">Email Verification Required</h1>
          <p className="text-3play-text-secondary mb-6 max-w-md mx-auto">
            Please verify your email address to upload videos. Check your inbox for the verification link or resend the email.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={async () => {
                setIsResending(true)
                const result = await resendVerification()
                setIsResending(false)
                if (result.success) {
                  toast.success('Verification email sent! Check your inbox.')
                } else {
                  toast.error(result.message || 'Failed to resend email')
                }
              }}
              disabled={isResending}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-3play-accent hover:bg-3play-accent-hover disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium transition-colors"
            >
              {isResending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Resend Verification Email
                </>
              )}
            </button>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-3play-card hover:bg-3play-card/80 border border-3play-border rounded-xl font-medium transition-colors"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const categories = [
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'education', label: 'Education' },
    { value: 'music', label: 'Music' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'sports', label: 'Sports' },
    { value: 'news', label: 'News' },
    { value: 'technology', label: 'Technology' },
    { value: 'other', label: 'Other' },
  ]

  const onVideoDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024 * 1024) {
        toast.error('File size must be less than 2GB')
        return
      }
      setVideoFile(file)
      // Auto-fill title from filename
      if (!formData.title) {
        const fileName = file.name.replace(/\.[^/.]+$/, '')
        setFormData(prev => ({ ...prev, title: fileName }))
      }
    }
  }, [formData.title])

  const onThumbnailDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      setThumbnailFile(file)
      setThumbnailPreview(URL.createObjectURL(file))
    }
  }, [])

  const { getRootProps: getVideoRootProps, getInputProps: getVideoInputProps, isDragActive: isVideoDragActive } = useDropzone({
    onDrop: onVideoDrop,
    accept: {
      'video/*': ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv']
    },
    maxFiles: 1
  })

  const { getRootProps: getThumbnailRootProps, getInputProps: getThumbnailInputProps, isDragActive: isThumbnailDragActive } = useDropzone({
    onDrop: onThumbnailDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp']
    },
    maxFiles: 1
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!videoFile) {
      toast.error('Please select a video file')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    const data = new FormData()
    data.append('video', videoFile)
    data.append('title', formData.title)
    data.append('description', formData.description)
    data.append('category', formData.category)
    data.append('visibility', formData.visibility)
    data.append('tags', formData.tags)

    if (thumbnailFile) {
      data.append('thumbnail', thumbnailFile)
    }

    try {
      const response = await api.post('/videos', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(progress)
        }
      })

      toast.success('Video uploaded successfully!')
      navigate(`/watch/${response.data.data.video._id}`)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload video')
    } finally {
      setIsUploading(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Upload Video</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Video Upload Area */}
        {!videoFile ? (
          <div
            {...getVideoRootProps()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
              isVideoDragActive
                ? 'border-3play-accent bg-3play-accent/5'
                : 'border-3play-border hover:border-3play-accent/50'
            }`}
          >
            <input {...getVideoInputProps()} />
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-3play-card rounded-full flex items-center justify-center">
                <UploadIcon className="w-8 h-8 text-3play-accent" />
              </div>
              <div>
                <p className="text-lg font-medium">Drag and drop your video here</p>
                <p className="text-3play-text-secondary">or click to browse files</p>
              </div>
              <p className="text-sm text-3play-text-muted">MP4, WebM, MOV up to 2GB</p>
            </div>
          </div>
        ) : (
          <div className="bg-3play-card rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-3play-accent/20 rounded-lg flex items-center justify-center">
                  <Video className="w-6 h-6 text-3play-accent" />
                </div>
                <div>
                  <p className="font-medium truncate max-w-xs sm:max-w-md">{videoFile.name}</p>
                  <p className="text-sm text-3play-text-secondary">{formatFileSize(videoFile.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setVideoFile(null)}
                className="p-2 hover:bg-3play-border rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Thumbnail Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">Thumbnail (optional)</label>
          {!thumbnailPreview ? (
            <div
              {...getThumbnailRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                isThumbnailDragActive
                  ? 'border-3play-accent bg-3play-accent/5'
                  : 'border-3play-border hover:border-3play-accent/50'
              }`}
            >
              <input {...getThumbnailInputProps()} />
              <div className="flex flex-col items-center gap-2">
                <Image className="w-8 h-8 text-3play-text-secondary" />
                <p className="text-sm text-3play-text-secondary">Upload thumbnail or drag and drop</p>
                <p className="text-xs text-3play-text-muted">JPG, PNG up to 10MB</p>
              </div>
            </div>
          ) : (
            <div className="relative w-40 aspect-video rounded-lg overflow-hidden">
              <img
                src={thumbnailPreview}
                alt="Thumbnail preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setThumbnailFile(null)
                  setThumbnailPreview(null)
                }}
                className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Video Details */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              maxLength={100}
              className="w-full px-4 py-3 bg-3play-card border border-3play-border rounded-xl focus:outline-none focus:border-3play-accent transition-colors"
              placeholder="Add a title that describes your video"
            />
            <p className="mt-1 text-xs text-3play-text-muted text-right">{formData.title.length}/100</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              maxLength={5000}
              className="w-full px-4 py-3 bg-3play-card border border-3play-border rounded-xl focus:outline-none focus:border-3play-accent transition-colors resize-none"
              placeholder="Tell viewers about your video"
            />
            <p className="mt-1 text-xs text-3play-text-muted text-right">{formData.description.length}/5000</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-3play-card border border-3play-border rounded-xl focus:outline-none focus:border-3play-accent transition-colors"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Visibility</label>
              <select
                value={formData.visibility}
                onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                className="w-full px-4 py-3 bg-3play-card border border-3play-border rounded-xl focus:outline-none focus:border-3play-accent transition-colors"
              >
                <option value="public">Public</option>
                <option value="unlisted">Unlisted</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-3 bg-3play-card border border-3play-border rounded-xl focus:outline-none focus:border-3play-accent transition-colors"
              placeholder="Add tags separated by commas (e.g. gaming, tutorial, fun)"
            />
            <p className="mt-1 text-xs text-3play-text-muted">Tags help viewers find your video. Max 10 tags, 30 characters each.</p>
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="bg-3play-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Uploading...{uploadProgress}%</span>
              <span className="text-3play-text-secondary">{uploadProgress === 100 ? 'Processing...' : ''}</span>
            </div>
            <div className="h-2 bg-3play-border rounded-full overflow-hidden">
              <div
                className="h-full bg-3play-accent transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={isUploading}
            className="px-6 py-3 rounded-xl font-medium hover:bg-3play-card transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!videoFile || !formData.title || isUploading}
            className="px-6 py-3 bg-3play-accent hover:bg-3play-accent-hover rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isUploading ? (
              <>Uploading...</>
            ) : (
              <>
                <UploadIcon className="w-5 h-5" />
                Upload Video
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Upload
