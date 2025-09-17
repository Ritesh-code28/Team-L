import React, { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../App'
import apiService from '../services/api'

const AuthForm = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showHappyModal, setShowHappyModal] = useState(false)
  const { login } = useContext(UserContext)
  const navigate = useNavigate()

  const happyChoices = ['Gaming', 'Movies', 'Sports', 'Cooking']

  useEffect(() => {
    if (isSignUp) {
      generateUsername()
    }
  }, [isSignUp])

  const generateUsername = async () => {
    try {
      // Generate a simple username without backend call
      const randomNum = Math.floor(Math.random() * 1000)
      const usernames = ['MindfulSoul', 'PeacefulHeart', 'CalmWater', 'SereneWind', 'GentleSpirit']
      const randomName = usernames[Math.floor(Math.random() * usernames.length)]
      setFormData(prev => ({ ...prev, username: `${randomName}${randomNum}` }))
    } catch (error) {
      console.error('Failed to generate username:', error)
      setFormData(prev => ({ ...prev, username: `User${Date.now()}` }))
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (isSignUp && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      let data
      
      if (isSignUp) {
        data = await apiService.signup(formData.username, formData.password)
      } else {
        data = await apiService.login(formData.username, formData.password)
      }
      
      console.log('Auth response:', data)
      
      if (data.success) {
        localStorage.setItem('authToken', data.data.token)
        localStorage.setItem('user', JSON.stringify(data.data.user))
        
        if (isSignUp) {
          setShowHappyModal(true)
        } else {
          login(data.data.user, data.data.token)
          navigate('/world-chat')
        }
      } else {
        setErrors({ submit: data.message || 'Authentication failed' })
      }
    } catch (error) {
      console.error('Auth error:', error)
      setErrors({ submit: `Error: ${error.message}` })
    } finally {
      setLoading(false)
    }
  }

  const handleHappyChoice = async (choice) => {
    try {
      const data = await apiService.updateHappyChoice(choice)
      
      if (data.success) {
        const user = JSON.parse(localStorage.getItem('user'))
        const token = localStorage.getItem('authToken')
        user.happyChoice = choice
        localStorage.setItem('user', JSON.stringify(user))
        login(user, token)
        setShowHappyModal(false)
        navigate('/onboarding/bloom')
      }
    } catch (error) {
      console.error('Failed to update happy choice:', error)
      // Still navigate on error
      setShowHappyModal(false)
      navigate('/onboarding/bloom')
    }
  }

  const inputClass = (fieldName) => `
    w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 ${errors[fieldName] ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}
  `

  return (
    <>
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {isSignUp ? 'Join Echo' : 'Welcome Back'}
            </h2>
            <p className="text-gray-600">
              {isSignUp 
                ? 'Create your peaceful digital space' 
                : 'Continue your mindful journey'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={inputClass('username')}
                  placeholder="Your username"
                  readOnly={isSignUp}
                />
                {isSignUp && (
                  <button
                    type="button"
                    onClick={generateUsername}
                    className="px-3 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    🎲
                  </button>
                )}
              </div>
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={inputClass('password')}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={inputClass('confirmPassword')}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {errors.submit && (
              <p className="text-red-500 text-sm text-center">{errors.submit}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-400 to-pink-400 text-white py-3 rounded-xl font-medium hover:from-orange-500 hover:to-pink-500 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setFormData({ username: '', password: '', confirmPassword: '' })
                  setErrors({})
                }}
                className="ml-2 text-orange-500 hover:text-orange-600 font-medium transition-colors duration-200"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
      </div>

      {showHappyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              What makes you happy?
            </h3>
            <p className="text-gray-600 mb-6 text-center">
              This helps us personalize your Echo experience
            </p>
            <div className="space-y-3">
              {happyChoices.map((choice) => (
                <button
                  key={choice}
                  onClick={() => handleHappyChoice(choice)}
                  className="w-full p-3 text-left rounded-xl border border-gray-200 hover:border-orange-400 hover:bg-orange-50 transition-all duration-200"
                >
                  {choice}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AuthForm