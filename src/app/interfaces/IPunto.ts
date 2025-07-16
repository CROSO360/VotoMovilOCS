// =======================
// Interfaz: IPunto
// Representa un punto del orden del día dentro de una sesión del OCS
// =======================

import { ISesion } from './ISesion';

export interface IPunto {
  id_punto?: number;
  sesion?: ISesion;
  nombre?: string;
  detalle?: string;
  orden?: number;
  es_administrativa?: boolean;
  n_afavor?: number;
  n_encontra?: number;
  n_abstencion?: number;
  p_afavor?: number;
  p_encontra?: number;
  p_abstencion?: number;
  resultado?: string;

  tipo?: string;

  puntoReconsiderado?: IPunto;

  requiere_voto_dirimente?: boolean;
  estado?: boolean;
  status?: boolean;
}
