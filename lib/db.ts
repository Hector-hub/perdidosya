// This is a mock database service
// In a real application, you would use a real database like PostgreSQL, MongoDB, etc.

interface User {
  id: string
  name: string
  email: string
  createdAt: Date
}

interface Item {
  id: string
  title: string
  description: string
  image: string
  date: string
  location: string
  type: "lost" | "found"
  userId: string
  createdAt: Date
}

interface Comment {
  id: string
  itemId: string
  userId: string
  text: string
  createdAt: Date
}

// Mock data
const users: User[] = []
const items: Item[] = []
const comments: Comment[] = []

const db = {
  // User methods
  createUser: async (user: Omit<User, "id" | "createdAt">) => {
    const newUser = {
      id: Math.random().toString(36).substring(2, 9),
      ...user,
      createdAt: new Date(),
    }
    users.push(newUser)
    return newUser
  },

  getUserByEmail: async (email: string) => {
    return users.find((user) => user.email === email)
  },

  // Item methods
  createItem: async (item: Omit<Item, "id" | "createdAt">) => {
    const newItem = {
      id: Math.random().toString(36).substring(2, 9),
      ...item,
      createdAt: new Date(),
    }
    items.push(newItem)
    return newItem
  },

  getItems: async (type?: "lost" | "found") => {
    if (type) {
      return items
        .filter((item) => item.type === type)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  getItemById: async (id: string) => {
    return items.find((item) => item.id === id)
  },

  // Comment methods
  createComment: async (comment: Omit<Comment, "id" | "createdAt">) => {
    const newComment = {
      id: Math.random().toString(36).substring(2, 9),
      ...comment,
      createdAt: new Date(),
    }
    comments.push(newComment)
    return newComment
  },

  getCommentsByItemId: async (itemId: string) => {
    return comments
      .filter((comment) => comment.itemId === itemId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  },
}

export default db

