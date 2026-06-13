import prisma from '../utils/prisma.js';

export const getSettings = async () => {
  return prisma.systemSetting.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 }
  });
};

export const updateSettings = async (data) => {
  return prisma.systemSetting.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...data }
  });
};
