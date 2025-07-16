
import { IPuntoGrupo } from './IPuntoGrupo';
import { ISesion } from './ISesion';

export interface IGrupo {
  id_grupo?: number;
  sesion?: ISesion;
  nombre?: string;
  estado?: boolean;
  status?: boolean;

  puntoGrupos?: IPuntoGrupo[];
}
