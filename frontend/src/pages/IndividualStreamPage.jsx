import React, { useState, useContext, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { DataContext, UserContext } from '../App'
import ChatInput from '../components/ChatInput'
import ChatMessage from '../components/ChatMessage'
import { getStreamById } from '../data/mockData'
import { getJoinedStreams, addJoinedStream, removeJoinedStream, getStreamMessages, addStreamMessage } from '../utils/streamStorage'

const IndividualStreamPage = () => {
  const { streamId } = useParams()
  const { currentUser } = useContext(UserContext)
  const { streams, setAppData } = useContext(DataContext)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stream, setStream] = useState(null)
  const messagesEndRef = useRef(null)

  const streamsByInterest = {
    Gaming: [
      { id: 'gaming-hub', name: 'Gaming Hub', description: 'Discuss your favorite games and gaming news', warden: 'GameMaster', memberCount: 1247, icon: '🎮', emoji: '🎮', color: '#9B59B6', isJoined: false, recentActivity: '2 hours ago' },
      { id: 'esports-arena', name: 'Esports Arena', description: 'Competitive gaming discussions and tournaments', warden: 'ProGamer', memberCount: 823, icon: '🏆', emoji: '🏆', color: '#F39C12', isJoined: false, recentActivity: '1 hour ago' },
      { id: 'indie-games', name: 'Indie Games', description: 'Discover and discuss independent games', warden: 'IndieLover', memberCount: 456, icon: '🕹️', emoji: '🕹️', color: '#E74C3C', isJoined: false, recentActivity: '3 hours ago' }
    ],
    Movies: [
      { id: 'film-critics', name: 'Film Critics', description: 'In-depth movie reviews and discussions', warden: 'CinemaExpert', memberCount: 967, icon: '🎬', emoji: '🎬', color: '#2C3E50', isJoined: false, recentActivity: '30 minutes ago' },
      { id: 'movie-night', name: 'Movie Night', description: 'Weekly movie recommendations and watch parties', warden: 'FilmBuff', memberCount: 734, icon: '🍿', emoji: '🍿', color: '#E67E22', isJoined: false, recentActivity: '1 hour ago' },
      { id: 'cinema-club', name: 'Cinema Club', description: 'Classic and contemporary film analysis', warden: 'MovieMaven', memberCount: 589, icon: '🎭', emoji: '🎭', color: '#9B59B6', isJoined: false, recentActivity: '2 hours ago' }
    ],
    Sports: [
      { id: 'sports-talk', name: 'Sports Talk', description: 'General sports news and discussions', warden: 'SportsFan', memberCount: 1356, icon: '⚽', emoji: '⚽', color: '#27AE60', isJoined: false, recentActivity: '45 minutes ago' },
      { id: 'fitness-journey', name: 'Fitness Journey', description: 'Workout tips and fitness motivation', warden: 'FitCoach', memberCount: 892, icon: '💪', emoji: '💪', color: '#E74C3C', isJoined: false, recentActivity: '1 hour ago' },
      { id: 'team-spirit', name: 'Team Spirit', description: 'Support your favorite teams together', warden: 'TeamCaptain', memberCount: 678, icon: '🏟️', emoji: '🏟️', color: '#3498DB', isJoined: false, recentActivity: '30 minutes ago' }
    ],
    Cooking: [
      { id: 'recipe-exchange', name: 'Recipe Exchange', description: 'Share and discover amazing recipes', warden: 'ChefMaster', memberCount: 1123, icon: '👨‍🍳', emoji: '👨‍🍳', color: '#F39C12', isJoined: false, recentActivity: '20 minutes ago' },
      { id: 'cooking-tips', name: 'Cooking Tips', description: 'Professional cooking techniques and tips', warden: 'CulinaryPro', memberCount: 756, icon: '🔪', emoji: '🔪', color: '#95A5A6', isJoined: false, recentActivity: '1 hour ago' },
      { id: 'food-culture', name: 'Food Culture', description: 'Explore cuisines from around the world', warden: 'FoodExplorer', memberCount: 634, icon: '🌍', emoji: '🌍', color: '#27AE60', isJoined: false, recentActivity: '2 hours ago' }
    ]
  }

  // Get all streams from both mock data and personalized streams
  const getAllStreams = () => {
    const mockStreams = getStreamById ? [getStreamById(streamId)] : []
    const personalizedStreams = Object.values(streamsByInterest).flat()
    return [...personalizedStreams, ...mockStreams].filter(Boolean)
  }

  // Find stream from all available sources
  const findStreamById = (id) => {
    // First try mock data
    const mockStream = getStreamById(id)
    if (mockStream) return mockStream
    
    // Then try personalized streams
    const allPersonalizedStreams = Object.values(streamsByInterest).flat()
    return allPersonalizedStreams.find(s => s.id === id)
  }

  useEffect(() => {
    const fetchStream = async () => {
      try {
        setLoading(true)
        setError('')
        
        const foundStream = findStreamById(streamId)
        if (foundStream) {
          // Load saved join state
          const isJoined = getJoinedStreams().includes(streamId)
          
          setStream({
            ...foundStream,
            isJoined
          })
          
          // Load saved messages for this stream
          const savedMessages = getStreamMessages(streamId)
          setMessages(savedMessages)
        } else {
          setError('Stream not found')
        }
      } catch (err) {
        setError('Failed to load stream')
        console.error('Stream loading error:', err)
      } finally {
        setLoading(false)
      }
    }

    if (streamId) {
      fetchStream()
    }
  }, [streamId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleJoinStream = () => {
    // Update the local stream state
    setStream(prevStream => {
      const updatedStream = {
        ...prevStream,
        isJoined: true,
        memberCount: prevStream.memberCount + 1
      }
      
      // Save joined stream
      addJoinedStream(streamId)
      
      return updatedStream
    })
    
    // Also update the global app data for mock streams
    setAppData(prev => ({
      ...prev,
      streams: prev.streams.map(s =>
        s.id === streamId
          ? { ...s, isJoined: true, memberCount: s.memberCount + 1 }
          : s
      )
    }))
  }

  const handleLeaveStream = () => {
    // Update the local stream state
    setStream(prevStream => {
      const updatedStream = {
        ...prevStream,
        isJoined: false,
        memberCount: Math.max(1, prevStream.memberCount - 1)
      }
      
      // Remove joined stream
      removeJoinedStream(streamId)
      
      return updatedStream
    })
    
    // Also update the global app data for mock streams
    setAppData(prev => ({
      ...prev,
      streams: prev.streams.map(s =>
        s.id === streamId
          ? { ...s, isJoined: false, memberCount: Math.max(1, s.memberCount - 1) }
          : s
      )
    }))
  }

  const handleSendMessage = (messageText) => {
    if (!stream?.isJoined) return

    const newMessage = {
      id: Date.now().toString(),
      message: messageText,
      author: currentUser.name,
      authorId: currentUser.id,
      avatar: currentUser.bloom || '🌸',
      timestamp: new Date().toISOString(),
      isOwn: true
    }
    
    setMessages(prev => {
      const updatedMessages = [...prev, newMessage]
      // Save message using utility function
      addStreamMessage(streamId, newMessage)
      return updatedMessages
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center text-4xl mb-6 animate-pulse">
            🌊
          </div>
          <h2 className="font-display text-2xl font-semibold text-text-primary mb-2">
            Loading Stream...
          </h2>
          <p className="text-text-secondary">
            Preparing your stream experience
          </p>
        </div>
      </div>
    )
  }

  if (error || !stream) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center text-4xl mb-6">
            ❓
          </div>
          <h2 className="font-display text-2xl font-semibold text-text-primary mb-2">
            Stream Not Found
          </h2>
          <p className="text-text-secondary mb-6">
            {error || 'The stream you\'re looking for doesn\'t exist or may have been removed.'}
          </p>
          <Link to="/streams" className="btn-primary">
            Browse All Streams
          </Link>
        </div>
      </div>
    )
  }

  const currentStream = stream

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex-shrink-0 bg-surface border-b border-muted px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/streams"
              className="p-2 hover:bg-muted rounded-lg transition-colors duration-200"
            >
              <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-gentle"
              style={{ backgroundColor: `${currentStream.color}20` }}
            >
              {currentStream.emoji}
            </div>
            
            <div>
              <h1 className="font-display text-xl font-semibold text-text-primary">
                {currentStream.name}
              </h1>
              <p className="text-text-secondary text-sm">
                {currentStream.memberCount.toLocaleString()} members • Active {currentStream.recentActivity}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {currentStream.isJoined ? (
              <>
                <div className="flex items-center space-x-2 text-primary text-sm">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse-gentle"></div>
                  <span>Joined</span>
                </div>
                <button
                  onClick={handleLeaveStream}
                  className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent/90 transition-all duration-200"
                >
                  Leave Stream
                </button>
              </>
            ) : (
              <button
                onClick={handleJoinStream}
                className="btn-primary"
              >
                Join Stream
              </button>
            )}
          </div>
        </div>

        {/* Stream Description */}
        <div className="mt-4 pt-4 border-t border-muted">
          <p className="text-text-secondary text-sm leading-relaxed">
            {currentStream.description}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {!currentStream.isJoined ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div 
                className="w-24 h-24 mx-auto rounded-full flex items-center justify-center text-4xl mb-6 shadow-gentle"
                style={{ backgroundColor: `${currentStream.color}20` }}
              >
                {currentStream.emoji}
              </div>
              <h3 className="font-display text-xl font-semibold text-text-primary mb-2">
                Join {currentStream.name}
              </h3>
              <p className="text-text-secondary leading-relaxed mb-6">
                Join this stream to participate in conversations and connect with {currentStream.memberCount.toLocaleString()} like-minded individuals.
              </p>
              <button
                onClick={handleJoinStream}
                className="btn-primary"
              >
                Join Stream
              </button>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div 
                className="w-24 h-24 mx-auto rounded-full flex items-center justify-center text-4xl mb-6 shadow-gentle"
                style={{ backgroundColor: `${currentStream.color}20` }}
              >
                💬
              </div>
              <h3 className="font-display text-xl font-semibold text-text-primary mb-2">
                Start the Conversation
              </h3>
              <p className="text-text-secondary max-w-md mx-auto leading-relaxed">
                Be the first to share your thoughts in {currentStream.name}. 
                Your message could spark meaningful discussions.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
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
          </div>
        )}
      </div>

      {/* Chat Input */}
      {currentStream.isJoined && (
        <div className="flex-shrink-0 bg-surface border-t border-muted px-6 py-4">
          <ChatInput
            onSendMessage={handleSendMessage}
            placeholder={`Share your thoughts with ${currentStream.name}...`}
          />
        </div>
      )}
    </div>
  )
}

export default IndividualStreamPage