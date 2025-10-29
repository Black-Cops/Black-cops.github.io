import { Plus, MessageSquare } from 'lucide-react'

export default function Sidebar({ workspaces, currentWorkspaceId, onSelectWorkspace, onCreateWorkspace }) {
  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <MessageSquare size={24} />
          Saki Browser
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
        <div className="space-y-1">
          {workspaces.map(workspace => (
            <button
              key={workspace._id}
              onClick={() => onSelectWorkspace(workspace._id)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                workspace._id === currentWorkspaceId
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-700 text-gray-300'
              }`}
            >
              <div className="font-medium truncate">{workspace.title}</div>
              <div className="text-xs text-gray-400 truncate">
                {new Date(workspace._creationTime).toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={onCreateWorkspace}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Plus size={20} />
          New Workspace
        </button>
      </div>
    </div>
  )
}
