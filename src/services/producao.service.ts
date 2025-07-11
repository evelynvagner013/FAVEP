import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Producao } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class ProducaoService {
  private baseUrl = 'http://localhost:5050/production';

  constructor(private http: HttpClient) { }

  getProducoes(): Observable<Producao[]> {
      return this.http.get<Producao[]>(`${this.baseUrl}/production`).pipe(
        catchError(error => {
          console.error('Erro ao buscar produções:', error);
          return of([]);
        })
      );
    }
  
    adicionarProducao(prod: Omit<Producao, 'id'>): Observable<Producao> {
      return this.http.post<Producao>(`${this.baseUrl}/production`, prod);
    }
  
    atualizarProducao(id: string, prod: Partial<Producao>): Observable<Producao> {
      return this.http.put<Producao>(`${this.baseUrl}/production/${id}`, prod);
    }
  
    excluirProducao(id: string): Observable<any> {
      return this.http.delete(`${this.baseUrl}/production/${id}`);
    }
  
}