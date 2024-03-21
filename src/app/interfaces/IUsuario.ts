export interface IUsuario{
    id_usuario?: number;
    nombre?: string;
    codigo?: string;
    contrasena?: string;
    cedula?: string;
    tipo?: string;
    id_grupo_usuario?: number;
    id_usuario_reemplazo?: number;
    estado?: boolean;
    status?: boolean;
}