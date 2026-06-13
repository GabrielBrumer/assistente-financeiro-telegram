import { Category } from '@prisma/client';
import { QueryData } from '../llm/gemini';
import {
  sumByUserAndPeriod,
  sumByUserCategoryAndPeriod,
  groupByCategoryAndPeriod,
  findByUserAndPeriod,
} from '../repositories/transactionRepository';
import { getMonthRange, getLastNDaysRange, formatMonthYear } from '../utils/date';
import { formatCurrency } from '../utils/currency';
import { getCategoryLabel } from '../utils/helpers';

export type QueryResult = { message: string; ids?: string[] };

export async function processQuery(userId: string, query: QueryData): Promise<QueryResult> {
  const now = new Date();
  const month = query.month ?? now.getMonth() + 1;
  const year = query.year ?? now.getFullYear();

  switch (query.type) {
    case 'monthly_expense': {
      const { start, end } = getMonthRange(month, year);
      const total = await sumByUserAndPeriod(userId, start, end, 'EXPENSE');
      return { message: `Despesas em ${formatMonthYear(month, year)}: *${formatCurrency(total)}*` };
    }

    case 'monthly_income': {
      const { start, end } = getMonthRange(month, year);
      const total = await sumByUserAndPeriod(userId, start, end, 'INCOME');
      return { message: `Receitas em ${formatMonthYear(month, year)}: *${formatCurrency(total)}*` };
    }

    case 'monthly_summary': {
      const { start, end } = getMonthRange(month, year);
      const [income, expense] = await Promise.all([
        sumByUserAndPeriod(userId, start, end, 'INCOME'),
        sumByUserAndPeriod(userId, start, end, 'EXPENSE'),
      ]);
      const balance = income - expense;
      return {
        message:
          `*Resumo de ${formatMonthYear(month, year)}*\n\n` +
          `Receitas: ${formatCurrency(income)}\n` +
          `Despesas: ${formatCurrency(expense)}\n` +
          `Saldo: *${formatCurrency(balance)}*`,
      };
    }

    case 'expense_by_category': {
      const { start, end } = getMonthRange(month, year);
      if (query.category) {
        const total = await sumByUserCategoryAndPeriod(
          userId,
          query.category as Category,
          start,
          end
        );
        return {
          message: `${getCategoryLabel(query.category)} em ${formatMonthYear(month, year)}: *${formatCurrency(total)}*`,
        };
      }
      const groups = await groupByCategoryAndPeriod(userId, start, end, 'EXPENSE');
      if (!groups.length) return { message: `Nenhuma despesa em ${formatMonthYear(month, year)}.` };
      const lines = groups.map((g) => `${getCategoryLabel(g.category)}: ${formatCurrency(g.total)}`);
      return {
        message: `*Despesas por categoria - ${formatMonthYear(month, year)}*\n\n${lines.join('\n')}`,
      };
    }

    case 'income_by_period': {
      const days = query.days ?? 30;
      const { start, end } = getLastNDaysRange(days);
      const total = await sumByUserAndPeriod(userId, start, end, 'INCOME');
      return { message: `Receitas nos ultimos ${days} dias: *${formatCurrency(total)}*` };
    }

    case 'expense_by_period': {
      const days = query.days ?? 30;
      const { start, end } = getLastNDaysRange(days);
      const total = await sumByUserAndPeriod(userId, start, end, 'EXPENSE');
      return { message: `Despesas nos ultimos ${days} dias: *${formatCurrency(total)}*` };
    }

    case 'period_summary': {
      const days = query.days ?? 30;
      const { start, end } = getLastNDaysRange(days);
      const [income, expense] = await Promise.all([
        sumByUserAndPeriod(userId, start, end, 'INCOME'),
        sumByUserAndPeriod(userId, start, end, 'EXPENSE'),
      ]);
      const balance = income - expense;
      return {
        message:
          `*Resumo dos ultimos ${days} dias*\n\n` +
          `Receitas: ${formatCurrency(income)}\n` +
          `Despesas: ${formatCurrency(expense)}\n` +
          `Saldo: *${formatCurrency(balance)}*`,
      };
    }

    case 'list_transactions': {
      let start: Date, end: Date, label: string;

      if (query.date) {
        const [y, m, d] = query.date.split('-').map(Number);
        start = new Date(y, m - 1, d, 0, 0, 0, 0);
        end = new Date(y, m - 1, d, 23, 59, 59, 999);
        label = `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
      } else if (query.days) {
        ({ start, end } = getLastNDaysRange(query.days));
        label = `ultimos ${query.days} dias`;
      } else {
        ({ start, end } = getMonthRange(month, year));
        label = formatMonthYear(month, year);
      }

      const transactions = await findByUserAndPeriod(userId, start, end);

      if (!transactions.length) {
        return { message: `Nenhum lancamento encontrado em ${label}.` };
      }

      const ids = transactions.map((t) => t.id);
      const lines = transactions.map((t, i) => {
        const sign = t.type === 'INCOME' ? '+' : '-';
        const date = t.transactionDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        const amount = formatCurrency(parseFloat(t.amount.toString()));
        const category = getCategoryLabel(t.category);
        const desc = t.description ? ` | ${t.description}` : '';
        return `${i + 1}. ${date} | ${sign} ${amount} | ${category}${desc}`;
      });

      const total = transactions.length;
      const suffix = total === 100 ? ' \\(limite de 100\\)' : '';
      const hint =
        `\n\n_Para editar ou remover: "apagar o 1", "alterar valor do 2 para 45", "corrigir categoria do 3 para mercado"_`;

      return {
        message:
          `*Lancamentos — ${label}*\n\n` +
          lines.join('\n') +
          `\n\nTotal: ${total} lancamento${total !== 1 ? 's' : ''}${suffix}` +
          hint,
        ids,
      };
    }

    default:
      return { message: 'Nao entendi a consulta. Tente: "quanto gastei esse mes?" ou "resumo do mes".' };
  }
}
