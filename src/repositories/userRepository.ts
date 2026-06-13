import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

export async function findOrCreateUser(
  telegramUserId: string,
  name: string | null,
  username: string | null
): Promise<User> {
  return prisma.user.upsert({
    where: { telegramUserId },
    update: { name, username },
    create: { telegramUserId, name, username },
  });
}

export async function findUserByTelegramId(telegramUserId: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { telegramUserId } });
}
