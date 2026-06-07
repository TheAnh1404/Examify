import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma.js';
import generateToken from '../utils/generateToken.js';

export const register = async (userData) => {
  const { fullName, email, password, role } = userData;

  const userExists = await prisma.user.findUnique({ where: { email } });
  if (userExists) {
    throw new Error('User already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash,
      role: role || 'STUDENT'
    }
  });

  const { passwordHash: _, ...userWithoutPassword } = user;
  return {
    user: userWithoutPassword,
    token: generateToken(user.id)
  };
};

export const login = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (user && (await bcrypt.compare(password, user.passwordHash))) {
    if (user.status === 'LOCKED') {
      throw new Error('Account is locked');
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token: generateToken(user.id)
    };
  } else {
    throw new Error('Invalid email or password');
  }
};
