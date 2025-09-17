import React, { useState, useContext, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../App'
import ChatInput from '../components/ChatInput'
import ChatMessage from '../components/ChatMessage'

const WorldChatPage = () => {
  const { currentUser } = useContext(UserContext)
  const [messages, setMessages] = useState([])
  const [onlineUsers] = useState([])
  const [showStreamToast, setShowStreamToast] = useState(false)
  const [recommendedStreams, setRecommendedStreams] = useState([])
  const messagesEndRef = useRef(null)
  const navigate = useNavigate()

  const streamRecommendations = {
    Gaming: ['Gaming Hub', 'Esports Arena', 'Indie Games'],
    Movies: ['Film Critics', 'Movie Night', 'Cinema Club'],
    Sports: ['Sports Talk', 'Fitness Journey', 'Team Spirit'],
    Cooking: ['Recipe Exchange', 'Cooking Tips', 'Food Culture']
  }

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user.happyChoice && streamRecommendations[user.happyChoice]) {
      setRecommendedStreams(streamRecommendations[user.happyChoice])
      setTimeout(() => {
        setShowStreamToast(true)
        setTimeout(() => setShowStreamToast(false), 5000)
      }, 2000)
    }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (messageText) => {
    const newMessage = {
      id: Date.now().toString(),
      message: messageText,
      author: currentUser.name || currentUser.username,
      authorId: currentUser.id,
      avatar: currentUser.bloom || '🌸',
      timestamp: new Date().toISOString(),
      isOwn: true
    }
    
    setMessages(prev => [...prev, newMessage])
  }

  const handleStreamClick = (streamName) => {
    navigate(`/streams/${streamName.toLowerCase().replace(' ', '-')}`)
    setShowStreamToast(false)
  }

  return (
    <div className="h-screen flex flex-col bg-background relative">
      {showStreamToast && (
        <div className="absolute top-4 right-4 z-50 bg-white rounded-lg shadow-lg p-4 max-w-sm animate-slide-in-right border-l-4 border-orange-400">
          <div className="flex items-start space-x-3">
            <div className="text-orange-500 text-lg">🌊</div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 mb-1">Recommended Streams</h4>
              <p className="text-gray-600 text-sm mb-3">Based on your interests, you might enjoy:</p>
              <div className="space-y-1">
                {recommendedStreams.map((stream, index) => (
                  <button
                    key={index}
                    onClick={() => handleStreamClick(stream)}
                    className="block w-full text-left text-sm text-orange-600 hover:text-orange-700 hover:underline"
                  >
                    • {stream}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => setShowStreamToast(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="flex-shrink-0 bg-surface border-b border-muted px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-text-primary flex items-center">
              <span className="text-2xl mr-3">🌍</span>
              World Chat
            </h1>
            <p className="text-text-secondary text-sm mt-1">
              Connect with peaceful souls from around the globe
            </p>
          </div>
          
          <div className="text-right">
            <div className="flex items-center space-x-2 text-text-secondary text-sm">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse-gentle"></div>
              <span>Live conversation</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center text-4xl mb-6">
                💬
              </div>
              <h3 className="font-display text-xl font-semibold text-text-primary mb-2">
                Start the Conversation
              </h3>
              <p className="text-text-secondary max-w-md mx-auto leading-relaxed">
                Be the first to share a thought, ask a question, or spread some kindness. 
                Your message could brighten someone's day.
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message.message}
                author={message.author}
                authorId={message.authorId}
                avatar={message.avatar}
                timestamp={message.timestamp}
                isOwn={message.isOwn}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="flex-shrink-0 bg-surface border-t border-muted px-6 py-4">
        <ChatInput
          onSendMessage={handleSendMessage}
          placeholder="Share something peaceful with the world..."
        />
      </div>

      <div className="flex-shrink-0 bg-primary/5 border-t border-primary/20 px-6 py-3">
        <div className="flex items-center justify-center space-x-6 text-sm text-text-secondary">
          <span className="flex items-center space-x-2">
            <span>🕊️</span>
            <span>Be kind</span>
          </span>
          <span className="flex items-center space-x-2">
            <span>🌱</span>
            <span>Stay mindful</span>
          </span>
          <span className="flex items-center space-x-2">
            <span>💚</span>
            <span>Spread positivity</span>
          </span>
        </div>
      </div>
    </div>
  )
}

export default WorldChatPage