import { User } from '@prisma/client';
import { findOrCreateUser } from '../repositories/userRepository';

export async function getOrCreateUser(
  telegramUserId: string,
  firstName: string | undefined,
  username: string | undefined
): Promise<User> {
  return findOrCreateUser(
    telegramUserId,
    firstName ?? null,
    username ?? null
  );
}
