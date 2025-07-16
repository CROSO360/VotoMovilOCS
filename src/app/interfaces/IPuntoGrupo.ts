import { IGrupo } from './IGrupo';
import { IPunto } from './IPunto';

export interface IPuntoGrupo {
  id_punto_grupo?: number;
  grupo?: IGrupo;
  punto?: IPunto;
  estado?: boolean;
  status?: boolean;
}
