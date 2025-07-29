import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { BarraSuperiorComponent } from '../components/barra-superior/barra-superior.component';
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
import { Modal } from 'bootstrap';
import { AsistenciaService } from '../services/asistencia.service';
import { IAsistencia } from '../interfaces/IAsistencia';
import { FooterComponent } from "../components/footer/footer.component";

@Component({
  selector: 'app-voto',
  standalone: true,
  imports: [
    BarraSuperiorComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FooterComponent
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
    private grupoService: GrupoService,
    private asistenciaService: AsistenciaService
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

  @ViewChild('exampleModal') exampleModal!: ElementRef;
  exampleModalRef: any;

  //flags
  cargandoSesion = false;

  registrandoVoto = false;

  votoForm = new FormGroup({
    codigo: new FormControl('', Validators.required),
    opcion: new FormControl('', Validators.required),
    razonado: new FormControl(false),
  });

  ngOnInit(): void {
    this.payload = jwtDecode(this.cookieService.get('token'));
    this.getPuntoUsuario();
    //this.getGruposDeSesion();
  }

  ngAfterViewInit(): void {
    const modalEl = this.exampleModal?.nativeElement;
    if (modalEl) {
      this.exampleModalRef = new Modal(modalEl);
    }
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
    const relations = [`punto`, `usuario.grupoUsuario`];

    this.puntoUsuatioService.getAllDataBy(query, relations).subscribe((e) => {
      this.puntoUsuarios = e;
    });
  }

  getSesionYPuntos() {
    this.cargandoSesion = true;

    this.idSesion = 0;
    this.puntos = [];
    this.puntosSeleccionados = [];
    this.errorMessage = '';
    this.confirmationMessage = '';

    const codigo = this.votoForm.get('codigo')?.value;
    console.log('Código de Sesión:', codigo);

    const query = `codigo=${codigo}&estado=1`;

    this.sesionService.getDataBy(query).subscribe({
      next: (data) => {
        if (data && data.id_sesion) {
          this.idSesion = data.id_sesion;

          // ✅ Refrescar puntoUsuarios ANTES de filtrar puntos
          this.puntoUsuatioService
            .getAllDataBy(`usuario.id_usuario=${this.payload.id}&estado=1`, [
              'punto',
              'usuario.grupoUsuario',
            ])
            .subscribe((puntoUsuariosActualizados) => {
              this.puntoUsuarios = puntoUsuariosActualizados;

              // ✅ Marcar asistencia
              this.marcarAsistenciaComoPresente();

              const queryPuntos = `sesion.id_sesion=${this.idSesion}&estado=1`;
              const relationsPuntos = ['sesion'];

              this.puntoService
                .getAllDataBy(queryPuntos, relationsPuntos)
                .subscribe((puntosDisponibles) => {
                  const puntosFiltrados = puntosDisponibles.filter((p) =>
                    this.puedeVerPunto(p)
                  );

                  const puntosAdaptados = puntosFiltrados.map((p) => ({
                    ...p,
                    tipo: 'punto',
                    raw: p,
                  }));

                  this.puntos = puntosAdaptados;

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

                        const gruposAdaptados = gruposFiltrados.map(
                          (grupo) => ({
                            id_punto: `grupo-${grupo.id_grupo}`,
                            nombre: `(Grupo) ${grupo.nombre}`,
                            tipo: 'grupo',
                            raw: grupo,
                          })
                        );

                        this.puntos = [...this.puntos, ...gruposAdaptados];
                        this.confirmationMessage = 'Código de sesión válido.';
                        this.cargandoSesion = false;
                      },
                      error: (err) => {
                        this.toastr.error(
                          'Error al cargar los grupos',
                          err.error.message || 'Error'
                        );
                        this.cargandoSesion = false;
                      },
                    });
                });
            });
        } else {
          this.errorMessage = 'El código de sesión es inválido.';
          this.cargandoSesion = false;
        }
      },
      error: (error) => {
        console.log('error: ', error);
        this.errorMessage =
          error.status === 401
            ? 'Credenciales incorrectas'
            : 'Se produjo un error. Por favor, inténtalo de nuevo.';
        this.cargandoSesion = false;
      },
    });
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

  marcarAsistenciaComoPresente(): void {
    const query = `usuario.id_usuario=${this.payload.id}&sesion.id_sesion=${this.idSesion}`;

    this.asistenciaService.getDataBy(query).subscribe({
      next: (asistencia) => {
        const asistenciaActualizada: IAsistencia = {
          ...asistencia,
          tipo_asistencia: 'presente',
          estado: true,
          status: true,
        };

        this.asistenciaService.saveData(asistenciaActualizada).subscribe({
          next: () => {
            console.log('✅ Asistencia actualizada a presente');
          },
          error: (err) => {
            console.error('⚠️ Error al actualizar asistencia:', err);
            this.toastr.warning(
              'No se pudo actualizar la asistencia automáticamente',
              'Advertencia'
            );
          },
        });
      },
      error: (err) => {
        console.error('❌ Asistencia no encontrada:', err);
        this.toastr.error(
          'No se encontró la asistencia registrada por la Secretaría',
          'Error crítico'
        );
      },
    });
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
      razonado: false,
    }); // Reiniciar el formulario
    this.puntosSeleccionados = []; // Limpiar la lista de puntos seleccionados
    this.pointErrorMessage = ''; // Limpiar el mensaje de error de los puntos
    this.errorMessage = ''; // Limpiar el mensaje de error del código de sesión
    this.confirmationMessage = ''; // Limpiar el mensaje de confirmación
    this.puntos = []; // Limpiar la lista de puntos
    this.allPuntosSelected = false;
  }

  cerrarModal(modalId: string, form?: FormGroup, modalRef?: any) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      if (modalRef) {
        modalRef.hide();
      } else {
        modalElement.classList.remove('show');
        modalElement.style.display = 'none';
      }
    }

    // 🔴 Este bloque es crucial para evitar lo que muestra la imagen
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';

    const backdrops = document.getElementsByClassName('modal-backdrop');
    while (backdrops[0]) {
      backdrops[0].parentNode?.removeChild(backdrops[0]);
    }

    if (form) form.reset();
  }

  registrarVoto(): void {
    if (this.puntosSeleccionados.length === 0) {
      this.pointErrorMessage = 'No hay ningún punto seleccionado';
      return;
    }

    this.registrandoVoto = true;

    const seleccionado = this.puntosSeleccionados[0];
    const votoData = {
      idUsuario: this.payload.id,
      codigo: this.votoForm.value.codigo,
      opcion: this.votoForm.value.opcion,
      es_razonado: this.votoForm.value.razonado,
      votante: this.payload.id,
    };

    const cerrarModal = () => {
      this.cerrarModal('exampleModal', undefined, this.exampleModalRef);
    };

    const limpiarSoloCamposDeVoto = () => {
      this.votoForm.patchValue({
        opcion: '',
        razonado: false,
      });
      this.puntosSeleccionados = [];
      this.pointErrorMessage = '';
      this.allPuntosSelected = false;
    };

    const finalizar = () => {
      this.registrandoVoto = false;
    };

    const onSuccess = () => {
      limpiarSoloCamposDeVoto();
      this.toastr.success('Su voto se guardó correctamente', 'Éxito');
      cerrarModal();
      finalizar();
    };

    const onError = (msg: string) => {
      this.toastr.error(msg, 'Error');
      finalizar();
    };

    if (seleccionado.tipo === 'grupo') {
      const idGrupo = Number(seleccionado.id_punto.replace('grupo-', ''));
      this.puntoUsuatioService.votarGrupo(idGrupo, votoData).subscribe({
        next: onSuccess,
        error: () => onError('Error al registrar voto por grupo'),
      });
    } else {
      const votoIndividual = {
        ...votoData,
        punto: Number(seleccionado.id_punto),
      };
      this.puntoUsuatioService.saveVote(votoIndividual).subscribe({
        next: onSuccess,
        error: () => onError('Error al registrar voto individual'),
      });
    }
  }
}
