import bcrypt from 'bcryptjs';
import UserRepository from '../repositories/user.repository.js';
import ExamRepository from '../repositories/exam.repository.js';
import SubmissionRepository from '../repositories/submission.repository.js';

class AdminController {
  async getStats(req, res) {
    try {
      const users = await UserRepository.findAll();
      const exams = await ExamRepository.findAll();
      const submissions = await SubmissionRepository.findAll();

      const stats = {
        totalUsers: users.length,
        totalExams: exams.length,
        totalSubmissions: submissions.length,
        usersByRole: {
          admin: users.filter(u => u.role === 'admin').length,
          teacher: users.filter(u => u.role === 'teacher').length,
          student: users.filter(u => u.role === 'student').length
        },
        recentSubmissionsCount: submissions.filter(s => {
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          return new Date(s.submittedAt) >= oneWeekAgo;
        }).length
      };

      return res.status(200).json(stats);
    } catch (error) {
      console.error('Admin stats error:', error);
      return res.status(500).json({ message: 'Internal server error fetching stats.' });
    }
  }

  async getAllUsers(req, res) {
    try {
      const users = await UserRepository.findAll();
      // Exclude passwords
      const sanitizedUsers = users.map(user => {
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      return res.status(200).json(sanitizedUsers);
    } catch (error) {
      console.error('Admin getAllUsers error:', error);
      return res.status(500).json({ message: 'Internal server error fetching users.' });
    }
  }

  async createUser(req, res) {
    try {
      const { name, email, password, role } = req.body;

      if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'All fields are required.' });
      }

      const existingUser = await UserRepository.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists.' });
      }

      const allowedRoles = ['admin', 'teacher', 'student'];
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: 'Invalid user role.' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await UserRepository.create({
        name,
        email,
        password: hashedPassword,
        role
      });

      const { password: _, ...userWithoutPassword } = user;
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error('Admin createUser error:', error);
      return res.status(500).json({ message: 'Internal server error creating user.' });
    }
  }

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { name, email, role, password } = req.body;

      const user = await UserRepository.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      const updateData = {};
      if (name) updateData.name = name;
      if (email) {
        // Check if email taken by another user
        const existing = await UserRepository.findByEmail(email);
        if (existing && existing.id !== id) {
          return res.status(400).json({ message: 'Email already in use.' });
        }
        updateData.email = email;
      }
      if (role) {
        const allowedRoles = ['admin', 'teacher', 'student'];
        if (!allowedRoles.includes(role)) {
          return res.status(400).json({ message: 'Invalid user role.' });
        }
        updateData.role = role;
      }
      if (password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(password, salt);
      }

      const updatedUser = await UserRepository.update(id, updateData);
      const { password: _, ...sanitized } = updatedUser;

      return res.status(200).json(sanitized);
    } catch (error) {
      console.error('Admin updateUser error:', error);
      return res.status(500).json({ message: 'Internal server error updating user.' });
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      // Prevent self-deletion
      if (id === req.user.id) {
        return res.status(400).json({ message: 'You cannot delete your own admin account.' });
      }

      const user = await UserRepository.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      const success = await UserRepository.delete(id);
      if (success) {
        return res.status(200).json({ message: 'User deleted successfully.' });
      } else {
        return res.status(400).json({ message: 'Failed to delete user.' });
      }
    } catch (error) {
      console.error('Admin deleteUser error:', error);
      return res.status(500).json({ message: 'Internal server error deleting user.' });
    }
  }
}

export default new AdminController();
