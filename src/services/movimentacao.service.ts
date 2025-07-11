import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Movimentacao } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class MovimentacaoService {
  private baseUrl = 'http://localhost:5050/finance';

  constructor(private http: HttpClient) { }

 getMovimentacoes(): Observable<Movimentacao[]> {
     return this.http.get<Movimentacao[]>(`${this.baseUrl}/finance`).pipe(
       catchError(error => {
         console.error('Erro ao buscar movimentações:', error);
         return of([]);
       })
     );
   }
 
   adicionarMovimentacao(mov: Omit<Movimentacao, 'id'>): Observable<Movimentacao> {
     return this.http.post<Movimentacao>(`${this.baseUrl}/finance`, mov);
   }
 
   atualizarMovimentacao(id: string, mov: Partial<Movimentacao>): Observable<Movimentacao> {
     return this.http.put<Movimentacao>(`${this.baseUrl}/finance/${id}`, mov);
   }
 
   excluirMovimentacao(id: string): Observable<any> {
     return this.http.delete(`${this.baseUrl}/finance/${id}`);
   }
}