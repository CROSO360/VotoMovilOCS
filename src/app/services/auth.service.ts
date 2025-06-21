import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})

export class AuthService {

    private baseURL = environment.baseURL; // URL base del backend, definida en environment.ts

  

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