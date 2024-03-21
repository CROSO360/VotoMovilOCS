import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IPunto } from '../interfaces/IPunto';

@Injectable({
  providedIn: 'root',
})

export class PuntoService {

  private baseURL = `https://api-voto-6ggs.onrender.com`;

  constructor(private http: HttpClient) {}

  getAllData(): Observable<IPunto[]> {
    return this.http.get<IPunto[]>(`${this.baseURL}/punto/all`);
  }

  getDataById(id: string): Observable<IPunto> {
    return this.http.get<IPunto>(`${this.baseURL}/punto/find/${id}`);
  }

  getDataBy(query: string, relations?: string[]): Observable<IPunto> {
    let url = `${this.baseURL}/punto/findOneBy?${query}`;

    if (relations && relations.length > 0) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IPunto>(url);
  }

  getAllDataBy(query: string, relations?: string[]): Observable<IPunto[]> {
    let url = `${this.baseURL}/punto/findAllBy?${query}`;

    if (relations && relations.length > 0) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IPunto[]>(url);
  }

  saveData(data: IPunto): Observable<IPunto> {
    return this.http.post<IPunto>(`${this.baseURL}/punto/save`, data);
  }

  deleteData(id: number): Observable<any> {
    return this.http.post(`${this.baseURL}/punto/delete/${id}`, {});
  }

  getResultados(id:number):Observable<any> {
    return this.http.get<any>(`${this.baseURL}/punto/resultado/${id}`)
  }

  registerResultados(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseURL}/punto/registrar-resultado`, data)
  }

}