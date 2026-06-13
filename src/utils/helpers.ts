export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    ALIMENTACAO: 'Alimentacao',
    MERCADO: 'Mercado',
    TRANSPORTE: 'Transporte',
    MORADIA: 'Moradia',
    SAUDE: 'Saude',
    LAZER: 'Lazer',
    EDUCACAO: 'Educacao',
    SALARIO: 'Salario',
    PIX_RECEBIDO: 'Pix Recebido',
    INVESTIMENTOS: 'Investimentos',
    OUTROS: 'Outros',
  };
  return labels[category] ?? category;
}

export function getTypeLabel(type: string): string {
  return type === 'INCOME' ? 'Receita' : 'Despesa';
}
