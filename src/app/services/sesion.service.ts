import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ISesion } from '../interfaces/ISesion';

@Injectable({
  providedIn: 'root',
})

export class SesionService {

  private baseURL = `http://localhost:3000`;

  constructor(private http: HttpClient) {}

  getAllData(): Observable<ISesion[]> {
    return this.http.get<ISesion[]>(`${this.baseURL}/sesion/all`);
  }

  getDataById(id: string): Observable<ISesion> {
    return this.http.get<ISesion>(`${this.baseURL}/sesion/find/${id}`);
  }

  getDataBy(query: string, relations?: string[]): Observable<ISesion> {
    let url = `${this.baseURL}/sesion/findOneBy?${query}`;

    if (relations && relations.length > 0) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<ISesion>(url);
  }

  getAllDataBy(query: string, relations?: string[]): Observable<ISesion[]> {
    let url = `${this.baseURL}/sesion/findAllBy?${query}`;

    if (relations && relations.length > 0) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<ISesion[]>(url);
  }

  saveData(data: ISesion): Observable<ISesion> {
    return this.http.post<ISesion>(`${this.baseURL}/sesion/save`, data);
  }

  deleteData(id: number): Observable<any> {
    return this.http.post(`${this.baseURL}/sesion/delete/${id}`, {});
  }

}