// =======================
// Interfaz: IMiembro
// Representa a un miembro oficial del Órgano Colegiado Superior (OCS)
// =======================

import { IUsuario } from './IUsuario';

export interface IMiembro {
  /**
   * Identificador único del miembro
   */
  id_miembro?: number;

  /**
   * Usuario vinculado como miembro del OCS
   */
  usuario?: IUsuario;

  /**
   * Indica si el miembro está activo (según lógica de negocio)
   */
  estado?: boolean;

  /**
   * Estado general del registro en la base de datos
   */
  status?: boolean;
}
