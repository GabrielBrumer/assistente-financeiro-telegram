# Assistente Financeiro Telegram

Bot de controle financeiro pessoal via Telegram, com interpretação de linguagem natural (texto e áudio) usando Gemini, persistência em PostgreSQL via Prisma e TypeScript.

## Stack

- **Runtime**: Node.js + TypeScript
- **Bot**: Telegraf (Telegram Bot API)
- **LLM**: Google Gemini (`@google/generative-ai`)
- **ORM**: Prisma com PostgreSQL
- **Build**: `tsc` → `dist/`

## Setup

```bash
cp .env.example .env
# Preencher: DATABASE_URL, TELEGRAM_BOT_TOKEN, GEMINI_API_KEY

npm install
npm run prisma:generate
npm run prisma:migrate     # produção
# ou
npm run prisma:migrate:dev # desenvolvimento

npm run dev    # ts-node direto
npm run build  # compila para dist/
npm start      # roda dist/
```

## Variáveis de ambiente

| Variável             | Descrição                            |
|----------------------|--------------------------------------|
| `DATABASE_URL`       | Connection string PostgreSQL         |
| `TELEGRAM_BOT_TOKEN` | Token do bot (BotFather)             |
| `GEMINI_API_KEY`     | Chave da API Google Gemini           |

## Estrutura

```
src/
├── index.ts                  # Entrypoint — inicia o bot
├── bot/
│   ├── index.ts              # Cria instância Telegraf e registra handlers
│   ├── session.ts            # Gerenciamento de sessão
│   └── handlers/
│       ├── index.ts          # Registra todos os handlers no bot
│       ├── message.ts        # Handler de mensagens de texto
│       ├── audio.ts          # Handler de voz/áudio
│       ├── commands.ts       # /resumo, /categorias, /minhaconta
│       ├── start.ts          # /start
│       ├── help.ts           # /help
│       └── shared.ts         # Utilitários compartilhados entre handlers
├── llm/
│   ├── gemini.ts             # Integração com Google Gemini
│   └── prompts.ts            # Prompts para texto e áudio + tipos
├── services/
│   ├── transactionService.ts # CRUD de transações (criar, apagar, corrigir)
│   ├── queryService.ts       # Consultas e relatórios (resumo, extrato, etc.)
│   └── userService.ts        # Criação/busca de usuário por Telegram ID
├── repositories/
│   ├── transactionRepository.ts # Queries Prisma para Transaction
│   └── userRepository.ts        # Queries Prisma para User
└── utils/
    ├── currency.ts           # Formatação de valores monetários
    ├── date.ts               # Utilitários de data
    └── helpers.ts            # Labels de categoria e outros helpers
prisma/
└── schema.prisma             # Modelos: User, Transaction, enums
```

## Modelos de dados

### User
| Campo           | Tipo     | Descrição                  |
|-----------------|----------|----------------------------|
| `id`            | String   | CUID (PK)                  |
| `telegramUserId`| String   | ID único do Telegram       |
| `name`          | String?  | Primeiro nome              |
| `username`      | String?  | @username do Telegram      |
| `createdAt`     | DateTime | Data de cadastro           |

### Transaction
| Campo             | Tipo            | Descrição                        |
|-------------------|-----------------|----------------------------------|
| `id`              | String          | CUID (PK)                        |
| `userId`          | String          | FK → User                        |
| `type`            | TransactionType | `INCOME` ou `EXPENSE`            |
| `amount`          | Decimal(10,2)   | Valor                            |
| `category`        | Category        | Enum de categorias               |
| `description`     | String?         | Descrição resumida               |
| `originalText`    | String?         | Texto original enviado pelo user |
| `transactionDate` | DateTime        | Data da transação                |

### Categorias disponíveis
`ALIMENTACAO` · `PADARIA` · `MERCADO` · `TRANSPORTE` · `MORADIA` · `SAUDE` · `LAZER` · `EDUCACAO` · `SALARIO` · `PIX_RECEBIDO` · `SERVICOS_REALIZADOS` · `INVESTIMENTOS` · `OUTROS`

## Fluxo principal

```
Usuário (Telegram)
  │
  ├─ Texto → handleTextMessage → Gemini (buildTextPrompt) → JSON intent
  └─ Voz/Áudio → handleVoiceAudio → Gemini (buildAudioPrompt) → JSON intent
                                                                      │
                              ┌───────────────────────────────────────┘
                              ▼
                    intent: "transaction" → transactionService.saveTransaction()
                    intent: "query"       → queryService.processQuery()
                    intent: "correction"  → transactionService.delete/update...()
                    intent: "unknown"     → resposta de fallback
```

## Comandos do bot

| Comando        | Descrição                                  |
|----------------|--------------------------------------------|
| `/start`       | Boas-vindas e cadastro automático          |
| `/help`        | Lista de comandos e exemplos de uso        |
| `/resumo`      | Resumo financeiro do mês atual             |
| `/categorias`  | Lista todas as categorias disponíveis      |
| `/minhaconta`  | Dados da conta do usuário                  |

## Intents reconhecidos pelo Gemini

- **transaction** — registra receita ou despesa
- **query** — consultas: `monthly_summary`, `monthly_expense`, `monthly_income`, `expense_by_category`, `expense_by_period`, `income_by_period`, `period_summary`, `list_transactions`
- **correction** — correções: `delete_last`, `update_last_category`, `update_last_amount`, `delete_by_position`, `update_by_position_category`, `update_by_position_amount`
- **unknown** — mensagem não reconhecida

## Convenções

- Todo acesso ao banco passa pelos `repositories/`; os `services/` orquestram a lógica de negócio.
- Usuários são criados automaticamente no primeiro contato (`getOrCreateUser`).
- Datas de transação são armazenadas com hora zerada no fuso local (`new Date(y, mo-1, d, 0,0,0,0)`).
- Respostas ao Telegram usam `parse_mode: 'Markdown'`.
