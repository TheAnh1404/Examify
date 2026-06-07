import bcrypt from 'bcryptjs';
import crypto from 'crypto';
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

export const forgotPassword = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return null;
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: hashedToken,
      passwordResetExpires: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    }
  });

  return resetToken;
};

export const resetPassword = async (token, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpires: { gt: new Date() }
    }
  });

  if (!user) {
    throw new Error('Token is invalid or has expired');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpires: null
    }
  });

  return true;
};
