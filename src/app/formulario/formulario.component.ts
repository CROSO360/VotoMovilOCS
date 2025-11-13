import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FooterComponent } from '../components/footer/footer.component';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { UsuarioService } from '../services/usuario.service';
import { MiembroService } from '../services/miembro.service';

type ModalData = {
  idUsuario: number;
  nombre: string;
  principal?: string;
  cedula: string;
  codigo: string;
  esReemplazo: boolean;
};

@Component({
  selector: 'app-formulario',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FooterComponent],
  templateUrl: './formulario.component.html',
  styleUrl: './formulario.component.css',
})
export class FormularioComponent implements OnInit {
  @ViewChild('usuarioSearchWrapper') usuarioSearchWrapper?: ElementRef<HTMLElement>;

  constructor(
    private fb: FormBuilder,
    private cookieService: CookieService,
    private authService: AuthService,
    private router: Router,
    private usuarioService: UsuarioService,
    private miembroService: MiembroService
  ) {}

  usuarios: any[] = [];
  filteredUsuarios: any[] = [];
  searchTerm = '';
  showSuggestions = false;
  selectedUsuario: any | null = null;
  showConfirmationModal = false;
  modalData: ModalData | null = null;
  copiedCodigo = false;
  iniciandoSesion = false;
  iniciandoSesionModal = false;
  errorMessage: string = '';
  modalErrorMessage = '';

  accesoForm = this.fb.group({
    usuario: ['', [Validators.required]],
    cedula: ['', [Validators.required]],
    celular: ['', [Validators.required]],
  });

  async ngOnInit() {
    this.getMiembros();
  }

  onGenerateUserCode(): void {
    if (this.accesoForm.invalid || !this.selectedUsuario) {
      this.accesoForm.markAllAsTouched();
      this.errorMessage = 'Debe seleccionar un usuario y completar todos los campos.';
      return;
    }

    const { usuario, cedula, celular } = this.accesoForm.getRawValue();
    if (!usuario || !cedula || !celular) {
      this.errorMessage = 'Complete todos los campos.';
      return;
    }

    console.log('id_usuario:', usuario);

    this.iniciandoSesion = true;
    this.errorMessage = '';

    this.usuarioService
      .actualizarDatos(Number(usuario), cedula, celular)
      .subscribe({
        next: ({ codigo }) => {
          this.modalData = {
            idUsuario: this.selectedUsuario?.idUsuario,
            nombre: this.selectedUsuario?.nombre ?? '',
            principal: this.selectedUsuario?.esReemplazo
              ? this.selectedUsuario.reemplazo
              : undefined,
            cedula,
            codigo,
            esReemplazo: this.selectedUsuario?.esReemplazo ?? false,
          };
          this.copiedCodigo = false;
          this.modalErrorMessage = '';
          this.showConfirmationModal = true;
          this.iniciandoSesion = false;
        },
        error: (error) => {
          this.iniciandoSesion = false;
          this.errorMessage =
            error?.error?.message ||
            'No se pudo actualizar la información. Intente de nuevo.';
        },
      });
  }


  getMiembros() {
    this.miembroService.getMiembrosYReemplazos().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.filteredUsuarios = [...this.usuarios];
      },
      error: (error) => {
        console.error('Error al obtener miembros:', error);
      },
    });
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement)?.value ?? '';
    this.searchTerm = value;
    this.showSuggestions = true;
    this.accesoForm.get('usuario')?.setValue('');
    this.selectedUsuario = null;
    const normalizedTerm = this.normalizeText(value);
    this.filteredUsuarios = this.usuarios.filter((usuario) =>
      this.normalizeText(this.getUsuarioLabel(usuario)).includes(normalizedTerm)
    );
  }

  selectUsuario(usuario: any): void {
    this.accesoForm.get('usuario')?.setValue(usuario.idUsuario);
    this.searchTerm = this.getUsuarioLabel(usuario);
    this.showSuggestions = false;
    this.selectedUsuario = usuario;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.showSuggestions) {
      return;
    }
    const target = event.target as Node;
    if (!this.usuarioSearchWrapper?.nativeElement.contains(target)) {
      this.showSuggestions = false;
    }
  }

  submitModal(): void {
    if (!this.modalData) {
      return;
    }
    const { idUsuario } = this.modalData;
    console.log('Modal submit con usuario:', idUsuario);
    this.iniciandoSesionModal = true;
    this.modalErrorMessage = '';

    const loginData = {
      codigo: this.modalData.codigo,
      cedula: this.modalData.cedula,
    };

    const callback = {
      next: (response: any) => {
        this.cookieService.set('token', response.token);
        const ruta = this.modalData?.esReemplazo ? '/voto/reemplazo' : '/voto';
        this.closeModal();
        this.router.navigate([ruta]);
      },
      error: (e: any) => {
        if (e.status === 401) {
          this.modalErrorMessage = e.error.message || 'Credenciales incorrectas';
        } else {
          this.modalErrorMessage =
            e.error?.message ||
            'Se produjo un error al iniciar sesión. Intente de nuevo.';
        }
        this.iniciandoSesionModal = false;
      },
      complete: () => {
        this.iniciandoSesionModal = false;
      },
    };

    if (this.modalData.esReemplazo) {
      this.authService.voterReemplazoLogin(loginData).subscribe(callback);
    } else {
      this.authService.voterLogin(loginData).subscribe(callback);
    }
  }

  copiarCodigo(codigo: string): void {
    navigator.clipboard.writeText(codigo).then(
      () => {
        this.copiedCodigo = true;
        setTimeout(() => {
          this.copiedCodigo = false;
        }, 2000);
      },
      () => {
        console.warn('No se pudo copiar el código');
      }
    );
  }

  closeModal(): void {
    this.showConfirmationModal = false;
    this.copiedCodigo = false;
    this.modalErrorMessage = '';
    this.iniciandoSesionModal = false;
  }

  trackByUsuarioId(_: number, usuario: any): number {
    return usuario.idUsuario;
  }

  getUsuarioLabel(usuario: any): string {
    const grupo = this.capitalizeWords(usuario.grupoUsuario);
    if (usuario.esReemplazo) {
      return `${usuario.nombre} reemplazo de ${usuario.reemplazo} - ${grupo}`;
    }
    return `${usuario.nombre} - ${grupo}`;
  }

  private normalizeText(value: string): string {
    return value
      ? value
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
      : '';
  }

  private capitalizeWords(value: string): string {
    if (!value) {
      return '';
    }
    return value
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  
}
