import { Context } from 'telegraf';
import { getOrCreateUser } from '../../services/userService';
import { processQuery } from '../../services/queryService';
import { getCategoryLabel } from '../../utils/helpers';

const ALL_CATEGORIES = [
  'ALIMENTACAO', 'MERCADO', 'TRANSPORTE', 'MORADIA', 'SAUDE',
  'LAZER', 'EDUCACAO', 'SALARIO', 'PIX_RECEBIDO', 'INVESTIMENTOS', 'OUTROS',
];

export async function handleResumo(ctx: Context): Promise<void> {
  const from = ctx.from;
  if (!from) return;

  const user = await getOrCreateUser(String(from.id), from.first_name, from.username);
  const response = await processQuery(user.id, {
    type: 'monthly_summary',
    month: null,
    year: null,
    category: null,
    days: null,
  });
  await ctx.reply(response, { parse_mode: 'Markdown' });
}

export async function handleCategorias(ctx: Context): Promise<void> {
  const lines = ALL_CATEGORIES.map((c) => `- ${getCategoryLabel(c)}`).join('\n');
  await ctx.reply(`*Categorias disponiveis:*\n\n${lines}`, { parse_mode: 'Markdown' });
}

export async function handleMinhaConta(ctx: Context): Promise<void> {
  const from = ctx.from;
  if (!from) return;

  const user = await getOrCreateUser(String(from.id), from.first_name, from.username);
  const since = user.createdAt.toLocaleDateString('pt-BR');

  await ctx.reply(
    `*Minha Conta*\n\n` +
      `Nome: ${from.first_name ?? 'Nao informado'}\n` +
      `Username: ${from.username ? '@' + from.username : 'Nao configurado'}\n` +
      `ID Telegram: ${from.id}\n` +
      `Membro desde: ${since}`,
    { parse_mode: 'Markdown' }
  );
}
