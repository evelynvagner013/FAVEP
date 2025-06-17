export interface Propriedade {
  id: string;
  nomepropriedade: string;
  area_ha: number;
  localizacao: string;
  usuarioId: string;
  culturas: string[];
  usuario?: any; // O objeto do usuário também é retornado
}
