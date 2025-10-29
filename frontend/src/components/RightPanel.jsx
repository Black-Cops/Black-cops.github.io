import { Search } from 'lucide-react'

export default function RightPanel({ models, selectedModel, onSelectModel, selectedPersona, onSelectPersona, onToggleSearch, isSearchPanelOpen }) {
  const personas = [
    { id: 'concise', name: 'Concise', description: 'Brief, direct answers' },
    { id: 'helpful', name: 'Helpful', description: 'Clear, detailed responses' },
    { id: 'creative', name: 'Creative', description: 'Imaginative, engaging' }
  ]

  const currentModel = models.find(m => m.id === selectedModel)

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto scrollbar-thin">
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Search
          </h3>
          <button
            onClick={onToggleSearch}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
              isSearchPanelOpen
                ? 'bg-blue-600 text-white'
                : 'bg-gray-900 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Search size={20} />
            <div>
              <div className="font-medium">Search Panel</div>
              <div className="text-sm opacity-75">
                {isSearchPanelOpen ? 'Hide search panel' : 'Show search panel'}
              </div>
            </div>
          </button>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Model
          </h3>
          <select
            value={selectedModel}
            onChange={(e) => onSelectModel(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            {models.map(model => (
              <option key={model.id} value={model.id}>
                {model.name} {model.default ? '(Default)' : ''} {model.free ? '🆓' : ''}
              </option>
            ))}
          </select>
          {currentModel && (
            <div className="mt-3 p-3 bg-gray-900 rounded-lg text-sm">
              <div className="text-gray-400 mb-1">Provider</div>
              <div className="font-medium">{currentModel.provider}</div>
              {currentModel.description && (
                <>
                  <div className="text-gray-400 mb-1 mt-2">Description</div>
                  <div className="text-sm text-gray-300">{currentModel.description}</div>
                </>
              )}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Persona
          </h3>
          <div className="space-y-2">
            {personas.map(persona => (
              <button
                key={persona.id}
                onClick={() => onSelectPersona(persona.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  selectedPersona === persona.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-900 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <div className="font-medium">{persona.name}</div>
                <div className="text-sm opacity-75">{persona.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-700">
          <div className="text-xs text-gray-500 space-y-1">
            <div>🔒 End-to-end encrypted</div>
            <div>⚡ Real-time streaming</div>
            <div>🎨 Dark mode optimized</div>
          </div>
        </div>
      </div>
    </div>
  )
}
