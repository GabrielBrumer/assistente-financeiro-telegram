import { PrismaClient, Transaction, TransactionType, Category } from '@prisma/client';

const prisma = new PrismaClient();

type CreateTransactionInput = {
  userId: string;
  type: TransactionType;
  amount: number;
  category: Category;
  description: string;
  originalText: string;
  transactionDate: Date;
};

export async function createTransaction(data: CreateTransactionInput): Promise<Transaction> {
  return prisma.transaction.create({ data });
}

export async function findLastByUser(userId: string): Promise<Transaction | null> {
  return prisma.transaction.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function deleteTransactionByUser(id: string, userId: string): Promise<void> {
  await prisma.transaction.deleteMany({ where: { id, userId } });
}

export async function updateTransactionByUser(
  id: string,
  userId: string,
  data: { category?: Category; amount?: number }
): Promise<void> {
  await prisma.transaction.updateMany({ where: { id, userId }, data });
}

export async function sumByUserAndPeriod(
  userId: string,
  start: Date,
  end: Date,
  type?: TransactionType
): Promise<number> {
  const result = await prisma.transaction.aggregate({
    where: {
      userId,
      transactionDate: { gte: start, lte: end },
      ...(type ? { type } : {}),
    },
    _sum: { amount: true },
  });
  return parseFloat(result._sum.amount?.toString() ?? '0');
}

export async function sumByUserCategoryAndPeriod(
  userId: string,
  category: Category,
  start: Date,
  end: Date
): Promise<number> {
  const result = await prisma.transaction.aggregate({
    where: { userId, category, transactionDate: { gte: start, lte: end } },
    _sum: { amount: true },
  });
  return parseFloat(result._sum.amount?.toString() ?? '0');
}

export async function groupByCategoryAndPeriod(
  userId: string,
  start: Date,
  end: Date,
  type?: TransactionType
): Promise<{ category: Category; total: number }[]> {
  const results = await prisma.transaction.groupBy({
    by: ['category'],
    where: {
      userId,
      transactionDate: { gte: start, lte: end },
      ...(type ? { type } : {}),
    },
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
  });
  return results.map((r) => ({
    category: r.category,
    total: parseFloat(r._sum.amount?.toString() ?? '0'),
  }));
}
