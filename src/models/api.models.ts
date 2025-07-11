// ====================================================================
// Interfaces com nomes e campos em português (DA SUA API)
// ====================================================================

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  fotoPerfil?: string;
  senha: string;
}

export interface Propriedade {
  id: string;
  nome: string;
  localizacao: string;
  area: number;
  proprietario: string;
}

export interface Producao {
  id: number;
  propriedadeId: number;
  cultura: string;
  safra: string;
  quantidade: number;
  area: number;
  data: Date;
}


export interface Movimentacao {
  id: number;
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  data: Date; // Na API, 'data' é Date para Movimentacao
  propriedade?: string;
  categoria?: string;
}