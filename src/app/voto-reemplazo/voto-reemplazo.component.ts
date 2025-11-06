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
import { IGrupo } from '../interfaces/IGrupo';
import { GrupoService } from '../services/grupo.service';
import { Modal } from 'bootstrap';
import { AsistenciaService } from '../services/asistencia.service';
import { IAsistencia } from '../interfaces/IAsistencia';
import { FooterComponent } from '../components/footer/footer.component';

@Component({
  selector: 'app-voto-reemplazo',
  standalone: true,
  imports: [
    BarraSuperiorComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FooterComponent,
  ],
  templateUrl: './voto-reemplazo.component.html',
  styleUrl: './voto-reemplazo.component.css',
})
export class VotoReemplazoComponent {
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

  STORAGE_CODIGO_KEY = 'ocs_codigo_sesion';

  @ViewChild('exampleModal') exampleModal!: ElementRef;
  exampleModalRef: any; // ya existía

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

    const storedCodigo = localStorage.getItem(this.STORAGE_CODIGO_KEY);
    if (storedCodigo) {
      this.votoForm.patchValue({ codigo: storedCodigo }, { emitEvent: false });
      // Puedes decidir si aquí llamas o no a getSesionYPuntos() automáticamente.
    }
  }

  ngAfterViewInit(): void {
    const modalEl = this.exampleModal?.nativeElement;
    if (modalEl) {
      this.exampleModalRef = new Modal(modalEl);
    }
  }

  getPuntoUsuario() {
    const query = `usuario.id_usuario=${this.payload.id_principal}&es_principal=0&estado=1`;
    const relations = [`punto`, `usuario.grupoUsuario`];

    this.puntoUsuatioService.getAllDataBy(query, relations).subscribe((e) => {
      this.puntoUsuarios = e;
    });
  }

  getSesionYPuntos() {
    this.cargandoSesion = true;

    // reset visual
    this.idSesion = 0;
    this.puntos = [];
    this.puntosSeleccionados = [];
    this.errorMessage = '';
    this.confirmationMessage = '';

    // ✅ sanitiza y refleja en el form
    const inputCodigo = this.votoForm.get('codigo')?.value;
    const codigoSanit = this.sanitizeSesionCode(inputCodigo);
    if (!codigoSanit) {
      this.errorMessage = 'Ingrese un código de sesión válido.';
      this.cargandoSesion = false;
      return;
    }
    this.votoForm.patchValue({ codigo: codigoSanit }, { emitEvent: false });

    // ✅ query seguro
    const query = `codigo=${encodeURIComponent(codigoSanit)}&estado=1`;

    this.sesionService.getDataBy(query).subscribe({
      next: (data) => {
        if (data && data.id_sesion) {
          this.idSesion = data.id_sesion;

          // ✅ guarda para reuso
          localStorage.setItem(this.STORAGE_CODIGO_KEY, codigoSanit);

          // 1) refresca puntoUsuario
          this.puntoUsuatioService
            .getAllDataBy(
              `usuario.id_usuario=${this.payload.id_principal}&estado=1&es_principal=0`,
              ['punto', 'usuario.grupoUsuario']
            )
            .subscribe((pu) => {
              this.puntoUsuarios = pu;

              // 2) carga puntos visibles para el reemplazo
              const query2 = `sesion.id_sesion=${this.idSesion}&estado=1`;
              const relations = ['sesion'];

              this.puntoService
                .getAllDataBy(query2, relations)
                .subscribe((puntosDisponibles) => {
                  const puntosFiltrados = puntosDisponibles.filter((p: any) =>
                    this.puedeVerPunto(p)
                  );
                  const puntosAdaptados = puntosFiltrados.map((p: any) => ({
                    ...p,
                    tipo: 'punto',
                    raw: p,
                  }));
                  this.puntos = puntosAdaptados;

                  // 3) agrega grupos válidos PARA REEMPLAZO (es_principal === false)
                  const queryGrupos = `sesion.id_sesion=${this.idSesion}&estado=1`;
                  const relationsGrupos = ['puntoGrupos', 'puntoGrupos.punto'];

                  this.grupoService
                    .getAllDataBy(queryGrupos, relationsGrupos)
                    .subscribe({
                      next: (gr) => {
                        this.grupos = gr;

                        const gruposFiltrados = this.grupos.filter(
                          (grupo: any) =>
                            grupo.puntoGrupos?.every((pg: any) =>
                              this.puntoUsuarios.some(
                                (pu: any) =>
                                  pu.punto?.id_punto ===
                                  pg.punto
                                    ?.id_punto /*&& pu.es_principal === false*/
                              )
                            )
                        );

                        const gruposAdaptados = gruposFiltrados.map(
                          (grupo: any) => ({
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
                          err?.error?.message || 'Error'
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

  private sanitizeSesionCode(value: string | null | undefined): string {
    const raw = (value ?? '')
      // quita caracteres invisibles comunes (ZWSP, NBSP, etc.) y saltos
      .replace(/[\u200B-\u200D\uFEFF\u00A0\r\n\t]/g, '')
      .trim();
    // normaliza Unicode para evitar diferencias Android/iOS
    try {
      return raw.normalize('NFC');
    } catch {
      return raw;
    }
  }

  puedeVerPunto(punto: any): boolean {
    const esRector = this.puntoUsuarios.some(
      (pu) => pu.usuario.grupoUsuario?.nombre?.toLowerCase() === 'rector' /*&&
        pu.usuario.id_usuario === this.payload.id_principal*/
    );

    const asignado = this.puntoUsuarios.some(
      (pu) =>
        pu.punto.id_punto === punto.id_punto /*&& pu.es_principal === false*/
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
    const query = `usuario.id_usuario=${this.payload.id_principal}&sesion.id_sesion=${this.idSesion}`;

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
  toggleOption(option: IPunto) {
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
    const storedCodigo = localStorage.getItem(this.STORAGE_CODIGO_KEY) || '';
    this.votoForm.patchValue(
      {
        codigo: storedCodigo || this.votoForm.value.codigo || '',
        opcion: '',
        razonado: false,
      },
      { emitEvent: false }
    );

    this.puntosSeleccionados = [];
    this.pointErrorMessage = '';
    this.errorMessage = '';
    this.confirmationMessage = '';
    this.puntos = [];
    this.allPuntosSelected = false;
  }

  cerrarModal(modalId: string, form?: FormGroup, modalRef?: any) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      if (modalRef) {
        try {
          modalRef.hide();
        } catch {}
      } else {
        modalElement.classList.remove('show');
        (modalElement as HTMLElement).style.display = 'none';
        modalElement.setAttribute('aria-hidden', 'true');
      }
    }

    // Limpieza manual (igual que voto)
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';

    const backdrops = document.getElementsByClassName('modal-backdrop');
    while (backdrops[0]) {
      backdrops[0].parentNode?.removeChild(backdrops[0]);
    }

    // 🔧 Destruye la instancia interna para evitar estado zombi
    try {
      const inst =
        (window as any).bootstrap?.Modal.getInstance(modalElement!) ||
        (window as any).bootstrap?.Modal.getOrCreateInstance(modalElement!);
      inst?.dispose?.();
    } catch {}

    if (form) form.reset();
  }

  registrarVoto(): void {
    if (this.puntosSeleccionados.length === 0) {
      this.pointErrorMessage = 'No hay ningún punto seleccionado';
      return;
    }

    this.registrandoVoto = true;
    const seleccionado = this.puntosSeleccionados[0];

    // 📌 usa el código saneado del form o el persistido
    const storedCodigo = localStorage.getItem(this.STORAGE_CODIGO_KEY) || '';
    const codigoActual = this.sanitizeSesionCode(
      this.votoForm.value.codigo || storedCodigo
    );

    const votoData = {
      idUsuario: this.payload.id_principal, // 👈 reemplazo vota por principal
      codigo: codigoActual,
      opcion: this.votoForm.value.opcion,
      es_razonado: this.votoForm.value.razonado,
      votante: this.payload.id, // 👈 quien emite es el reemplazo
    };

    const cerrar = () =>
      this.cerrarModal('exampleModal', undefined, this.exampleModalRef);
    const limpiarSoloCamposDeVoto = () => {
      this.votoForm.patchValue(
        { opcion: '', razonado: false },
        { emitEvent: false }
      );
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
      cerrar();
      finalizar();

      if (codigoActual) {
        this.votoForm.patchValue(
          { codigo: codigoActual },
          { emitEvent: false }
        );
        localStorage.setItem(this.STORAGE_CODIGO_KEY, codigoActual);
        this.getSesionYPuntos();
      }
      this.getPuntoUsuario();
    };

    const onError = (msg: string) => {
      this.toastr.error(msg, 'Error');
      finalizar();
    };

    if (seleccionado.tipo === 'grupo') {
      const idGrupo = Number(seleccionado.id_punto.replace('grupo-', ''));

      this.grupoService.grupoHabilitado(idGrupo).subscribe({
        next: (resp) => {
          const habilitado =
            typeof resp === 'boolean' ? resp : !!resp?.habilitado;
          if (!habilitado) {
            onError('El grupo está deshabilitado para votar');
            return;
          }

          this.puntoUsuatioService.votarGrupo(idGrupo, votoData).subscribe({
            next: onSuccess,
            error: () => onError('Error al registrar voto por grupo'),
          });
        },
        error: () => onError('No fue posible verificar el estado del grupo'),
      });
    } else {
      const puntoId = Number(seleccionado.id_punto);
      const votoIndividual = { ...votoData, punto: puntoId };

      this.puntoService.puntoHabilitado(puntoId).subscribe({
        next: (resp) => {
          const habilitado =
            typeof resp === 'boolean' ? resp : !!resp?.habilitado;
          if (!habilitado) {
            onError('El punto está deshabilitado para votar');
            return;
          }

          this.puntoUsuatioService.saveVote(votoIndividual).subscribe({
            next: onSuccess,
            error: () => onError('Error al registrar voto individual'),
          });
        },
        error: () => onError('No fue posible verificar el estado del punto'),
      });
    }
  }
}
