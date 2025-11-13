import { IGrupoUsuario } from "./IGrupoUsuario";

export interface IUsuario{
    id_usuario?: number;
    nombre?: string;
    codigo?: string;
    cedula?: string;
    celular?: string;
    contrasena?: string;
    tipo?: string;
    grupoUsuario?: IGrupoUsuario;
    usuarioReemplazo?: IUsuario;
    estado?: boolean;
    status?: boolean;
}