import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class AuthService {

  private baseURL = `https://api-voto-6ggs.onrender.com`;

  constructor(private http: HttpClient) {}

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.baseURL}/auth/login`, credentials)
  }

  voterLogin(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.baseURL}/auth/voter-login`, credentials)
  }

}