import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IGrupo } from '../interfaces/IGrupo';

@Injectable({
  providedIn: 'root',
})
export class GrupoService {
  private baseURL = environment.baseURL; // URL base del backend, definida en environment.ts

  constructor(private http: HttpClient) {}

  getAllData(): Observable<IGrupo[]> {
    return this.http.get<IGrupo[]>(`${this.baseURL}/grupo/all`);
  }

  getDataById(id: string): Observable<IGrupo> {
    return this.http.get<IGrupo>(`${this.baseURL}/grupo/find/${id}`);
  }

  getDataBy(query: string, relations?: string[]): Observable<IGrupo> {
    let url = `${this.baseURL}/grupo/findOneBy?${query}`;

    if (relations?.length) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IGrupo>(url);
  }

  getAllDataBy(query: string, relations?: string[]): Observable<IGrupo[]> {
    let url = `${this.baseURL}/grupo/findAllBy?${query}`;

    if (relations?.length) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IGrupo[]>(url);
  }

  saveData(data: IGrupo): Observable<IGrupo> {
    return this.http.post<IGrupo>(`${this.baseURL}/grupo/save`, data);
  }

  saveManyData(data: IGrupo[]): Observable<IGrupo[]> {
    return this.http.post<IGrupo[]>(`${this.baseURL}/grupo/save/many`, data);
  }

  deleteData(id: number): Observable<any> {
    return this.http.post(`${this.baseURL}/grupo/delete/${id}`, {});
  }

  agruparPuntos(data: {
    idSesion: number;
    nombre?: string;
    puntos: number[];
  }): Observable<IGrupo> {
    return this.http.post<IGrupo>(`${this.baseURL}/grupo/agrupar`, data);
  }
}
