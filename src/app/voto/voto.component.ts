import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { BarraSuperiorComponent } from '../barra-superior/barra-superior.component';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { PuntoService } from '../services/punto.service';
import { IPunto } from '../interfaces/IPunto';
import { SesionService } from '../services/sesion.service';
import { PuntoUsuarioService } from '../services/puntoUsuario.service';
import { ToastrService } from 'ngx-toastr';
import { GrupoService } from '../services/grupo.service';
import { IGrupo } from '../interfaces/IGrupo';

@Component({
  selector: 'app-voto',
  standalone: true,
  imports: [
    BarraSuperiorComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './voto.component.html',
  styleUrl: './voto.component.css',
})
export class VotoComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private cookieService: CookieService,
    private authService: AuthService,
    private router: Router,
    private puntoService: PuntoService,
    private sesionService: SesionService,
    private puntoUsuatioService: PuntoUsuarioService,
    private toastr: ToastrService,
    private grupoService: GrupoService
  ) {}

  puntos: any[] = [];

  puntosSeleccionados: any[] = [];

  puntoUsuarios: any[] = [];

  idSesion: number | null = 0;

  payload: any = jwtDecode(this.cookieService.get('token'));

  errorMessage = '';

  confirmationMessage = '';

  pointErrorMessage = '';

  showOptions = false;

  allPuntosSelected = false;

  grupos: IGrupo[] = [];

  votoForm = new FormGroup({
    codigo: new FormControl('', Validators.required),
    opcion: new FormControl('', Validators.required),
    razonado: new FormControl(''),
  });

  ngOnInit(): void {
    this.payload = jwtDecode(this.cookieService.get('token'));
    this.getPuntoUsuario();
    //this.getGruposDeSesion();
  }

  /*getPuntos(){
    const query = `sesion.id_sesion=${this.idSesion}`;
    const relations = [`sesion`]
    this.puntoService.getAllDataBy(query, relations).subscribe((data) =>{
      this.puntos = data
      console.log(data);
    });
    
    
  }*/

  getPuntoUsuario() {
    const query = `usuario.id_usuario=${this.payload.id}&estado=1`;
    const relations = [`punto`,`usuario.grupoUsuario`];

    this.puntoUsuatioService.getAllDataBy(query, relations).subscribe((e) => {
      this.puntoUsuarios = e;
    });
  }

  getSesionYPuntos() {
    this.idSesion = 0;
    this.puntos = [];
    this.puntosSeleccionados = [];
    this.errorMessage = '';
    this.confirmationMessage = '';

    const codigo = this.votoForm.get('codigo')?.value;
    console.log('Código de Sesión:', codigo);

    const query = `codigo=${codigo}&estado=1`;

    this.sesionService.getDataBy(query).subscribe(
      (data) => {
        if (data && data.id_sesion) {
          this.idSesion = data.id_sesion;

          const queryPuntos = `sesion.id_sesion=${this.idSesion}&estado=1`;
          const relationsPuntos = ['sesion'];

          this.puntoService
            .getAllDataBy(queryPuntos, relationsPuntos)
            .subscribe((puntosDisponibles) => {
              // Filtrar puntos asignados al usuario (es_principal)
              const puntosFiltrados = puntosDisponibles.filter((p) =>
                this.puedeVerPunto(p)
              );

              // Adaptar puntos
              const puntosAdaptados = puntosFiltrados.map((p) => ({
                ...p,
                tipo: 'punto',
                raw: p,
              }));

              this.puntos = puntosAdaptados;

              // Luego de cargar puntos, cargar grupos
              const queryGrupos = `sesion.id_sesion=${this.idSesion}&estado=1`;
              const relationsGrupos = ['puntoGrupos', 'puntoGrupos.punto'];

              this.grupoService
                .getAllDataBy(queryGrupos, relationsGrupos)
                .subscribe({
                  next: (data) => {
                    this.grupos = data;

                    const gruposFiltrados = this.grupos.filter((grupo) =>
                      grupo.puntoGrupos?.every((pg) =>
                        this.puntoUsuarios.some(
                          (pu) =>
                            pu.punto?.id_punto === pg.punto?.id_punto &&
                            pu.es_principal === true
                        )
                      )
                    );

                    const gruposAdaptados = gruposFiltrados.map((grupo) => ({
                      id_punto: `grupo-${grupo.id_grupo}`,
                      nombre: `(Grupo) ${grupo.nombre}`,
                      tipo: 'grupo',
                      raw: grupo,
                    }));

                    this.puntos = [...this.puntos, ...gruposAdaptados];

                    this.confirmationMessage = 'Código de sesión válido.';

                    /*this.puntosSeleccionados = [
                      ...this.puntosSeleccionados,
                      ...gruposAdaptados,
                    ];
                    this.allPuntosSelected = true;*/
                  },
                  error: () => {
                    this.toastr.error('Error al cargar los grupos', 'Error');
                  },
                });
            });
        } else {
          this.errorMessage = 'El código de sesión es inválido.';
        }
      },
      (error) => {
        console.log('error: ', error);
        this.errorMessage =
          error.status === 401
            ? 'Credenciales incorrectas'
            : 'Se produjo un error. Por favor, inténtalo de nuevo.';
      }
    );
  }

  puedeVerPunto(punto: any): boolean {
    const esRector = this.puntoUsuarios.some(
      (pu) =>
        pu.usuario.grupoUsuario?.nombre?.toLowerCase() === 'rector' &&
        pu.usuario.id_usuario === this.payload.id
    );

    const asignado = this.puntoUsuarios.some(
      (pu) => pu.punto.id_punto === punto.id_punto && pu.es_principal
    );

    if (esRector) {
      return punto.estado === true && punto.requiere_voto_dirimente === true;
    }

    return (
      punto.estado === true &&
      punto.requiere_voto_dirimente === false &&
      asignado
    );
  }

  /*getGruposDeSesion() {
  const query = `sesion.id_sesion=${this.idSesion}&estado=1`;
  const relations = ['puntoGrupos', 'puntoGrupos.punto'];

  this.grupoService.getAllDataBy(query, relations).subscribe({
    next: (data) => {
      this.grupos = data;
    },
    error: () => {
      this.toastr.error('Error al cargar los grupos', 'Error');
    },
  });
  }*/

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    const clickedInside = (event.target as HTMLElement).closest(
      '.custom-select'
    );
    if (!clickedInside) {
      this.showOptions = false; // Cierra el select si se hace clic fuera
    }
  }

  toggleDropdown(event: MouseEvent) {
    event.stopPropagation(); // Prevenir que el dropdown se cierre en clicks internos
    this.showOptions = !this.showOptions;
  }

  // =========================
  // Método modificado
  // =========================
  toggleOption(option: any) {
    this.puntosSeleccionados = [option]; // Solo permite uno
    this.pointErrorMessage = '';
    this.showOptions = false; // Cierra el select
    this.allPuntosSelected = true;
  }

  /*
// =========================
// Código anterior (comentado)
// =========================
toggleOption(option: IPunto) {
  const index = this.puntosSeleccionados.indexOf(option);
  if (index !== -1) {
    this.puntosSeleccionados.splice(index, 1);
  } else {
    this.puntosSeleccionados.push(option);
    this.pointErrorMessage = '';
  }
  this.allPuntosSelected = this.puntosSeleccionados.length === this.puntos.length;
}
*/

  // =========================
  // Eliminar opción seleccionada
  // =========================
  /*
removeSelectedOption(option: IPunto, event: MouseEvent) {
  event.stopPropagation();
  const index = this.puntosSeleccionados.indexOf(option);
  if (index !== -1) {
    this.puntosSeleccionados.splice(index, 1);
  }
  this.updateSelectAllStatus();
}
*/

  // =========================
  // Actualizar estado de selección total
  // =========================
  /*
updateSelectAllStatus() {
  this.allPuntosSelected = this.puntosSeleccionados.length === this.puntos.length;
}
*/

  // =========================
  // Seleccionar todos (ya no aplica)
  // =========================
  /*
toggleSelectAllPuntos() {
  if (this.allPuntosSelected) {
    this.puntosSeleccionados = [];
  } else {
    this.puntosSeleccionados = [...this.puntos];
  }
  this.allPuntosSelected = !this.allPuntosSelected;
}
*/

  resetForm() {
    this.votoForm.patchValue({
      opcion: '',
      razonado: '',
    }); // Reiniciar el formulario
    this.puntosSeleccionados = []; // Limpiar la lista de puntos seleccionados
    this.pointErrorMessage = ''; // Limpiar el mensaje de error de los puntos
    this.errorMessage = ''; // Limpiar el mensaje de error del código de sesión
    this.confirmationMessage = ''; // Limpiar el mensaje de confirmación
    this.puntos = []; // Limpiar la lista de puntos
    this.allPuntosSelected = false;
  }

  registrarVoto(): void {
    if (this.puntosSeleccionados.length === 0) {
      this.pointErrorMessage = 'No hay ningun punto seleccionado';
      return;
    }

    console.log('Payload actual:', this.payload);

    const seleccionado = this.puntosSeleccionados[0];

    const votoData = {
      idUsuario: this.payload.id,
      codigo: this.votoForm.value.codigo,
      opcion: this.votoForm.value.opcion,
      es_razonado: this.votoForm.value.razonado,
      votante: this.payload.id,
    };

    // Si es un grupo, usar el servicio para grupos
    if (seleccionado.tipo === 'grupo') {
      const idGrupo = Number(seleccionado.id_punto.replace('grupo-', ''));

      this.puntoUsuatioService.votarGrupo(idGrupo, votoData).subscribe({
        next: () => {
          this.resetForm();
          this.toastr.success('Su voto se guardó correctamente', 'Éxito');
        },
        error: () => {
          this.toastr.error('Error al registrar voto por grupo', 'Error');
        },
      });
    } else {
      // Si es un punto individual
      const votoIndividual = {
        ...votoData,
        punto: Number(seleccionado.id_punto),
      };

      this.puntoUsuatioService.saveVote(votoIndividual).subscribe({
        next: () => {
          this.resetForm();
          this.toastr.success('Su voto se guardó correctamente', 'Éxito');
        },
        error: () => {
          this.toastr.error('Error al registrar voto individual', 'Error');
        },
      });
    }
  }
}
