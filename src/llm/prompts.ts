export const CATEGORIES = [
  'ALIMENTACAO',
  'MERCADO',
  'TRANSPORTE',
  'MORADIA',
  'SAUDE',
  'LAZER',
  'EDUCACAO',
  'SALARIO',
  'PIX_RECEBIDO',
  'INVESTIMENTOS',
  'OUTROS',
] as const;

export type CategoryType = (typeof CATEGORIES)[number];

const SCHEMA = `{
  "intent": "transaction" | "query" | "correction" | "unknown",
  "transaction": {
    "type": "INCOME" | "EXPENSE",
    "amount": number,
    "category": "UMA_DAS_CATEGORIAS",
    "description": "descricao resumida",
    "transactionDate": "YYYY-MM-DD"
  },
  "query": {
    "type": "monthly_expense" | "monthly_income" | "monthly_summary" | "expense_by_category" | "income_by_period" | "expense_by_period" | "period_summary" | "list_transactions",
    "month": null | number,
    "year": null | number,
    "category": null | "UMA_DAS_CATEGORIAS",
    "days": null | number
  },
  "correction": {
    "type": "delete_last" | "update_last_category" | "update_last_amount",
    "category": null | "UMA_DAS_CATEGORIAS",
    "amount": null | number
  }
}`;

const RULES = `Regras:
- Preencha apenas o campo correspondente ao intent; os demais devem ser null
- Se nao identificar valor em transacao, use intent: "unknown"
- Se nao identificar data, use a data atual informada
- INCOME: salario, recebi, ganhei, pix recebido, renda, entrada
- EXPENSE: gastei, paguei, comprei, custo, saida
- Palavras-chave de query: quanto, resumo, total, extrato, historico, listar, mostrar, ver lancamentos
- period_summary: "resumo dos ultimos X dias/semanas/meses" — use days (ex: 60 dias = days:60)
- list_transactions: "listar/mostrar/ver lancamentos" de um mes ou periodo
- Palavras-chave de correction: apagar, deletar, excluir, corrigir, alterar, mudar, ultimo lancamento
- Categorias validas: ${CATEGORIES.join(', ')}`;

export function buildTextPrompt(text: string, currentDate: string): string {
  return `Voce e um assistente financeiro. Analise a mensagem e retorne o JSON conforme o schema.

Data atual: ${currentDate}
Mensagem: "${text}"

Schema esperado:
${SCHEMA}

${RULES}`;
}

export function buildAudioPrompt(currentDate: string): string {
  return `Voce e um assistente financeiro. Transcreva o audio e retorne o JSON conforme o schema.

Data atual: ${currentDate}

Schema esperado:
${SCHEMA}

Regras adicionais para audio:
- Inclua sempre "transcribedText" com o texto exato falado no audio
${RULES}`;
}
