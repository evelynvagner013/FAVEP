import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../Models/user.model';
import { Propriedade } from '../Models/propertie.model' // O nome do modelo é User, mas o back-end espera 'nome' e não 'username'

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:5050'; //
  constructor(private http: HttpClient) {}

   // ✅ CORRIGIDO: Adicionado '/auth' ao endpoint
   register(user: any): Observable<any> { // Mudado para 'any' para flexibilidade no passo 3
    return this.http.post(`${this.baseUrl}/auth/register`, user);
  }


  // ✅ CORRIGIDO: Adicionado '/auth' e mudado 'password' para 'senha'
  login(email: string, password: string): Observable<any> {
    // O back-end espera { email, senha }
    return this.http.post(`${this.baseUrl}/auth/login`, { email, senha: password });
  }

  setUser(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser() {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }

  logout(): void {
    localStorage.removeItem('user');
  }
}
