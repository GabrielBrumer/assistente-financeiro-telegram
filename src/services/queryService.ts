import { Category } from '@prisma/client';
import { QueryData } from '../llm/gemini';
import {
  sumByUserAndPeriod,
  sumByUserCategoryAndPeriod,
  groupByCategoryAndPeriod,
} from '../repositories/transactionRepository';
import { getMonthRange, getLastNDaysRange, formatMonthYear } from '../utils/date';
import { formatCurrency } from '../utils/currency';
import { getCategoryLabel } from '../utils/helpers';

export async function processQuery(userId: string, query: QueryData): Promise<string> {
  const now = new Date();
  const month = query.month ?? now.getMonth() + 1;
  const year = query.year ?? now.getFullYear();

  switch (query.type) {
    case 'monthly_expense': {
      const { start, end } = getMonthRange(month, year);
      const total = await sumByUserAndPeriod(userId, start, end, 'EXPENSE');
      return `Despesas em ${formatMonthYear(month, year)}: *${formatCurrency(total)}*`;
    }

    case 'monthly_income': {
      const { start, end } = getMonthRange(month, year);
      const total = await sumByUserAndPeriod(userId, start, end, 'INCOME');
      return `Receitas em ${formatMonthYear(month, year)}: *${formatCurrency(total)}*`;
    }

    case 'monthly_summary': {
      const { start, end } = getMonthRange(month, year);
      const [income, expense] = await Promise.all([
        sumByUserAndPeriod(userId, start, end, 'INCOME'),
        sumByUserAndPeriod(userId, start, end, 'EXPENSE'),
      ]);
      const balance = income - expense;
      return (
        `*Resumo de ${formatMonthYear(month, year)}*\n\n` +
        `Receitas: ${formatCurrency(income)}\n` +
        `Despesas: ${formatCurrency(expense)}\n` +
        `Saldo: *${formatCurrency(balance)}*`
      );
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
        return `${getCategoryLabel(query.category)} em ${formatMonthYear(month, year)}: *${formatCurrency(total)}*`;
      }
      const groups = await groupByCategoryAndPeriod(userId, start, end, 'EXPENSE');
      if (!groups.length) return `Nenhuma despesa em ${formatMonthYear(month, year)}.`;
      const lines = groups.map((g) => `${getCategoryLabel(g.category)}: ${formatCurrency(g.total)}`);
      return `*Despesas por categoria - ${formatMonthYear(month, year)}*\n\n${lines.join('\n')}`;
    }

    case 'income_by_period': {
      const days = query.days ?? 30;
      const { start, end } = getLastNDaysRange(days);
      const total = await sumByUserAndPeriod(userId, start, end, 'INCOME');
      return `Receitas nos ultimos ${days} dias: *${formatCurrency(total)}*`;
    }

    case 'expense_by_period': {
      const days = query.days ?? 30;
      const { start, end } = getLastNDaysRange(days);
      const total = await sumByUserAndPeriod(userId, start, end, 'EXPENSE');
      return `Despesas nos ultimos ${days} dias: *${formatCurrency(total)}*`;
    }

    default:
      return 'Nao entendi a consulta. Tente: "quanto gastei esse mes?" ou "resumo do mes".';
  }
}
