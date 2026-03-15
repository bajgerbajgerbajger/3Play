import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search as SearchIcon, Filter, SlidersHorizontal } from 'lucide-react'
import VideoCard from '../components/Video/VideoCard'
import api from '../api/axios'

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [searchInput, setSearchInput] = useState(query)
  const [filters, setFilters] = useState({
    sort: 'relevance',
    duration: 'any',
    uploadDate: 'any'
  })
  const [showFilters, setShowFilters] = useState(false)

  const { data: videos, isLoading } = useQuery({
    queryKey: ['search', query, filters],
    queryFn: async () => {
      if (!query) return []
      const response = await api.get('/videos', {
        params: {
          search: query,
          sort: filters.sort === 'upload_date' ? 'newest' : filters.sort
        }
      })
      return response.data.data.videos
    },
    enabled: !!query,
  })

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() })
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Search Header */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search videos..."
              className="w-full px-4 py-3 pl-12 bg-3play-card border border-3play-border rounded-xl focus:outline-none focus:border-3play-accent transition-colors"
            />
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-3play-text-secondary" />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
              showFilters
                ? 'border-3play-accent bg-3play-accent/10'
                : 'border-3play-border hover:bg-3play-card'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>
      </form>

      {/* Filters */}
      {showFilters && (
        <div className="mb-6 p-4 bg-3play-card rounded-xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Sort by</label>
              <select
                value={filters.sort}
                onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                className="w-full px-3 py-2 bg-3play-dark border border-3play-border rounded-lg focus:outline-none focus:border-3play-accent"
              >
                <option value="relevance">Relevance</option>
                <option value="upload_date">Upload date</option>
                <option value="view_count">View count</option>
                <option value="rating">Rating</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Upload date</label>
              <select
                value={filters.uploadDate}
                onChange={(e) => setFilters({ ...filters, uploadDate: e.target.value })}
                className="w-full px-3 py-2 bg-3play-dark border border-3play-border rounded-lg focus:outline-none focus:border-3play-accent"
              >
                <option value="any">Any time</option>
                <option value="hour">Last hour</option>
                <option value="today">Today</option>
                <option value="week">This week</option>
                <option value="month">This month</option>
                <option value="year">This year</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Duration</label>
              <select
                value={filters.duration}
                onChange={(e) => setFilters({ ...filters, duration: e.target.value })}
                className="w-full px-3 py-2 bg-3play-dark border border-3play-border rounded-lg focus:outline-none focus:border-3play-accent"
              >
                <option value="any">Any duration</option>
                <option value="short">Under 4 minutes</option>
                <option value="medium">4-20 minutes</option>
                <option value="long">Over 20 minutes</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div>
        {query && (
          <p className="text-3play-text-secondary mb-4">
            Search results for "{query}"
          </p>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-40 sm:w-64 aspect-video bg-3play-card rounded-lg skeleton flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-3play-card rounded skeleton w-3/4" />
                  <div className="h-4 bg-3play-card rounded skeleton w-1/2" />
                  <div className="h-3 bg-3play-card rounded skeleton w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : videos?.length > 0 ? (
          <div className="space-y-3">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} layout="list" />
            ))}
          </div>
        ) : query ? (
          <div className="text-center py-12">
            <SearchIcon className="w-16 h-16 mx-auto mb-4 text-3play-text-muted" />
            <p className="text-xl font-medium mb-2">No results found</p>
            <p className="text-3play-text-secondary">Try different keywords or check your spelling</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <SearchIcon className="w-16 h-16 mx-auto mb-4 text-3play-text-muted" />
            <p className="text-3play-text-secondary">Enter a search term to find videos</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Search
