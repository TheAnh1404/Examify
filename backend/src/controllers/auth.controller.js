import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserRepository from '../repositories/user.repository.js';

class AuthController {
  async register(req, res) {
    try {
      const { name, email, password, role } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required.' });
      }

      // Check if user already exists
      const existingUser = await UserRepository.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'A user with this email already exists.' });
      }

      // Check if role is valid (only allow student and teacher to self-register)
      const allowedRoles = ['student', 'teacher'];
      const userRole = allowedRoles.includes(role) ? role : 'student';

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const user = await UserRepository.create({
        name,
        email,
        password: hashedPassword,
        role: userRole
      });

      // Generate token
      const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'examify_jwt_super_secret_session_key_2026',
        { expiresIn: '1d' }
      );

      // Exclude password in response
      const { password: _, ...userWithoutPassword } = user;

      return res.status(201).json({
        message: 'Registration successful.',
        token,
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({ message: 'Internal server error during registration.' });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
      }

      // Find user
      const user = await UserRepository.findByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }

      // Generate token
      const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'examify_jwt_super_secret_session_key_2026',
        { expiresIn: '1d' }
      );

      // Exclude password in response
      const { password: _, ...userWithoutPassword } = user;

      return res.status(200).json({
        message: 'Login successful.',
        token,
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Internal server error during login.' });
    }
  }

  async getMe(req, res) {
    try {
      const user = await UserRepository.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      const { password: _, ...userWithoutPassword } = user;
      return res.status(200).json({ user: userWithoutPassword });
    } catch (error) {
      console.error('getMe error:', error);
      return res.status(500).json({ message: 'Internal server error fetching profile.' });
    }
  }
}

export default new AuthController();
