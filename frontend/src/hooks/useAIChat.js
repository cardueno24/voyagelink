import { useState, useCallback } from 'react'
import api from '../api/client'

function generateSessionId() {
  return 'session-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8)
}

export function useAIChat() {
  const [sessionId] = useState(() => generateSessionId())
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isLoading) return

    const userMsg = { role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])
    setIsLoading(true)
    setError(null)

    try {
      const data = await api.post('/ai/chat', { session_id: sessionId, message: text })
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
    } catch (err) {
      setError('Failed to get a response. Please check your API key configuration.')
    } finally {
      setIsLoading(false)
    }
  }, [sessionId, isLoading])

  const clearChat = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return { messages, isLoading, error, sendMessage, clearChat, sessionId }
}
