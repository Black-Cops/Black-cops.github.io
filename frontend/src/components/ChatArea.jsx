import { useState, useRef, useEffect } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Send, Loader2, MessageSquare } from 'lucide-react'
import MessageList from './MessageList'

export default function ChatArea({ workspaceId, workspace, messages, model, persona }) {
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState('')
  const messagesEndRef = useRef(null)

  const addMessage = useMutation(api.messages.add)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingMessage])

  const handleSend = async () => {
    if (!input.trim() || !workspaceId || isStreaming) return

    const userMessage = input.trim()
    setInput('')

    await addMessage({
      workspaceId,
      role: 'user',
      content: userMessage
    })

    setIsStreaming(true)
    setStreamingMessage('')

    const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

    try {
      const response = await fetch(`${apiBase}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage }
          ],
          model,
          stream: true,
          persona
        })
      })

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulatedText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            try {
              const json = JSON.parse(data)
              if (json.text) {
                accumulatedText += json.text
                setStreamingMessage(accumulatedText)
              }
              if (json.done || json.error) {
                break
              }
            } catch (e) {
              console.error('Failed to parse SSE:', e)
            }
          }
        }
      }

      if (accumulatedText) {
        await addMessage({
          workspaceId,
          role: 'assistant',
          content: accumulatedText,
          model
        })
      }
    } catch (error) {
      console.error('Chat error:', error)
      await addMessage({
        workspaceId,
        role: 'assistant',
        content: `Error: ${error.message}`,
        model
      })
    } finally {
      setIsStreaming(false)
      setStreamingMessage('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!workspaceId) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
          <p>Select a workspace or create a new one</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      <div className="border-b border-gray-700 p-4">
        <h2 className="text-lg font-semibold">{workspace?.title || 'Workspace'}</h2>
        <p className="text-sm text-gray-400">Model: {model.split('/').pop()}</p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
        <MessageList messages={messages} streamingMessage={streamingMessage} />
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-700 p-4">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything... (Shift+Enter for new line)"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-600"
            rows="3"
            disabled={isStreaming}
          />
          <button
            onClick={handleSend}
            disabled={isStreaming || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            {isStreaming ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
      </div>
    </div>
  )
}
