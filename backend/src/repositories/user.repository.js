import { db } from '../config/db.js';

class UserRepository {
  async findAll() {
    return [...db.users];
  }

  async findById(id) {
    const user = db.users.find(u => u.id === id);
    return user ? { ...user } : null;
  }

  async findByEmail(email) {
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return user ? { ...user } : null;
  }

  async create(userData) {
    const newUser = {
      id: userData.id || `usr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role || 'student',
      createdAt: new Date()
    };
    db.users.push(newUser);
    return { ...newUser };
  }

  async update(id, updateData) {
    const index = db.users.findIndex(u => u.id === id);
    if (index === -1) return null;

    db.users[index] = {
      ...db.users[index],
      ...updateData,
      // Do not allow overriding id
      id: db.users[index].id
    };

    return { ...db.users[index] };
  }

  async delete(id) {
    const index = db.users.findIndex(u => u.id === id);
    if (index === -1) return false;

    // Delete related submissions if necessary (or leave for simplicity)
    db.users.splice(index, 1);
    return true;
  }
}

export default new UserRepository();
