// =======================
// Servicio: MiembroService
// Gestiona los miembros del Órgano Colegiado Superior (OCS)
// =======================

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IMiembro } from '../interfaces/IMiembro';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MiembroService {

  private baseURL = environment.baseURL; // URL base del backend, definida en environment.ts

  constructor(private http: HttpClient) {}

  // =======================
  // Métodos GET
  // =======================

  /**
   * Obtiene todos los miembros registrados
   */
  getAllData(): Observable<IMiembro[]> {
    return this.http.get<IMiembro[]>(`${this.baseURL}/miembro/all`);
  }

  /**
   * Obtiene un miembro por su ID
   * @param id ID del miembro
   */
  getDataById(id: string): Observable<IMiembro> {
    return this.http.get<IMiembro>(`${this.baseURL}/miembro/find/${id}`);
  }

  /**
   * Busca un miembro por filtros y relaciones opcionales
   * @param query Filtro de búsqueda
   * @param relations Relaciones adicionales a incluir (opcional)
   */
  getDataBy(query: string, relations?: string[]): Observable<IMiembro> {
    let url = `${this.baseURL}/miembro/findOneBy?${query}`;

    if (relations?.length) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IMiembro>(url);
  }

  /**
   * Obtiene múltiples miembros según un criterio de búsqueda
   * @param query Filtro aplicado
   * @param relations Relaciones a incluir (opcional)
   */
  getAllDataBy(query: string, relations?: string[]): Observable<IMiembro[]> {
    let url = `${this.baseURL}/miembro/findAllBy?${query}`;

    if (relations?.length) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IMiembro[]>(url);
  }

  // =======================
  // Métodos POST
  // =======================

  /**
   * Guarda o actualiza un miembro del OCS
   * @param data Objeto IMiembro con los datos del usuario
   */
  saveData(data: IMiembro): Observable<IMiembro> {
    return this.http.post<IMiembro>(`${this.baseURL}/miembro/save`, data);
  }

  /**
   * Elimina un miembro del OCS por su ID
   * @param id ID del miembro a eliminar
   */
  deleteData(id: number): Observable<any> {
    return this.http.post(`${this.baseURL}/miembro/delete/${id}`, {});
  }

  getMiembrosYReemplazos(): Observable<any> {
    return this.http.get(`${this.baseURL}/miembro/miembros-reemplazos`);
  }
}
