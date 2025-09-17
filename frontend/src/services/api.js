class ApiService {
  constructor() {
    this.initializeMockData()
  }

  initializeMockData() {
    if (!localStorage.getItem('mockUsers')) {
      localStorage.setItem('mockUsers', JSON.stringify({}))
    }
    if (!localStorage.getItem('mockProfiles')) {
      localStorage.setItem('mockProfiles', JSON.stringify({}))
    }
  }

  async delay(ms = 100) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9)
  }

  async login(username, password) {
    await this.delay()
    const users = JSON.parse(localStorage.getItem('mockUsers') || '{}')
    const user = users[username]
    
    if (!user || user.password !== password) {
      throw new Error('Invalid credentials')
    }

    const token = this.generateId()
    localStorage.setItem('authToken', token)
    localStorage.setItem('currentUser', JSON.stringify(user))
    
    return {
      success: true,
      data: {
        user: {
          username: user.username,
          bio: user.bio || '',
          bloom: user.bloom || '🌸',
          bloomStyle: user.bloomStyle || 'serene',
          colorPalette: user.colorPalette || 'sage',
          happyChoice: user.happyChoice || 'Gaming'
        },
        token
      }
    }
  }

  async signup(username, password, happyChoice = 'Gaming') {
    await this.delay();
    
    const users = JSON.parse(localStorage.getItem('mockUsers') || '{}');
    
    if (users[username]) {
      throw new Error('Username already exists');
    }

    const user = {
      username,
      password,
      happyChoice,
      bio: '',
      bloom: '🌸',
      bloomStyle: 'serene',
      colorPalette: 'sage',
      createdAt: new Date().toISOString()
    };

    users[username] = user;
    localStorage.setItem('mockUsers', JSON.stringify(users));
    
    const token = this.generateId();
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    return {
      success: true,
      data: {
        user: {
          username: user.username,
          bio: user.bio,
          bloom: user.bloom,
          bloomStyle: user.bloomStyle,
          colorPalette: user.colorPalette,
          happyChoice: user.happyChoice
        },
        token
      }
    };
  }

  async logout() {
    await this.delay();
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    
    return { success: true };
  }

  // Blog methods
  async getBlogs() {
    await this.delay();
    
    const blogs = JSON.parse(localStorage.getItem('mockBlogs') || '[]');
    return {
      success: true,
      data: { blogs }
    };
  }

  async createBlog(blogData) {
    await this.delay();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const blogs = JSON.parse(localStorage.getItem('mockBlogs') || '[]');
    
    const newBlog = {
      _id: this.generateId(),
      ...blogData,
      author: currentUser.username || 'Anonymous',
      createdAt: new Date().toISOString(),
      likes: [],
      comments: []
    };
    
    blogs.unshift(newBlog);
    localStorage.setItem('mockBlogs', JSON.stringify(blogs));
    
    return {
      success: true,
      data: { blog: newBlog }
    };
  }

  async getBlog(id) {
    await this.delay();
    
    const blogs = JSON.parse(localStorage.getItem('mockBlogs') || '[]');
    const blog = blogs.find(b => b._id === id);
    
    if (!blog) {
      throw new Error('Blog not found');
    }
    
    return {
      success: true,
      data: { blog }
    };
  }

  async likeBlog(blogId) {
    await this.delay();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const blogs = JSON.parse(localStorage.getItem('mockBlogs') || '[]');
    const blog = blogs.find(b => b._id === blogId);
    
    if (blog && !blog.likes.includes(currentUser.username)) {
      blog.likes.push(currentUser.username);
      localStorage.setItem('mockBlogs', JSON.stringify(blogs));
    }
    
    return { success: true };
  }

  async dislikeBlog(blogId) {
    await this.delay();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const blogs = JSON.parse(localStorage.getItem('mockBlogs') || '[]');
    const blog = blogs.find(b => b._id === blogId);
    
    if (blog) {
      blog.likes = blog.likes.filter(username => username !== currentUser.username);
      localStorage.setItem('mockBlogs', JSON.stringify(blogs));
    }
    
    return { success: true };
  }

  // Profile methods
  async getProfile() {
    await this.delay();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return {
      success: true,
      data: {
        user: currentUser
      }
    };
  }

  async updateProfile(profileData) {
    await this.delay();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const users = JSON.parse(localStorage.getItem('mockUsers') || '{}');
    
    const updatedUser = { ...currentUser, ...profileData };
    
    users[currentUser.username] = updatedUser;
    localStorage.setItem('mockUsers', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    return {
      success: true,
      data: {
        user: updatedUser
      }
    };
  }

  async updateHappyChoice(happyChoice) {
    await this.delay();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const users = JSON.parse(localStorage.getItem('mockUsers') || '{}');
    
    currentUser.happyChoice = happyChoice;
    users[currentUser.username] = currentUser;
    
    localStorage.setItem('mockUsers', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    return {
      success: true,
      data: {
        user: currentUser
      }
    };
  }

  // Friend methods
  async getFriends() {
    await this.delay();
    
    // Return empty friends list for now
    return {
      success: true,
      data: {
        friends: [],
        pendingRequests: []
      }
    };
  }

  async sendFriendRequest(userId) {
    await this.delay();
    
    return {
      success: true,
      message: 'Friend request sent'
    };
  }

  async respondToFriendRequest(requestId, accept) {
    await this.delay();
    
    return {
      success: true,
      message: accept ? 'Friend request accepted' : 'Friend request declined'
    };
  }

  // Mock WebSocket - just return a mock object
  createWebSocket() {
    console.log('WebSocket disabled in frontend-only mode');
    return {
      send: () => {},
      close: () => {},
      onopen: null,
      onmessage: null,
      onclose: null,
      onerror: null
    };
  }
}

export const apiService = new ApiService();
export default apiService;