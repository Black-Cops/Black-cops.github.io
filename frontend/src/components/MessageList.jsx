import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { User, Bot, Copy, Download, Check } from 'lucide-react'
import { useState } from 'react'

function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const extensions = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      html: 'html',
      css: 'css',
      json: 'json'
    }
    const ext = extensions[language] || 'txt'
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `code.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="my-4 rounded-lg overflow-hidden bg-gray-800 border border-gray-700">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-750 border-b border-gray-700">
        <span className="text-sm text-gray-400">{language || 'text'}</span>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="text-gray-400 hover:text-white transition-colors p-1"
            title="Copy code"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
          <button
            onClick={handleDownload}
            className="text-gray-400 hover:text-white transition-colors p-1"
            title="Download code"
          >
            <Download size={16} />
          </button>
        </div>
      </div>
      <pre className="p-4 overflow-x-auto scrollbar-thin">
        <code className="text-sm">{code}</code>
      </pre>
    </div>
  )
}

function Message({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 mb-6 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
          <Bot size={18} />
        </div>
      )}
      <div className={`max-w-3xl ${isUser ? 'bg-blue-600' : 'bg-gray-800'} rounded-lg p-4`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '')
              const code = String(children).replace(/\n$/, '')
              
              if (!inline && match) {
                return <CodeBlock language={match[1]} code={code} />
              }
              
              return (
                <code className="bg-gray-900 px-1 py-0.5 rounded text-sm" {...props}>
                  {children}
                </code>
              )
            },
            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
            h1: ({ children }) => <h1 className="text-2xl font-bold mb-2">{children}</h1>,
            h2: ({ children }) => <h2 className="text-xl font-bold mb-2">{children}</h2>,
            h3: ({ children }) => <h3 className="text-lg font-bold mb-2">{children}</h3>,
            ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
            a: ({ href, children }) => (
              <a href={href} className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
          <User size={18} />
        </div>
      )}
    </div>
  )
}

export default function MessageList({ messages, streamingMessage }) {
  return (
    <div>
      {messages.map((message) => (
        <Message key={message._id} message={message} />
      ))}
      {streamingMessage && (
        <Message
          message={{
            _id: 'streaming',
            role: 'assistant',
            content: streamingMessage
          }}
        />
      )}
    </div>
  )
}
