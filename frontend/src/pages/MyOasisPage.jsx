import React, { useContext, useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { UserContext, DataContext } from '../App'
import { getBlogsByAuthor } from '../data/mockData'
import BloomSelector from '../components/BloomSelector'
import ColorPaletteSelector from '../components/ColorPaletteSelector'
import GrottoModal from '../components/GrottoModal'

// Utility function to count words
const countWords = (text) => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

const MyOasisPage = () => {
  const { userId } = useParams()
  const { currentUser, login } = useContext(UserContext)
  const { blogs } = useContext(DataContext)
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingBio, setIsEditingBio] = useState(false)
  const [selectedBloom, setSelectedBloom] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [bioText, setBioText] = useState(currentUser?.bio || '')
  const [bioError, setBioError] = useState('')
  const [showGrotto, setShowGrotto] = useState(false)
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [friends, setFriends] = useState([])
  const [friendsLoading, setFriendsLoading] = useState(false)

  // Determine if viewing own profile or another user's profile
  const isOwnProfile = !userId || userId === currentUser?.id
  const profileUser = isOwnProfile ? currentUser : null

  // Load friends on component mount
  useEffect(() => {
    if (isOwnProfile && currentUser) {
      loadFriends()
    }
  }, [isOwnProfile, currentUser])

  const handleOpenGrotto = (friend) => {
    setSelectedFriend(friend)
    setShowGrotto(true)
  }

  const userBlogs = getBlogsByAuthor(profileUser?.id || '')

  const loadFriends = async () => {
    try {
      setFriendsLoading(true)
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000'
      const token = localStorage.getItem('authToken')
      
      console.log('Loading friends list...')
      
      const response = await fetch(`${API_URL}/api/friends`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Friends response:', data)
        
        if (data.success && data.data && data.data.friends) {
          // Transform friends data to include display properties
          const transformedFriends = data.data.friends.map(friend => ({
            id: friend.username || friend.id,
            name: friend.name || friend.username,
            avatar: friend.bloom || '🌸',
            isOnline: Math.random() > 0.5 // Random online status for demo
          }))
          setFriends(transformedFriends)
        } else {
          setFriends([])
        }
      } else {
        console.error('Failed to load friends:', response.status)
        setFriends([])
      }
    } catch (error) {
      console.error('Failed to load friends:', error)
      setFriends([])
    } finally {
      setFriendsLoading(false)
    }
  }

  const handleBioChange = (e) => {
    const text = e.target.value
    setBioText(text)
    
    const wordCount = countWords(text)
    if (wordCount > 50) {
      setBioError(`Bio must be 50 words or less (currently ${wordCount} words)`)
    } else {
      setBioError('')
    }
  }

  const handleSaveBio = async () => {
    const wordCount = countWords(bioText)
    if (wordCount > 50) {
      setBioError(`Bio must be 50 words or less (currently ${wordCount} words)`)
      return
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000'
      const token = localStorage.getItem('authToken')
      
      const response = await fetch(`${API_URL}/api/profile/${currentUser.username}/edit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bio: bioText })
      })

      if (response.ok) {
        const updatedUser = { ...currentUser, bio: bioText }
        login(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
        setIsEditingBio(false)
        setBioError('')
      }
    } catch (error) {
      console.error('Failed to update bio:', error)
      setBioError('Failed to save bio. Please try again.')
    }
  }

  const handleCancelBio = () => {
    setBioText(currentUser?.bio || '')
    setIsEditingBio(false)
    setBioError('')
  }

  const handleSaveCustomization = () => {
    if (selectedBloom || selectedColor) {
      const updatedUser = {
        ...currentUser,
        ...(selectedBloom && { bloom: selectedBloom.emoji, bloomStyle: selectedBloom.id }),
        ...(selectedColor && { colorPalette: selectedColor.id })
      }
      login(updatedUser)
    }
    setIsEditing(false)
    setSelectedBloom(null)
    setSelectedColor(null)
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center text-4xl mb-6">
            👤
          </div>
          <h2 className="font-display text-2xl font-semibold text-text-primary mb-2">
            Profile Not Found
          </h2>
          <p className="text-text-secondary mb-6">
            The profile you're looking for doesn't exist.
          </p>
          <Link to="/world-chat" className="btn-primary">
            Return to World Chat
          </Link>
        </div>
      </div>
    )
  }

  const joinDate = new Date(profileUser.joinDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="card mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-6 sm:space-y-0 sm:space-x-6">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-4xl shadow-peaceful">
                {profileUser.bloom || '🌸'}
              </div>
            </div>
            
            <div className="flex-1">
              <h1 className="font-display text-3xl font-bold text-text-primary mb-2">
                {profileUser.name || profileUser.username}
              </h1>
              
              {/* Bio Section */}
              <div className="mb-4">
                {isEditingBio ? (
                  <div>
                    <textarea
                      value={bioText}
                      onChange={handleBioChange}
                      placeholder="Tell us about yourself... (50 words max)"
                      className="w-full p-3 border border-gray-200 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all duration-200 resize-none"
                      rows={3}
                    />
                    {bioError && (
                      <p className="text-red-500 text-sm mt-1">{bioError}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-500">
                        {countWords(bioText)}/50 words
                      </span>
                      <div className="space-x-2">
                        <button
                          onClick={handleCancelBio}
                          className="text-gray-500 hover:text-gray-700 text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveBio}
                          disabled={!!bioError}
                          className="bg-orange-400 text-white px-4 py-1 rounded text-sm hover:bg-orange-500 disabled:opacity-50 transition-colors"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="group">
                    <p className="text-gray-600 mb-2">
                      {profileUser.bio || (isOwnProfile ? 'Click to add a bio...' : 'No bio yet')}
                    </p>
                    {isOwnProfile && (
                      <button
                        onClick={() => setIsEditingBio(true)}
                        className="text-orange-500 hover:text-orange-600 text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {profileUser.bio ? 'Edit bio' : 'Add bio'}
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              <p className="text-text-secondary mb-4">
                Member since {joinDate}
              </p>
              
              <div className="flex items-center space-x-6 text-sm text-text-secondary">
                <span className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>{friends.length} friends</span>
                </span>
                <span className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <span>{userBlogs.length} posts</span>
                </span>
              </div>
            </div>

            {isOwnProfile && (
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="btn-outline"
                >
                  {isEditing ? 'Cancel' : 'Customize Bloom'}
                </button>
                {isEditing && (
                  <button
                    onClick={handleSaveCustomization}
                    className="btn-primary"
                  >
                    Save Changes
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Customization Section (Only visible when editing) */}
        {isEditing && (
          <div className="space-y-8 mb-8">
            <div className="card">
              <BloomSelector
                selectedBloom={selectedBloom}
                onBloomSelect={setSelectedBloom}
              />
            </div>
            
            <div className="card">
              <ColorPaletteSelector
                selectedColor={selectedColor}
                onColorSelect={setSelectedColor}
              />
            </div>
          </div>
        )}

        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Posts */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-semibold text-text-primary">
                  Recent Posts
                </h2>
                {isOwnProfile && (
                  <Link to="/blogs" className="text-primary hover:text-secondary text-sm font-medium">
                    Write a post →
                  </Link>
                )}
              </div>

              {userBlogs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center text-2xl mb-4">
                    ✍️
                  </div>
                  <h3 className="font-medium text-text-primary mb-2">
                    {isOwnProfile ? 'No posts yet' : 'No posts to show'}
                  </h3>
                  <p className="text-text-secondary text-sm">
                    {isOwnProfile 
                      ? 'Share your first thoughts and experiences with the community.'
                      : 'This user hasn\'t shared any posts yet.'
                    }
                  </p>
                  {isOwnProfile && (
                    <Link to="/blogs" className="btn-primary mt-4">
                      Write Your First Post
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {userBlogs.slice(0, 3).map((blog) => (
                    <Link
                      key={blog.id}
                      to={`/blogs/${blog.id}`}
                      className="block p-4 border border-muted rounded-2xl hover:shadow-gentle transition-all duration-200 hover:border-primary/20"
                    >
                      <h3 className="font-medium text-text-primary mb-2 hover:text-primary transition-colors duration-200">
                        {blog.title}
                      </h3>
                      <p className="text-text-secondary text-sm mb-3 line-clamp-2">
                        {blog.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-text-secondary">
                        <span>{new Date(blog.publishDate).toLocaleDateString()}</span>
                        <span>{blog.likes} likes</span>
                      </div>
                    </Link>
                  ))}
                  
                  {userBlogs.length > 3 && (
                    <Link
                      to="/blogs"
                      className="block text-center text-primary hover:text-secondary font-medium text-sm py-2"
                    >
                      View all posts ({userBlogs.length})
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="card">
              <h3 className="font-display text-lg font-semibold text-text-primary mb-4">
                {isOwnProfile ? 'Your Journey' : 'Journey Stats'}
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary text-sm">Posts written</span>
                  <span className="font-medium text-text-primary">{userBlogs.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary text-sm">Friends connected</span>
                  <span className="font-medium text-text-primary">{friends.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary text-sm">Total likes received</span>
                  <span className="font-medium text-text-primary">
                    {userBlogs.reduce((sum, blog) => sum + blog.likes, 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Favorite Quote */}
            <div className="card">
              <h3 className="font-display text-lg font-semibold text-text-primary mb-4">
                Daily Inspiration
              </h3>
              <blockquote className="text-text-secondary italic text-sm leading-relaxed">
                "In the depths of silence, we find the songs of our soul."
                <cite className="block mt-2 text-xs text-text-secondary/70 not-italic">— Ocean Wisdom</cite>
              </blockquote>
            </div>

            {/* Quick Actions */}
            {isOwnProfile && (
              <div className="card">
                <h3 className="font-display text-lg font-semibold text-text-primary mb-4">
                  Quick Actions
                </h3>
                
                <div className="space-y-3">
                  <Link to="/blogs" className="block w-full btn-outline text-center">
                    Write a Post
                  </Link>
                  <Link to="/streams" className="block w-full btn-outline text-center">
                    Explore Streams
                  </Link>
                  <Link to="/onboarding/bloom" className="block w-full btn-outline text-center">
                    Customize Bloom
                  </Link>
                </div>
              </div>
            )}

            {/* Friends List */}
            <div className="card">
              <h3 className="font-display text-lg font-semibold text-text-primary mb-4">
                Friends {friendsLoading && <span className="text-sm text-gray-500">(Loading...)</span>}
              </h3>
              
              {friendsLoading ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-12"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : friends.length === 0 ? (
                <p className="text-text-secondary text-sm">No friends yet</p>
              ) : (
                <div className="space-y-3">
                  {friends.map((friend) => (
                    <div key={friend.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center text-white text-lg">
                            {friend.avatar}
                          </div>
                          {friend.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-text-primary text-sm">{friend.name}</p>
                          <p className="text-text-secondary text-xs">
                            {friend.isOnline ? 'Online' : 'Offline'}
                          </p>
                        </div>
                      </div>
                      
                      {isOwnProfile && (
                        <button
                          onClick={() => handleOpenGrotto(friend)}
                          className="text-orange-500 hover:text-orange-600 text-sm px-3 py-1 rounded-lg hover:bg-orange-50 transition-all duration-200"
                        >
                          Chat
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Grotto Modal */}
      <GrottoModal
        isOpen={showGrotto}
        onClose={() => setShowGrotto(false)}
        friendName={selectedFriend?.name}
        friendAvatar={selectedFriend?.avatar}
      />
    </div>
  )
}

export default MyOasisPage