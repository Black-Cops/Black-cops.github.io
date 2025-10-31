import { useState, useEffect } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../convex/_generated/api'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'
import RightPanel from './components/RightPanel'
import SearchPanel from './components/SearchPanel'
import { AlertCircle, Search } from 'lucide-react'

function App() {
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState(null)
  const [selectedModel, setSelectedModel] = useState('anthropic/claude-3.5-sonnet')
  const [selectedPersona, setSelectedPersona] = useState('helpful')
  const [isOnline, setIsOnline] = useState(true)
  const [availableModels, setAvailableModels] = useState([])
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false)

  const workspaces = useQuery(api.workspaces.list)
  const currentWorkspace = useQuery(
    api.workspaces.get,
    currentWorkspaceId ? { workspaceId: currentWorkspaceId } : 'skip'
  )
  const messages = useQuery(
    api.messages.list,
    currentWorkspaceId ? { workspaceId: currentWorkspaceId } : 'skip'
  )

  const createWorkspace = useMutation(api.workspaces.create)
  const addMessage = useMutation(api.messages.add)

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:8000'
    
    fetch(`${apiBase}/health`)
      .then(res => res.json())
      .then(() => setIsOnline(true))
      .catch(() => setIsOnline(false))

    fetch(`${apiBase}/api/models`)
      .then(res => res.json())
      .then(data => {
        setAvailableModels(data.models || [])
        if (data.defaultModel) {
          setSelectedModel(data.defaultModel.id)
        }
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (workspaces && workspaces.length > 0 && !currentWorkspaceId) {
      setCurrentWorkspaceId(workspaces[0]._id)
    }
  }, [workspaces, currentWorkspaceId])

  const handleCreateWorkspace = async () => {
    const newWorkspace = await createWorkspace({
      title: 'New Workspace',
      model: selectedModel
    })
    setCurrentWorkspaceId(newWorkspace)
  }

  const handleSendSearchToChat = async (message) => {
    if (!currentWorkspaceId) return
    
    await addMessage({
      workspaceId: currentWorkspaceId,
      role: 'user',
      content: message
    })
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {!isOnline && (
        <div className="absolute top-4 right-4 z-50 bg-red-500/90 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <span>Backend offline</span>
        </div>
      )}

      <Sidebar
        workspaces={workspaces || []}
        currentWorkspaceId={currentWorkspaceId}
        onSelectWorkspace={setCurrentWorkspaceId}
        onCreateWorkspace={handleCreateWorkspace}
      />

      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1 flex flex-col">
          {/* Search button for mobile */}
          <div className="lg:hidden flex p-4 border-b border-gray-700">
            <button
              onClick={() => setIsSearchPanelOpen(true)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Search size={20} />
              Search
            </button>
          </div>

          <ChatArea
            workspaceId={currentWorkspaceId}
            workspace={currentWorkspace}
            messages={messages || []}
            model={selectedModel}
            persona={selectedPersona}
            onToggleSearch={() => setIsSearchPanelOpen(!isSearchPanelOpen)}
          />
        </div>

        {/* Search panel for desktop - overlay */}
        {isSearchPanelOpen && (
          <div className="hidden lg:block lg:w-96">
            <SearchPanel
              isOpen={isSearchPanelOpen}
              onClose={() => setIsSearchPanelOpen(false)}
              onSendToChat={handleSendSearchToChat}
              workspaceId={currentWorkspaceId}
            />
          </div>
        )}
      </div>

      <RightPanel
        models={availableModels}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
        selectedPersona={selectedPersona}
        onSelectPersona={setSelectedPersona}
        onToggleSearch={() => setIsSearchPanelOpen(!isSearchPanelOpen)}
        isSearchPanelOpen={isSearchPanelOpen}
      />

      {/* Mobile search panel overlay */}
      <div className="lg:hidden">
        <SearchPanel
          isOpen={isSearchPanelOpen}
          onClose={() => setIsSearchPanelOpen(false)}
          onSendToChat={handleSendSearchToChat}
          workspaceId={currentWorkspaceId}
        />
      </div>
    </div>
  )
}

export default App
