export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    ALIMENTACAO: 'Alimentacao',
    PADARIA: 'Padaria',
    MERCADO: 'Mercado',
    TRANSPORTE: 'Transporte',
    MORADIA: 'Moradia',
    SAUDE: 'Saude',
    LAZER: 'Lazer',
    EDUCACAO: 'Educacao',
    SALARIO: 'Salario',
    PIX_RECEBIDO: 'Pix Recebido',
    SERVICOS_REALIZADOS: 'Servicos Realizados',
    INVESTIMENTOS: 'Investimentos',
    OUTROS: 'Outros',
  };
  return labels[category] ?? category;
}

export function getTypeLabel(type: string): string {
  return type === 'INCOME' ? 'Receita' : 'Despesa';
}
