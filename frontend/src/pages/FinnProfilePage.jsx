import React, { useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { UserContext } from '../App'
import { mockData } from '../data/mockData'

const FinnProfilePage = () => {
  const { currentUser } = useContext(UserContext)
  const [requestSent, setRequestSent] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const finn = mockData.finnProfile

  const handleSendFriendRequest = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000'
      const token = localStorage.getItem('authToken')
      
      console.log('Sending friend request to FINN...')
      
      const response = await fetch(`${API_URL}/api/friend-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientUsername: 'FINN',
          message: 'Hi FINN! I would love to connect with you and learn more about Echo!'
        })
      })

      const data = await response.json()
      console.log('Friend request response:', data)
      
      if (data.success) {
        setRequestSent(true)
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      } else {
        console.error('Failed to send friend request:', data.message)
        alert(data.message || 'Failed to send friend request')
      }
    } catch (error) {
      console.error('Failed to send friend request:', error)
      alert('Failed to send friend request. Please try again.')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="card mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-6 sm:space-y-0 sm:space-x-6">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-echo-deep-teal to-echo-mint flex items-center justify-center text-4xl shadow-peaceful">
                {finn.avatar}
              </div>
            </div>
            
            <div className="flex-1">
              <h1 className="font-display text-3xl font-bold text-text-primary mb-2">
                {finn.name}
              </h1>
              <p className="text-text-secondary mb-4 leading-relaxed">
                {finn.bio}
              </p>
              
              <div className="flex items-center space-x-6 text-sm text-text-secondary">
                <span className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>{finn.friendsCount.toLocaleString()} friends</span>
                </span>
                <span className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <span>{finn.postsCount} posts</span>
                </span>
                <span className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Member since {formatDate(finn.joinDate)}</span>
                </span>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <div className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-medium text-center">
                Echo Guide
              </div>
              {!requestSent ? (
                <button
                  onClick={handleSendFriendRequest}
                  className="px-4 py-2 bg-orange-400 text-white rounded-xl text-sm font-medium hover:bg-orange-500 transition-colors"
                >
                  Send Friend Request
                </button>
              ) : (
                <div className="px-4 py-2 bg-green-100 text-green-700 rounded-xl text-sm font-medium text-center">
                  Request Sent ✓
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FinnProfilePage