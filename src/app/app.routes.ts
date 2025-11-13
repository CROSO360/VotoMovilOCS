import { Routes } from '@angular/router';
import { InicioSesionComponent } from './inicio-sesion/inicio-sesion.component';
import { VotoComponent } from './voto/voto.component';
import { userGuardGuard } from './user-guard.guard';
import { VotoReemplazoComponent } from './voto-reemplazo/voto-reemplazo.component';
import { FormularioComponent } from './formulario/formulario.component';

export const routes: Routes = [
    {
        path:'',
        redirectTo:'voto',
        pathMatch:'full'
    },
    {
        path:'formulario-acceso',
        title:'OCS - Formulario de acceso',
        component: FormularioComponent
    },
    {
        path:'login',
        title:'OCS - Inicio de sesión',
        component: InicioSesionComponent
    },
    {
        path:'voto',
        title:'OCS - Voto',
        component: VotoComponent,
        canActivate:[userGuardGuard]
    },
    {
        path: 'voto/reemplazo',
        title: 'OCS - Voto',
        component: VotoReemplazoComponent,
        canActivate: [userGuardGuard]
    }
];
