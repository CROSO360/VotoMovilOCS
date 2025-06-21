import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IGrupoUsuario } from '../interfaces/IGrupoUsuario';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})

export class GrupoUsuarioService {

    private baseURL = environment.baseURL; // URL base del backend, definida en environment.ts


  constructor(private http: HttpClient) {}

  getAllData(): Observable<IGrupoUsuario[]> {
    return this.http.get<IGrupoUsuario[]>(`${this.baseURL}/grupo-usuario/all`);
  }

  getDataById(id: string): Observable<IGrupoUsuario> {
    return this.http.get<IGrupoUsuario>(`${this.baseURL}/grupo-usuario/find/${id}`);
  }

  getDataBy(query: string, relations?: string[]): Observable<IGrupoUsuario> {
    let url = `${this.baseURL}/grupo-usuario/findOneBy?${query}`;

    if (relations && relations.length > 0) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IGrupoUsuario>(url);
  }

  getAllDataBy(query: string, relations?: string[]): Observable<IGrupoUsuario[]> {
    let url = `${this.baseURL}/grupo-usuario/findAllBy?${query}`;

    if (relations && relations.length > 0) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IGrupoUsuario[]>(url);
  }

  saveData(data: IGrupoUsuario): Observable<IGrupoUsuario> {
    return this.http.post<IGrupoUsuario>(`${this.baseURL}/grupo-usuario/save`, data);
  }

  deleteData(id: number): Observable<any> {
    return this.http.post(`${this.baseURL}/grupo-usuario/delete/${id}`, {});
  }

}