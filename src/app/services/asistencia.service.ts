// =======================
// Servicio: AsistenciaService
// Gestiona las operaciones HTTP relacionadas con asistencias de sesión
// =======================

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IAsistencia } from '../interfaces/IAsistencia';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AsistenciaService {

  private baseURL = environment.baseURL; // URL base del backend, definida en environment.ts

  constructor(private http: HttpClient) {}

  // =======================
  // Métodos GET
  // =======================

  /**
   * Obtiene todas las asistencias registradas
   */
  getAllData(): Observable<IAsistencia[]> {
    return this.http.get<IAsistencia[]>(`${this.baseURL}/asistencia/all`);
  }

  /**
   * Obtiene una asistencia por su ID
   * @param id ID de la asistencia
   */
  getDataById(id: string): Observable<IAsistencia> {
    return this.http.get<IAsistencia>(`${this.baseURL}/asistencia/find/${id}`);
  }

  /**
   * Obtiene una asistencia según parámetros de búsqueda y relaciones
   * @param query Query de búsqueda (ej: id_usuario=1)
   * @param relations Relaciones a incluir (opcional)
   */
  getDataBy(query: string, relations?: string[]): Observable<IAsistencia> {
    let url = `${this.baseURL}/asistencia/findOneBy?${query}`;

    if (relations?.length) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IAsistencia>(url);
  }

  /**
   * Obtiene todas las asistencias que cumplan con una condición
   * @param query Query de filtro
   * @param relations Relaciones a incluir (opcional)
   */
  getAllDataBy(query: string, relations?: string[]): Observable<IAsistencia[]> {
    let url = `${this.baseURL}/asistencia/findAllBy?${query}`;

    if (relations?.length) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IAsistencia[]>(url);
  }

  // =======================
  // Métodos POST (Guardar)
  // =======================

  /**
   * Guarda una asistencia individual
   * @param data Objeto IAsistencia
   */
  saveData(data: IAsistencia): Observable<IAsistencia> {
    return this.http.post<IAsistencia>(`${this.baseURL}/asistencia/save`, data);
  }

  /**
   * Guarda múltiples asistencias en una sola petición
   * @param data Arreglo de asistencias
   */
  saveManyData(data: IAsistencia[]): Observable<IAsistencia[]> {
    return this.http.post<IAsistencia[]>(`${this.baseURL}/asistencia/save/many`, data);
  }

  // =======================
  // Funciones específicas de asistencia
  // =======================

  /**
   * Elimina una asistencia por ID
   * @param id ID de la asistencia
   */
  eliminarAsistencia(id: number): Observable<any> {
    return this.http.post(`${this.baseURL}/asistencia/eliminar/${id}`, {});
  }

  /**
   * Genera la asistencia automáticamente para una sesión
   * @param id ID de la sesión
   */
  generarAsistencia(id: number): Observable<any> {
    return this.http.post(`${this.baseURL}/asistencia/generar/${id}`, {});
  }

  /**
   * Sincroniza los usuarios seleccionados para asistencia de una sesión
   * @param idSesion ID de la sesión
   * @param usuariosSeleccionados Lista de IDs de usuarios
   */
  sincronizarAsistencia(idSesion: number, usuariosSeleccionados: number[]): Observable<any> {
    return this.http.post(`${this.baseURL}/asistencia/sincronizar/${idSesion}`, {
      usuariosSeleccionados,
    });
  }
}
