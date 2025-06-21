import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IUsuario } from '../interfaces/IUsuario';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})

export class UsuarioService {

      private baseURL = environment.baseURL; // URL base del backend, definida en environment.ts
  

  constructor(private http: HttpClient) {}

  getAllData(): Observable<IUsuario[]> {
    return this.http.get<IUsuario[]>(`${this.baseURL}/usuario/all`);
  }

  getDataById(id: string): Observable<IUsuario> {
    return this.http.get<IUsuario>(`${this.baseURL}/usuario/find/${id}`);
  }

  getDataBy(query: string, relations?: string[]): Observable<IUsuario> {
    let url = `${this.baseURL}/usuario/findOneBy?${query}`;

    if (relations && relations.length > 0) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IUsuario>(url);
  }

  getAllDataBy(query: string, relations?: string[]): Observable<IUsuario[]> {
    let url = `${this.baseURL}/usuario/findAllBy?${query}`;

    if (relations && relations.length > 0) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IUsuario[]>(url);
  }

  saveData(data: IUsuario): Observable<IUsuario> {
    return this.http.post<IUsuario>(`${this.baseURL}/usuario/save`, data);
  }

  deleteData(id: number): Observable<any> {
    return this.http.post(`${this.baseURL}/usuario/delete/${id}`, {});
  }

}