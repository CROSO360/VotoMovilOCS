import { IPunto } from "./IPunto";
import { IUsuario } from "./IUsuario";

export interface IPuntoUsuario{
    /**
   * Identificador único del voto registrado
   */
  id_punto_usuario?: number;

  /**
   * Punto al que pertenece el voto
   */
  punto?: IPunto;

  /**
   * Usuario relacionado al voto (puede ser el titular o un reemplazo)
   */
  usuario?: IUsuario;

  /**
   * Opción seleccionada: 'afavor', 'encontra', 'abstencion' o null
   */
  opcion?: string;

  /**
   * Indica si el voto es razonado (explicado por el usuario)
   */
  es_razonado?: boolean;

  /**
   * Usuario que efectivamente realizó el voto (puede ser diferente de `usuario` si es un reemplazo)
   */
  votante?: IUsuario;

  /**
   * Indica si este usuario actuó como principal (true) o como reemplazo (false)
   */
  es_principal?: boolean;

  /**
   * Fecha y hora en la que se registró el voto
   */
  fecha?: Date;

  /**
   * Indica si el registro está activo (según lógica de negocio)
   */
  estado?: boolean;

  /**
   * Estado general del registro en la base de datos
   */
  status?: boolean;
}