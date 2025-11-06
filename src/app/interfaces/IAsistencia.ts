// =======================
// Interfaz: IAsistencia
// Define la estructura de una asistencia registrada en una sesión
// =======================

import { ISesion } from './ISesion';
import { IUsuario } from './IUsuario';

export interface IAsistencia {
  /**
   * Identificador único de la asistencia
   */
  id_asistencia?: number;

  /**
   * Sesión a la que pertenece la asistencia
   */
  sesion?: ISesion;

  /**
   * Usuario registrado en la asistencia
   */
  usuario?: IUsuario;

  /**
   * Tipo de asistencia: 'presente', 'remoto' o 'ausente'
   */
  tipo_asistencia?: string;

  /**
   * Indica si es la asistencia principal del usuario en la sesión
   */
  es_principal?: boolean;

  /**
   * Indica si la asistencia está activa (lógica de negocio)
   */
  estado?: boolean;

  /**
   * Marca general de estado en la base de datos
   */
  status?: boolean;
}
