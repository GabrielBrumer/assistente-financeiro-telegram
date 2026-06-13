import { Context } from 'telegraf';
import { GeminiResult } from '../../llm/gemini';
import {
  saveTransaction,
  deleteLastTransaction,
  updateLastTransactionCategory,
  updateLastTransactionAmount,
  deleteTransactionById,
  updateTransactionCategoryById,
  updateTransactionAmountById,
} from '../../services/transactionService';
import { processQuery } from '../../services/queryService';
import { storeList, getStoredList } from '../session';
import { formatCurrency } from '../../utils/currency';
import { getCategoryLabel } from '../../utils/helpers';

export async function processGeminiResult(
  ctx: Context,
  userId: string,
  result: GeminiResult,
  originalText: string
): Promise<void> {
  if (result.intent === 'transaction' && result.transaction) {
    await saveTransaction(userId, result.transaction, originalText);

    const typeLabel = result.transaction.type === 'INCOME' ? 'Receita' : 'Despesa';
    const amount = formatCurrency(result.transaction.amount);
    const category = getCategoryLabel(result.transaction.category);
    const date = new Date(result.transaction.transactionDate).toLocaleDateString('pt-BR');

    await ctx.reply(
      `*Transacao registrada!*\n\n` +
        `Tipo: ${typeLabel}\n` +
        `Valor: ${amount}\n` +
        `Categoria: ${category}\n` +
        `Descricao: ${result.transaction.description}\n` +
        `Data: ${date}`,
      { parse_mode: 'Markdown' }
    );
    return;
  }

  if (result.intent === 'query' && result.query) {
    const { message, ids } = await processQuery(userId, result.query);
    if (ids && ids.length) {
      storeList(userId, ids);
    }
    await ctx.reply(message, { parse_mode: 'Markdown' });
    return;
  }

  if (result.intent === 'correction' && result.correction) {
    let res: { success: boolean; message: string };

    switch (result.correction.type) {
      case 'delete_last':
        res = await deleteLastTransaction(userId);
        break;

      case 'update_last_category':
        if (!result.correction.category) {
          await ctx.reply('Nao consegui identificar a categoria para atualizar.');
          return;
        }
        res = await updateLastTransactionCategory(userId, result.correction.category);
        break;

      case 'update_last_amount':
        if (result.correction.amount === null || result.correction.amount === undefined) {
          await ctx.reply('Nao consegui identificar o valor para atualizar.');
          return;
        }
        res = await updateLastTransactionAmount(userId, result.correction.amount);
        break;

      case 'delete_by_position': {
        const pos = result.correction.position;
        if (!pos) {
          await ctx.reply('Nao consegui identificar a posicao. Diga "apagar o 1" usando o numero da lista.');
          return;
        }
        const list = getStoredList(userId);
        const id = list[pos - 1];
        if (!id) {
          await ctx.reply(`Posicao ${pos} nao encontrada. Liste os lancamentos primeiro.`);
          return;
        }
        res = await deleteTransactionById(userId, id);
        break;
      }

      case 'update_by_position_category': {
        const pos = result.correction.position;
        if (!pos || !result.correction.category) {
          await ctx.reply('Nao consegui identificar posicao ou categoria. Ex: "corrigir categoria do 2 para mercado"');
          return;
        }
        const list = getStoredList(userId);
        const id = list[pos - 1];
        if (!id) {
          await ctx.reply(`Posicao ${pos} nao encontrada. Liste os lancamentos primeiro.`);
          return;
        }
        res = await updateTransactionCategoryById(userId, id, result.correction.category);
        break;
      }

      case 'update_by_position_amount': {
        const pos = result.correction.position;
        if (!pos || result.correction.amount === null || result.correction.amount === undefined) {
          await ctx.reply('Nao consegui identificar posicao ou valor. Ex: "alterar valor do 2 para 45"');
          return;
        }
        const list = getStoredList(userId);
        const id = list[pos - 1];
        if (!id) {
          await ctx.reply(`Posicao ${pos} nao encontrada. Liste os lancamentos primeiro.`);
          return;
        }
        res = await updateTransactionAmountById(userId, id, result.correction.amount);
        break;
      }

      default:
        res = { success: false, message: 'Tipo de correcao nao reconhecido.' };
    }

    await ctx.reply(res.success ? `*OK!* ${res.message}` : `*Erro:* ${res.message}`, {
      parse_mode: 'Markdown',
    });
    return;
  }

  await ctx.reply(
    'Nao entendi. Exemplos:\n' +
      '"gastei 50 reais no mercado"\n' +
      '"ganhei 3000 de salario"\n' +
      '"quanto gastei esse mes?"\n\n' +
      'Use /help para mais exemplos.'
  );
}
