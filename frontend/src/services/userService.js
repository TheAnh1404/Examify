import { db } from '../data/mockData';

export const userService = {
  getAll: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { data: [...db.users] };
  },

  getById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const user = db.users.find(u => u.id === id);
    if (!user) return Promise.reject(new Error('User not found'));
    return { data: { ...user } };
  },

  create: async (userData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const exists = db.users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (exists) return Promise.reject(new Error('Email already registered'));

    const newUser = {
      id: `usr-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role.toUpperCase(),
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    db.save('users');
    return { data: newUser };
  },

  update: async (id, userData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = db.users.findIndex(u => u.id === id);
    if (index === -1) return Promise.reject(new Error('User not found'));

    db.users[index] = {
      ...db.users[index],
      name: userData.name || db.users[index].name,
      email: userData.email || db.users[index].email,
      role: userData.role ? userData.role.toUpperCase() : db.users[index].role,
      password: userData.password || db.users[index].password
    };
    db.save('users');
    return { data: db.users[index] };
  },

  delete: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const index = db.users.findIndex(u => u.id === id);
    if (index === -1) return Promise.reject(new Error('User not found'));

    db.users.splice(index, 1);
    db.save('users');
    return { data: { message: 'User deleted' } };
  }
};
