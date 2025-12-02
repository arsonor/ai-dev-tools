import { useEffect, useRef, useState } from 'react'
import { WS_URL } from '../config'

export function useWebSocket(sessionId) {
  const [isConnected, setIsConnected] = useState(false)
  const [participants, setParticipants] = useState(0)
  const wsRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  const messageHandlersRef = useRef({})

  useEffect(() => {
    if (!sessionId) return

    const connect = () => {
      const ws = new WebSocket(`${WS_URL}/ws/${sessionId}`)

      ws.onopen = () => {
        console.log('WebSocket connected')
        setIsConnected(true)
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('Received message:', data)

          // Call registered handlers for this message type
          if (messageHandlersRef.current[data.type]) {
            messageHandlersRef.current[data.type].forEach(handler => {
              handler(data)
            })
          }

          // Handle participant count updates
          if (data.type === 'participants') {
            setParticipants(data.count)
          }
        } catch (error) {
          console.error('Error parsing message:', error)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }

      ws.onclose = () => {
        console.log('WebSocket disconnected')
        setIsConnected(false)

        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect...')
          connect()
        }, 3000)
      }

      wsRef.current = ws
    }

    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [sessionId])

  const send = (data) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
    } else {
      console.warn('WebSocket is not connected')
    }
  }

  const on = (messageType, handler) => {
    if (!messageHandlersRef.current[messageType]) {
      messageHandlersRef.current[messageType] = []
    }
    messageHandlersRef.current[messageType].push(handler)
  }

  const off = (messageType, handler) => {
    if (messageHandlersRef.current[messageType]) {
      messageHandlersRef.current[messageType] =
        messageHandlersRef.current[messageType].filter(h => h !== handler)
    }
  }

  return { isConnected, participants, send, on, off }
}
