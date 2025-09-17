import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import BloomCustomizationPage from './pages/BloomCustomizationPage'
import WorldChatPage from './pages/WorldChatPage'
import StreamsPage from './pages/StreamsPage'
import IndividualStreamPage from './pages/IndividualStreamPage'
import MyOasisPage from './pages/MyOasisPage'
import FinnProfilePage from './pages/FinnProfilePage'
import Navbar from './components/Navbar'
import { mockData } from './data/mockData'
import { clearAllStreamData } from './utils/streamStorage'

export const UserContext = React.createContext()
export const DataContext = React.createContext()

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [friendRequests, setFriendRequests] = useState([])
  const [appData, setAppData] = useState(mockData)

  useEffect(() => {
    if (!isAuthenticated) {
      setFriendRequests([{
        id: 'finn-request',
        from: 'finn',
        fromName: 'FINN',
        fromAvatar: '🐬',
        message: 'Hey! Would love to connect with you on Echo!',
        timestamp: new Date().toISOString()
      }])
    }
  }, [isAuthenticated])

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const savedToken = localStorage.getItem('authToken')
    
    if (savedUser && savedToken) {
      try {
        const user = JSON.parse(savedUser)
        setCurrentUser(user)
        setIsAuthenticated(true)
        loadFriendRequests()
      } catch (error) {
        localStorage.removeItem('user')
        localStorage.removeItem('authToken')
      }
    }
  }, [])

  const loadFriendRequests = async () => {
    setFriendRequests([])
  }

  const login = (userData, token = null) => {
    setCurrentUser(userData)
    setIsAuthenticated(true)
    localStorage.setItem('user', JSON.stringify(userData))
    
    if (token) {
      localStorage.setItem('authToken', token)
    }
    
    setTimeout(() => loadFriendRequests(), 1000)
  }

  const logout = () => {
    setCurrentUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('user')
    localStorage.removeItem('authToken')
    clearAllStreamData()
    setFriendRequests([])
  }

  const userContextValue = {
    isAuthenticated,
    currentUser,
    login,
    logout,
    friendRequests,
    setFriendRequests,
    loadFriendRequests
  }

  const dataContextValue = {
    ...appData,
    setAppData
  }

  return (
    <UserContext.Provider value={userContextValue}>
      <DataContext.Provider value={dataContextValue}>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="min-h-screen bg-background">
            {isAuthenticated && <Navbar />}
            <main className={isAuthenticated ? 'pt-20' : ''}>
              <Routes>
                <Route path="/" element={isAuthenticated ? <Navigate to="/world-chat" /> : <LandingPage />} />
                <Route path="/auth" element={isAuthenticated ? <Navigate to="/world-chat" /> : <AuthPage />} />
                <Route path="/onboarding/bloom" element={isAuthenticated ? <BloomCustomizationPage /> : <Navigate to="/auth" />} />
                <Route path="/world-chat" element={isAuthenticated ? <WorldChatPage /> : <Navigate to="/auth" />} />
                <Route path="/streams" element={isAuthenticated ? <StreamsPage /> : <Navigate to="/auth" />} />
                <Route path="/streams/:streamId" element={isAuthenticated ? <IndividualStreamPage /> : <Navigate to="/auth" />} />
                <Route path="/oasis" element={isAuthenticated ? <MyOasisPage /> : <Navigate to="/auth" />} />
                <Route path="/profile/:userId" element={isAuthenticated ? <MyOasisPage /> : <Navigate to="/auth" />} />
                <Route path="/finn" element={isAuthenticated ? <FinnProfilePage /> : <Navigate to="/auth" />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        </Router>
      </DataContext.Provider>
    </UserContext.Provider>
  )
}

export default App