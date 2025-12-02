import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../config'
import './Home.css'

function Home() {
  const [sessionId, setSessionId] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const createSession = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/sessions`, {
        method: 'POST',
      })
      const data = await response.json()
      navigate(`/session/${data.session_id}`)
    } catch (error) {
      console.error('Error creating session:', error)
      alert('Failed to create session. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const joinSession = async (e) => {
    e.preventDefault()
    if (!sessionId.trim()) {
      alert('Please enter a session ID')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/sessions/${sessionId}`)
      if (response.ok) {
        navigate(`/session/${sessionId}`)
      } else {
        alert('Session not found. Please check the ID and try again.')
      }
    } catch (error) {
      console.error('Error joining session:', error)
      alert('Failed to join session. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="home">
      <div className="home-container">
        <h1>Collaborative Coding Interview</h1>
        <p className="subtitle">Real-time code collaboration for technical interviews</p>

        <div className="action-section">
          <h2>Start a New Session</h2>
          <button onClick={createSession} disabled={loading}>
            {loading ? 'Creating...' : 'Create New Session'}
          </button>
        </div>

        <div className="divider">
          <span>OR</span>
        </div>

        <div className="action-section">
          <h2>Join Existing Session</h2>
          <form onSubmit={joinSession}>
            <input
              type="text"
              placeholder="Enter Session ID"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              disabled={loading}
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Joining...' : 'Join Session'}
            </button>
          </form>
        </div>

        <div className="features">
          <h3>Features</h3>
          <ul>
            <li>Real-time code synchronization</li>
            <li>Syntax highlighting for multiple languages</li>
            <li>In-browser code execution</li>
            <li>Shareable session links</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Home
