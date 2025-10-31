import { useState, useEffect, useRef } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Search, Send, Loader2, ExternalLink, MessageSquare, AlertCircle, RefreshCw } from 'lucide-react'

export default function SearchPanel({ 
  isOpen, 
  onClose, 
  onSendToChat, 
  workspaceId 
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [followUpPrompt, setFollowUpPrompt] = useState('')
  const searchInputRef = useRef(null)

  const searchAction = useMutation(api.search.search)

  const handleSearch = async () => {
    if (!query.trim() || isLoading) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const searchResults = await searchAction({ query: query.trim() })
      setResults(searchResults.results || [])
    } catch (err) {
      setError(err.message)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendToChat = (result) => {
    const message = `Found: ${result.title}\n\n${result.snippet}\n\nSource: ${result.url}`
    onSendToChat(message)
  }

  const handleSendFollowUpToChat = () => {
    if (!followUpPrompt.trim()) return
    onSendToChat(followUpPrompt.trim())
    setFollowUpPrompt('')
  }

  const handleRetry = () => {
    handleSearch()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSearch()
    }
  }

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      searchInputRef.current?.focus()
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 lg:relative lg:inset-auto lg:z-auto lg:bg-transparent">
      <div className="h-full flex flex-col bg-gray-900 lg:border-l lg:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Search size={20} />
            <h2 className="text-lg font-semibold">Search</h2>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            ×
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex gap-2">
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search the web..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
              disabled={isLoading}
            />
            <button
              onClick={handleSearch}
              disabled={isLoading || !query.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Search size={20} />
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 size={48} className="mx-auto mb-4 animate-spin text-blue-600" />
                <p className="text-gray-400">Searching...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4">
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle size={20} className="text-red-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-400 font-medium">Search failed</p>
                    <p className="text-red-300 text-sm mt-1">{error}</p>
                    <button
                      onClick={handleRetry}
                      className="mt-3 flex items-center gap-2 text-red-400 hover:text-red-300 text-sm transition-colors"
                    >
                      <RefreshCw size={16} />
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isLoading && !error && results.length === 0 && query && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Search size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-gray-400">No results found</p>
              </div>
            </div>
          )}

          {!isLoading && !error && results.length > 0 && (
            <div className="p-4 space-y-4">
              <p className="text-sm text-gray-400 mb-4">
                Found {results.length} result{results.length !== 1 ? 's' : ''}
              </p>
              {results.map((result, index) => (
                <div
                  key={index}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white mb-1 truncate">
                        {result.title}
                      </h3>
                      <p className="text-sm text-gray-400 mb-2 line-clamp-3">
                        {result.snippet}
                      </p>
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        <ExternalLink size={14} />
                        {(() => {
                          try {
                            return new URL(result.url).hostname;
                          } catch {
                            return result.url;
                          }
                        })()}
                      </a>
                    </div>
                    <button
                      onClick={() => handleSendToChat(result)}
                      className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm transition-colors flex items-center gap-1"
                    >
                      <Send size={14} />
                      Send
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && !error && !query && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Search size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-gray-400">Enter a search query to begin</p>
              </div>
            </div>
          )}
        </div>

        {/* Follow-up Prompt */}
        <div className="border-t border-gray-700 p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <MessageSquare size={16} />
              <span>Follow-up prompt</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={followUpPrompt}
                onChange={(e) => setFollowUpPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendFollowUpToChat()
                  }
                }}
                placeholder="Ask about the search results..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                onClick={handleSendFollowUpToChat}
                disabled={!followUpPrompt.trim() || !workspaceId}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg transition-colors flex items-center gap-1"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}