const USERS_KEY = 'cardi_users'
const SESSION_KEY = 'cardi_session'

async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function seedTestAccount() {
  const users = getUsers()
  if (!users['user123']) {
    const hashedPassword = await hashPassword('admin123')
    users['user123'] = {
      email: 'user123',
      password: hashedPassword,
      fullName: 'Utilisateur Test',
    }
    saveUsers(users)
  }
}

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || {}
  } catch {
    return {}
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

seedTestAccount()

export const supabase = {
  auth: {
    signUp: async ({ email, password, options }) => {
      const users = getUsers()
      if (users[email]) return { error: { message: 'Deja inscrit' } }
      const hashedPassword = await hashPassword(password)
      users[email] = {
        email,
        password: hashedPassword,
        fullName: options?.data?.full_name || '',
      }
      saveUsers(users)
      const sessionUser = { ...users[email] }
      delete sessionUser.password
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ email, user: sessionUser })
      )
      return { error: null }
    },

    signInWithPassword: async ({ email, password }) => {
      const users = getUsers()
      const user = users[email]
      if (!user) return { error: { message: 'Identifiants invalides' } }
      const hashedPassword = await hashPassword(password)
      if (user.password !== hashedPassword) {
        return { error: { message: 'Identifiants invalides' } }
      }
      const sessionUser = { ...user }
      delete sessionUser.password
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ email, user: sessionUser })
      )
      return { error: null }
    },

    signInWithOAuth: async () => {
      return { error: { message: 'OAuth desactive (mode local)' } }
    },

    signOut: async () => {
      localStorage.removeItem(SESSION_KEY)
      return { error: null }
    },

    getSession: async () => {
      try {
        const raw = localStorage.getItem(SESSION_KEY)
        const session = raw ? JSON.parse(raw) : null
        return { data: { session }, error: null }
      } catch {
        return { data: { session: null }, error: null }
      }
    },

    onAuthStateChange: () => {
      return { data: { subscription: { unsubscribe: () => {} } } }
    },
  },
}
