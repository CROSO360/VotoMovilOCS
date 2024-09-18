import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class AuthService {

  private baseURL = `http://localhost:3000`;

  constructor(private http: HttpClient) {}

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.baseURL}/auth/login`, credentials)
  }

  voterLogin(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.baseURL}/auth/voter-login`, credentials)
  }

  voterReemplazoLogin(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.baseURL}/auth/voter-reemplazo-login`, credentials)
  }

}