import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Usuario } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authUrl = 'http://localhost:5050/auth';
  private isBrowser: boolean;

  // --- MELHORIA DE ESTADO ---
  // BehaviorSubject para armazenar o usuário atual.
  private currentUserSubject: BehaviorSubject<Usuario | null>;
  public currentUser: Observable<Usuario | null>;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    // Inicializa o BehaviorSubject com o usuário do localStorage
    this.currentUserSubject = new BehaviorSubject<Usuario | null>(this.getUser());
    this.currentUser = this.currentUserSubject.asObservable();
  }

  // Método público para obter o valor atual do usuário
  public get currentUserValue(): Usuario | null {
    return this.currentUserSubject.value;
  }

  register(dadosUsuario: any): Observable<any> {
    return this.http.post(`${this.authUrl}/register`, dadosUsuario);
  }

  login(email: string, senha: string): Observable<any> {
    return this.http.post<{ token: string; user: Usuario }>(`${this.authUrl}/login`, { email, senha }).pipe(
      tap(response => { // Usamos 'tap' para executar uma ação sem modificar a resposta
        if (response.token && response.user) {
          this.setToken(response.token);
          this.setUser(response.user);
          // Notifica todos os 'escutadores' que um novo usuário logou
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      // Notifica todos os 'escutadores' que o usuário fez logout
      this.currentUserSubject.next(null);
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // Métodos de localStorage (privados ou públicos conforme necessidade)
  setToken(token: string): void {
    if (this.isBrowser) localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return this.isBrowser ? localStorage.getItem('token') : null;
  }

  setUser(usuario: Usuario): void {
    if (this.isBrowser) localStorage.setItem('user', JSON.stringify(usuario));
  }

  getUser(): Usuario | null {
    if (this.isBrowser) {
      const json = localStorage.getItem('user');
      return json ? JSON.parse(json) : null;
    }
    return null;
  }
}