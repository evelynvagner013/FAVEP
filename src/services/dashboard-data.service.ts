import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Importa todos os serviços necessários
import { UsuarioService } from './usuario.service';
import { PropriedadeService } from './propriedade.service';
import { ProducaoService } from './producao.service';
import { MovimentacaoService } from './movimentacao.service';

// Importa todas as interfaces necessárias
import { Usuario, Propriedade, Producao, Movimentacao } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class DashboardDataService {

  constructor(
    private usuarioService: UsuarioService,
    private propriedadeService: PropriedadeService,
    private producaoService: ProducaoService,
    private movimentacaoService: MovimentacaoService
  ) { }

  carregarDadosDashboard(): Observable<{
    perfil: Usuario | null;
    propriedades: Propriedade[];
    producoes: Producao[];
    movimentacoes: Movimentacao[];
  }> {
    return forkJoin({
      perfil: this.usuarioService.getPerfilUsuario(),
      propriedades: this.propriedadeService.getPropriedades(),
      producoes: this.producaoService.getProducoes(),
      movimentacoes: this.movimentacaoService.getMovimentacoes()
    }).pipe(
      catchError(error => {
        console.error('Erro ao carregar dados consolidados do dashboard:', error);
        return of({
          perfil: null,
          propriedades: [],
          producoes: [],
          movimentacoes: []
        });
      })
    );
  }
}