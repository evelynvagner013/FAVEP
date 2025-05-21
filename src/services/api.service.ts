import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../Models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:5050';
  constructor(private http: HttpClient) {}

   register(user: User): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, user);
  }


 
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, { email, password });
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
