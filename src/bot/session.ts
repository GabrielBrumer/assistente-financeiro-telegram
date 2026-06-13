// Sessao em memoria: guarda a ultima lista exibida por usuario
// para permitir edicoes por posicao ("apagar o 2", "alterar valor do 3 para 45")
const lastList = new Map<string, string[]>();

export function storeList(userId: string, transactionIds: string[]): void {
  lastList.set(userId, transactionIds);
}

export function getStoredList(userId: string): string[] {
  return lastList.get(userId) ?? [];
}
