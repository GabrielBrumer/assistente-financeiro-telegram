import { Category, TransactionType } from '@prisma/client';
import {
  createTransaction,
  findLastByUser,
  deleteTransactionByUser,
  updateTransactionByUser,
} from '../repositories/transactionRepository';
import { TransactionData } from '../llm/gemini';

type ServiceResult = { success: boolean; message: string };

export async function saveTransaction(
  userId: string,
  data: TransactionData,
  originalText: string
): Promise<void> {
  await createTransaction({
    userId,
    type: data.type as TransactionType,
    amount: data.amount,
    category: data.category as Category,
    description: data.description,
    originalText,
    transactionDate: new Date(data.transactionDate),
  });
}

export async function deleteLastTransaction(userId: string): Promise<ServiceResult> {
  const last = await findLastByUser(userId);
  if (!last) return { success: false, message: 'Nenhuma transacao encontrada.' };

  await deleteTransactionByUser(last.id, userId);
  return { success: true, message: `Transacao apagada: ${last.description ?? 'sem descricao'}` };
}

export async function updateLastTransactionCategory(
  userId: string,
  category: string
): Promise<ServiceResult> {
  const last = await findLastByUser(userId);
  if (!last) return { success: false, message: 'Nenhuma transacao encontrada.' };

  await updateTransactionByUser(last.id, userId, { category: category as Category });
  return { success: true, message: `Categoria atualizada para ${category}.` };
}

export async function updateLastTransactionAmount(
  userId: string,
  amount: number
): Promise<ServiceResult> {
  const last = await findLastByUser(userId);
  if (!last) return { success: false, message: 'Nenhuma transacao encontrada.' };

  await updateTransactionByUser(last.id, userId, { amount });
  return { success: true, message: `Valor atualizado para R$ ${amount.toFixed(2)}.` };
}

export async function deleteTransactionById(userId: string, id: string): Promise<ServiceResult> {
  await deleteTransactionByUser(id, userId);
  return { success: true, message: 'Lancamento removido.' };
}

export async function updateTransactionCategoryById(
  userId: string,
  id: string,
  category: string
): Promise<ServiceResult> {
  await updateTransactionByUser(id, userId, { category: category as Category });
  return { success: true, message: `Categoria atualizada para ${category}.` };
}

export async function updateTransactionAmountById(
  userId: string,
  id: string,
  amount: number
): Promise<ServiceResult> {
  await updateTransactionByUser(id, userId, { amount });
  return { success: true, message: `Valor atualizado para R$ ${amount.toFixed(2)}.` };
}
