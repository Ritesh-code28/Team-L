// Stream data persistence utilities

/**
 * Get joined streams from localStorage
 * @returns {string[]} Array of joined stream IDs
 */
export const getJoinedStreams = () => {
  return JSON.parse(localStorage.getItem('joinedStreams') || '[]')
}

/**
 * Save joined streams to localStorage
 * @param {string[]} streamIds Array of stream IDs
 */
export const saveJoinedStreams = (streamIds) => {
  localStorage.setItem('joinedStreams', JSON.stringify(streamIds))
  console.log('Saved joined streams:', streamIds)
}

/**
 * Add a stream to joined streams
 * @param {string} streamId Stream ID to add
 */
export const addJoinedStream = (streamId) => {
  const joined = getJoinedStreams()
  if (!joined.includes(streamId)) {
    joined.push(streamId)
    saveJoinedStreams(joined)
  }
}

/**
 * Remove a stream from joined streams
 * @param {string} streamId Stream ID to remove
 */
export const removeJoinedStream = (streamId) => {
  const joined = getJoinedStreams()
  const updated = joined.filter(id => id !== streamId)
  saveJoinedStreams(updated)
}

/**
 * Check if user has joined a stream
 * @param {string} streamId Stream ID to check
 * @returns {boolean} True if stream is joined
 */
export const isStreamJoined = (streamId) => {
  return getJoinedStreams().includes(streamId)
}

/**
 * Get messages for a specific stream
 * @param {string} streamId Stream ID
 * @returns {Array} Array of messages
 */
export const getStreamMessages = (streamId) => {
  return JSON.parse(localStorage.getItem(`streamMessages_${streamId}`) || '[]')
}

/**
 * Save messages for a specific stream
 * @param {string} streamId Stream ID
 * @param {Array} messages Array of messages
 */
export const saveStreamMessages = (streamId, messages) => {
  localStorage.setItem(`streamMessages_${streamId}`, JSON.stringify(messages))
  console.log(`Saved ${messages.length} messages for stream ${streamId}`)
}

/**
 * Add a message to a stream
 * @param {string} streamId Stream ID
 * @param {Object} message Message object
 */
export const addStreamMessage = (streamId, message) => {
  const messages = getStreamMessages(streamId)
  messages.push(message)
  saveStreamMessages(streamId, messages)
}

export const clearAllStreamMessages = () => {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('streamMessages_')) {
      localStorage.removeItem(key)
    }
  })
  console.log('Cleared all stream messages')
}

export const clearAllStreamData = () => {
  localStorage.removeItem('joinedStreams')
  clearAllStreamMessages()
  console.log('Cleared all stream data')
}