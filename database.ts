// Mock database functions - replace with your actual database implementation
let users: any[] = [
  {
    id: "1",
    username: "admin",
    password_hash: "$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQq",
    full_name: "System Administrator",
    troop_rank: "Colonel",
    role: "admin",
    permissions: {
      can_create_tasks: true,
      can_delete_tasks: true,
      can_manage_users: true,
    },
  },
]

let tasks: any[] = []

export async function findUserByUsername(username: string) {
  return users.find((user) => user.username === username)
}

export async function createUser(userData: any) {
  const newUser = {
    id: Date.now().toString(),
    ...userData,
    created_at: new Date().toISOString(),
  }
  users.push(newUser)
  return newUser
}

export async function getAllUsers() {
  return users
}

export async function updateUser(id: string, updates: any) {
  const index = users.findIndex((user) => user.id === id)
  if (index !== -1) {
    users[index] = { ...users[index], ...updates }
    return users[index]
  }
  return null
}

export async function deleteUser(id: string) {
  users = users.filter((user) => user.id !== id)
}

export async function createTask(taskData: any) {
  const newTask = {
    id: Date.now().toString(),
    ...taskData,
    created_at: new Date().toISOString(),
  }
  tasks.push(newTask)
  return newTask
}

export async function getAllTasks() {
  return tasks
}

export async function updateTask(id: string, updates: any) {
  const index = tasks.findIndex((task) => task.id === id)
  if (index !== -1) {
    tasks[index] = { ...tasks[index], ...updates }
    return tasks[index]
  }
  return null
}

export async function deleteTask(id: string) {
  tasks = tasks.filter((task) => task.id !== id)
}
