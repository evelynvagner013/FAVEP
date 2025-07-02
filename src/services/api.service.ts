import { Injectable, Inject, PLATFORM_ID } from '@angular/core'; 
import { isPlatformBrowser } from '@angular/common'; 
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// ====================================================================
// Interfaces para os dados do Backend (Baseadas nos seus modelos)
// ====================================================================

export interface UserProfile {
  _id: string;
  username: string; 
  email: string;
  telefone?: string;
  fotoUrl?: string;
  plano?: string;
  dataAssinatura?: string;
  dataValidade?: string;
}

export interface Property {
  _id: string;
  name: string;
  location: string;
  area: number; 
  owner: string; 
}

export interface Crop {
  _id: string;
  name: string;
  type: string;
  plantingDate: string; 
  harvestDate?: string; 
  expectedYield?: number; 
  actualYield?: number; 
  property: string; 
  owner: string; 
}

export interface Atividade {
  _id: string;
  description: string;
  date: string; 
  type: string;
  property?: string;
  owner: string;
  icone?: string; 
}

export interface FinancialRecord {
  _id: string;
  type: 'revenue' | 'expense';
  amount: number;
  date: string;
  description?: string;
  property?: string;
  owner: string;
}



@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = 'http://localhost:5050/api'; 
  private isBrowser: boolean; 

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object 
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  isLoggedIn(): boolean {
    return this.isBrowser ? !!this.getToken() : false; 
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl.replace('/api', '')}/auth/register`, userData);
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl.replace('/api', '')}/auth/login`, { email, password }).pipe(
      map((response: any) => {
        if (response.token && response.user) {
          this.setToken(response.token);
          this.setUser(response.user);
        }
        return response;
      })
    );
  }

  setToken(token: string): void {
    if (this.isBrowser) { 
      localStorage.setItem('token', token);
    }
  }

  getToken(): string | null {
    if (this.isBrowser) { 
      return localStorage.getItem('token');
    }
    return null; 
  }

  setUser(user: UserProfile): void {
    if (this.isBrowser) { 
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  getUser(): UserProfile | null {
    if (this.isBrowser) { 
      const userJson = localStorage.getItem('user');
      return userJson ? JSON.parse(userJson) : null;
    }
    return null; 
  }

  logout(): void {
    if (this.isBrowser) { 
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }

  // ====================================================================
  // Métodos para buscar dados do Dashboard e Perfil
  // ====================================================================

  /**
   * Obtém o perfil do usuário logado do backend.
   * Endpoint: GET /api/users/me
   */
  getUserProfile(): Observable<UserProfile | null> {
    return this.http.get<UserProfile>(`${this.baseUrl}/users/me`).pipe(
      catchError(error => {
        console.error('Erro ao buscar perfil do usuário:', error);
        return of(null);
      })
    );
  }

  /**
   * Atualiza o perfil do usuário no backend.
   * @param userId O ID do usuário (pode ser obtido do UserProfile ou do token).
   * @param userData Os dados parciais do usuário a serem atualizados.
   * Endpoint: PUT /api/users/:id
   */
  updateUserProfile(userId: string, userData: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.baseUrl}/users/${userId}`, userData).pipe(
      catchError(error => {
        console.error('Erro ao atualizar perfil do usuário:', error);
        throw error; 
      })
    );
  }

  /**
   * Carrega todos os dados para o dashboard e gerenciamento em paralelo.
   */
  getAllDashboardData(): Observable<{
    userProfile: UserProfile | null;
    properties: Property[];
    crops: Crop[];
    activities: Atividade[];
    financialRecords: FinancialRecord[];
  }> {
    return forkJoin({
      userProfile: this.getUserProfile(),
      properties: this.getProperties(),
      crops: this.getCrops(),
      activities: this.getActivities(),
      financialRecords: this.getFinancialRecords()
    }).pipe(
      catchError(error => {
        console.error('Erro em getAllDashboardData:', error);
        return of({
          userProfile: null,
          properties: [],
          crops: [],
          activities: [],
          financialRecords: []
        });
      })
    );
  }

  // ====================================================================
  // Métodos de CRUD para Gerenciamento
  // ====================================================================

  // --- Propriedades ---
  getProperties(): Observable<Property[]> {
    return this.http.get<Property[]>(`${this.baseUrl}/properties`).pipe(
      catchError(error => {
        console.error('Erro ao buscar propriedades:', error);
        return of([]);
      })
    );
  }

  addProperty(property: Omit<Property, '_id' | 'owner'>): Observable<Property> {
    return this.http.post<Property>(`${this.baseUrl}/properties`, property);
  }

  updateProperty(id: string, property: Partial<Property>): Observable<Property> {
    return this.http.put<Property>(`${this.baseUrl}/properties/${id}`, property);
  }

  deleteProperty(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/properties/${id}`);
  }

  // --- Culturas ---
  getCrops(): Observable<Crop[]> {
    return this.http.get<Crop[]>(`${this.baseUrl}/crops`).pipe(
      catchError(error => {
        console.error('Erro ao buscar culturas:', error);
        return of([]);
      })
    );
  }

  addCrop(crop: Omit<Crop, '_id' | 'owner'>): Observable<Crop> {
    return this.http.post<Crop>(`${this.baseUrl}/crops`, crop);
  }

  updateCrop(id: string, crop: Partial<Crop>): Observable<Crop> {
    return this.http.put<Crop>(`${this.baseUrl}/crops/${id}`, crop);
  }

  deleteCrop(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/crops/${id}`);
  }

  // --- Atividades ---
  getActivities(): Observable<Atividade[]> {
    return this.http.get<Atividade[]>(`${this.baseUrl}/activities`).pipe(
      catchError(error => {
        console.error('Erro ao buscar atividades:', error);
        return of([]);
      })
    );
  }

  addActivity(activity: Omit<Atividade, '_id' | 'owner' | 'icone'>): Observable<Atividade> {
    return this.http.post<Atividade>(`${this.baseUrl}/activities`, activity);
  }

  updateActivity(id: string, activity: Partial<Omit<Atividade, 'icone'>>): Observable<Atividade> {
    return this.http.put<Atividade>(`${this.baseUrl}/activities/${id}`, activity);
  }

  deleteActivity(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/activities/${id}`);
  }

  // --- Registros Financeiros ---
  getFinancialRecords(): Observable<FinancialRecord[]> {
    return this.http.get<FinancialRecord[]>(`${this.baseUrl}/financial`).pipe(
      catchError(error => {
        console.error('Erro ao buscar registros financeiros:', error);
        return of([]);
      })
    );
  }

  addFinancialRecord(record: Omit<FinancialRecord, '_id' | 'owner'>): Observable<FinancialRecord> {
    return this.http.post<FinancialRecord>(`${this.baseUrl}/financial`, record);
  }

  updateFinancialRecord(id: string, record: Partial<FinancialRecord>): Observable<FinancialRecord> {
    return this.http.put<FinancialRecord>(`${this.baseUrl}/financial/${id}`, record);
  }

  deleteFinancialRecord(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/financial/${id}`);
  }
}