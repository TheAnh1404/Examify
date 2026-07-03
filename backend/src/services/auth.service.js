import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../utils/prisma.js';
import generateToken from '../utils/generateToken.js';

export const register = async (userData) => {
  const { fullName, email, password, role } = userData;
  const normalizedEmail = email.trim().toLowerCase();

  const userExists = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (userExists) {
    throw new Error('Người dùng đã tồn tại');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await prisma.user.create({
    data: {
      fullName: fullName.trim(),
      email: normalizedEmail,
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
  const user = await prisma.user.findUnique({ where: { email: email?.trim().toLowerCase() } });

  if (user && (await bcrypt.compare(password, user.passwordHash))) {
    if (user.status === 'LOCKED') {
      throw new Error('Tài khoản đã bị khóa');
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token: generateToken(user.id)
    };
  } else {
    throw new Error('Email hoặc mật khẩu không đúng');
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
    throw new Error('Token không hợp lệ hoặc đã hết hạn');
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
