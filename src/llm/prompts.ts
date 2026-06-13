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

export function buildTextPrompt(text: string, currentDate: string): string {
  return `Voce e um assistente financeiro inteligente. Analise a mensagem do usuario.

Data atual: ${currentDate}
Categorias disponiveis: ${CATEGORIES.join(', ')}

Mensagem do usuario: "${text}"

Retorne APENAS um JSON valido sem markdown e sem blocos de codigo:
{
  "intent": "transaction" | "query" | "correction" | "unknown",
  "transaction": {
    "type": "INCOME" | "EXPENSE",
    "amount": number,
    "category": "UMA_DAS_CATEGORIAS",
    "description": "descricao resumida",
    "transactionDate": "YYYY-MM-DD"
  },
  "query": {
    "type": "monthly_expense" | "monthly_income" | "monthly_summary" | "expense_by_category" | "income_by_period" | "expense_by_period",
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
}

Regras:
- Preencha apenas o campo correspondente ao intent, deixe os outros como null
- Se nao identificar valor em transacao, retorne intent: "unknown"
- Se nao identificar data, use: ${currentDate}
- INCOME: salario, recebi, ganhei, pix recebido, renda, entrada
- EXPENSE: gastei, paguei, comprei, custo, saida
- query: quanto, resumo, total, gasto, extrato
- correction: apagar, deletar, excluir, corrigir, alterar, mudar, ultimo lancamento`;
}

export function buildAudioPrompt(currentDate: string): string {
  return `Voce e um assistente financeiro inteligente. Transcreva e interprete o audio.

Data atual: ${currentDate}
Categorias disponiveis: ${CATEGORIES.join(', ')}

Retorne APENAS um JSON valido sem markdown e sem blocos de codigo:
{
  "intent": "transaction" | "query" | "correction" | "unknown",
  "transcribedText": "texto transcrito do audio",
  "transaction": {
    "type": "INCOME" | "EXPENSE",
    "amount": number,
    "category": "UMA_DAS_CATEGORIAS",
    "description": "descricao resumida",
    "transactionDate": "YYYY-MM-DD"
  },
  "query": {
    "type": "monthly_expense" | "monthly_income" | "monthly_summary" | "expense_by_category" | "income_by_period" | "expense_by_period",
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
}

Regras:
- Inclua sempre "transcribedText" com o que foi dito no audio
- Preencha apenas o campo correspondente ao intent, deixe os outros como null
- Se nao identificar valor em transacao, retorne intent: "unknown"
- Se nao identificar data, use: ${currentDate}`;
}
