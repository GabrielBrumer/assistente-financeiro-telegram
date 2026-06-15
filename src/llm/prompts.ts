export const CATEGORIES = [
  'ALIMENTACAO',
  'PADARIA',
  'MERCADO',
  'TRANSPORTE',
  'MORADIA',
  'SAUDE',
  'LAZER',
  'EDUCACAO',
  'SALARIO',
  'PIX_RECEBIDO',
  'SERVICOS_REALIZADOS',
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
    "days": null | number,
    "date": null | "YYYY-MM-DD"
  },
  "correction": {
    "type": "delete_last" | "update_last_category" | "update_last_amount" | "delete_by_position" | "update_by_position_category" | "update_by_position_amount",
    "category": null | "UMA_DAS_CATEGORIAS",
    "amount": null | number,
    "position": null | number
  }
}`;

const CATEGORY_GUIDE = `Guia de categorias (use a mais especifica possivel):
- ALIMENTACAO: restaurante, lanchonete, refeicao, almoco, jantar, cafe, delivery, ifood, rappi, hamburger, pizza, sushi, churrascaria, bar, bebida, cerveja
- PADARIA: padaria, pao, croissant, bolo, cafe da manha, confeitaria, doce, salgado
- MERCADO: supermercado, mercado, feira, hortifruti, atacadao, atacado, hipermercado, sacolao, acougue, peixaria, mercearia, compras do mes
- TRANSPORTE: uber, 99, taxi, combustivel, gasolina, etanol, diesel, estacionamento, pedagio, onibus, metro, trem, passagem, mecanico, revisao, pneu, ipva, seguro veiculo
- MORADIA: aluguel, condominio, agua, luz, energia, gas, internet, telefone fixo, iptu, reforma, conserto casa, faxina, diarista, mobilia
- SAUDE: farmacia, remedio, medico, consulta, exame, plano de saude, dentista, hospital, clinica, academia, suplemento
- LAZER: cinema, teatro, show, viagem, hotel, passeio, parque, jogo, streaming, netflix, spotify, presente, festa, aniversario, esporte
- EDUCACAO: escola, faculdade, curso, livro, material escolar, mensalidade, ingles, idioma, workshop, certificacao
- SALARIO: salario, pagamento, holerite, pro-labore, adiantamento salarial
- PIX_RECEBIDO: pix recebido, transferencia recebida, deposito recebido, dinheiro recebido
- SERVICOS_REALIZADOS: servico prestado, trabalho realizado, freela, freelance, consultoria, comissao recebida, honorario, venda realizada
- INVESTIMENTOS: investimento, aporte, aplication, cdb, tesouro direto, fundo, acoes, dividendos, rendimento, resgate
- OUTROS: qualquer lancamento que nao se encaixe nas categorias acima`;

const RULES = `Regras:
- Preencha apenas o campo correspondente ao intent; os demais devem ser null
- Se nao identificar valor em transacao, use intent: "unknown"
- Se nao identificar data em transacao, use a data atual informada
- INCOME: salario, recebi, ganhei, pix recebido, renda, entrada, servico prestado
- EXPENSE: gastei, paguei, comprei, custo, saida
- Palavras-chave de query: quanto, resumo, total, extrato, historico, listar, mostrar, ver lancamentos
- period_summary: "resumo dos ultimos X dias/semanas/meses" — use days (ex: 60 dias = days:60)
- list_transactions com date: "listar lancamentos de hoje", "ver do dia 10/06", "mostrar ontem" — calcule a data exata e use date:"YYYY-MM-DD"
- list_transactions com days: "listar dos ultimos X dias" — use days
- list_transactions com month/year: "listar lancamentos de junho" — use month/year
- Palavras-chave de correction: apagar, deletar, excluir, corrigir, alterar, mudar, ultimo lancamento
- delete_by_position: "apagar o 1", "deletar lancamento 2" — use position (numero 1-based da lista)
- update_by_position_amount: "alterar valor do 2 para 45", "corrigir valor do lancamento 3 para 100" — use position + amount
- update_by_position_category: "corrigir categoria do 1 para mercado", "mudar categoria do 2" — use position + category

${CATEGORY_GUIDE}`;

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
