import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import CodeEditor from './CodeEditor'
import CodeExecutor from './CodeExecutor'
import { useWebSocket } from '../hooks/useWebSocket'
import { API_URL } from '../config'
import './Session.css'

function Session() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [code, setCode] = useState('# Write your code here\n')
  const [language, setLanguage] = useState('python')
  const [output, setOutput] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)
  const [sessionNotFound, setSessionNotFound] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)

  const { isConnected, participants, send, on, off } = useWebSocket(sessionId)

  // Fetch session data on mount
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch(`${API_URL}/sessions/${sessionId}`)
        if (!response.ok) {
          setSessionNotFound(true)
          return
        }
        const data = await response.json()
        setCode(data.code)
        setLanguage(data.language)
      } catch (error) {
        console.error('Error fetching session:', error)
        setSessionNotFound(true)
      }
    }

    fetchSession()
  }, [sessionId])

  // Handle incoming WebSocket messages
  useEffect(() => {
    const handleInit = (data) => {
      setCode(data.code)
      setLanguage(data.language)
    }

    const handleCodeChange = (data) => {
      setCode(data.code)
    }

    const handleLanguageChange = (data) => {
      setLanguage(data.language)
    }

    on('init', handleInit)
    on('code_change', handleCodeChange)
    on('language_change', handleLanguageChange)

    return () => {
      off('init', handleInit)
      off('code_change', handleCodeChange)
      off('language_change', handleLanguageChange)
    }
  }, [on, off])

  const handleCodeChange = useCallback((newCode) => {
    setCode(newCode)
    send({
      type: 'code_change',
      code: newCode
    })
  }, [send])

  const handleLanguageChange = useCallback((newLanguage) => {
    setLanguage(newLanguage)
    send({
      type: 'language_change',
      language: newLanguage
    })
  }, [send])

  const handleExecute = useCallback((executionOutput) => {
    setOutput(executionOutput)
    setIsExecuting(false)
  }, [])

  const copyShareLink = () => {
    const shareUrl = window.location.href
    navigator.clipboard.writeText(shareUrl)
    setShareDialogOpen(true)
    setTimeout(() => setShareDialogOpen(false), 2000)
  }

  if (sessionNotFound) {
    return (
      <div className="session-error">
        <h2>Session Not Found</h2>
        <p>The session you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/')}>Go Home</button>
      </div>
    )
  }

  return (
    <div className="session">
      <div className="session-header">
        <div className="session-info">
          <h1>Collaborative Coding Session</h1>
          <div className="session-meta">
            <span className="session-id">Session ID: {sessionId}</span>
            <span className={`status ${isConnected ? 'connected' : 'disconnected'}`}>
              {isConnected ? '● Connected' : '○ Disconnected'}
            </span>
            <span className="participants">
              {participants} participant{participants !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <div className="session-actions">
          <button onClick={copyShareLink} className="share-btn">
            Share Session
          </button>
          <button onClick={() => navigate('/')} className="home-btn">
            Leave
          </button>
        </div>
      </div>

      {shareDialogOpen && (
        <div className="share-notification">
          Link copied to clipboard!
        </div>
      )}

      <div className="session-content">
        <div className="editor-panel">
          <CodeEditor
            code={code}
            language={language}
            onChange={handleCodeChange}
            onLanguageChange={handleLanguageChange}
          />
        </div>
        <div className="output-panel">
          <CodeExecutor
            code={code}
            language={language}
            onExecute={handleExecute}
            output={output}
            isExecuting={isExecuting}
            setIsExecuting={setIsExecuting}
          />
        </div>
      </div>
    </div>
  )
}

export default Session
