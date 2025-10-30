import { useState, useEffect } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../convex/_generated/api'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'
import RightPanel from './components/RightPanel'
import { AlertCircle } from 'lucide-react'

function App() {
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState(null)
  const [selectedModel, setSelectedModel] = useState('anthropic/claude-3.5-sonnet')
  const [selectedPersona, setSelectedPersona] = useState('helpful')
  const [isOnline, setIsOnline] = useState(true)
  const [availableModels, setAvailableModels] = useState([])

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

      <ChatArea
        workspaceId={currentWorkspaceId}
        workspace={currentWorkspace}
        messages={messages || []}
        model={selectedModel}
        persona={selectedPersona}
      />

      <RightPanel
        models={availableModels}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
        selectedPersona={selectedPersona}
        onSelectPersona={setSelectedPersona}
      />
    </div>
  )
}

export default App
