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
    private puntoUsuatioService: PuntoUsuarioService
  ) {}

  puntos: IPunto[] = [];

  puntosSeleccionados: IPunto[] = [];

  puntoUsuarios: any[] = [];

  idSesion: number | null = 0;

  payoad: any = jwtDecode(this.cookieService.get('token'));

  errorMessage = '';

  confirmationMessage = '';

  pointErrorMessage = '';

  showOptions = false;

  votoForm = new FormGroup({
    codigo: new FormControl('', Validators.required),
    opcion: new FormControl('', Validators.required),
    razonado: new FormControl(''),
  });

  ngOnInit(): void {
    this.payoad = jwtDecode(this.cookieService.get('token'));
    this.getPuntoUsuario();
  }

  /*getPuntos(){
    const query = `sesion.id_sesion=${this.idSesion}`;
    const relations = [`sesion`]
    this.puntoService.getAllDataBy(query, relations).subscribe((data) =>{
      this.puntos = data
      console.log(data);
    });
    
    
  }*/

  getPuntoUsuario(){
    const query = `usuario.id_usuario=${this.payoad.id}`;
    const relations = [`punto`];

    this.puntoUsuatioService.getAllDataBy(query, relations).subscribe((e)=>{
      this.puntoUsuarios = e;
    });
  }

  getSesionYPuntos(event: any) {
    this.idSesion = 0;
    this.puntos = [];
    this.puntosSeleccionados = []; // Limpiar la lista de puntos seleccionados
    this.errorMessage = ''; // Restablecer el mensaje de error
    this.confirmationMessage = ''; // Restablecer el mensaje de confirmación
  
    const codigo = (event.target as HTMLInputElement).value;
    console.log('Código de Sesión:', codigo);
  
    const query = `codigo=${codigo}&estado=1`;
    this.sesionService.getDataBy(query).subscribe(
      (data) => {
        if (data && data.id_sesion) {
          this.idSesion = data.id_sesion;
  
          const query2 = `sesion.id_sesion=${this.idSesion}&estado=1`;
          const relations = ['sesion'];
  
          this.puntoService
            .getAllDataBy(query2, relations)
            .subscribe((puntosDisponibles) => {
              // Filtrar los puntos disponibles según los puntos asignados al usuario
              this.puntos = puntosDisponibles.filter(puntoDisponible =>
                this.puntoUsuarios.some(puntoUsuario => puntoUsuario.punto.id_punto === puntoDisponible.id_punto)
              );
              console.log(this.puntos);
            });
  
          // Indica que el código de sesión es válido
          this.confirmationMessage = 'Código de sesión válido.';
        } else {
          // Setea el mensaje de error si el código de sesión es inválido
          this.errorMessage = 'El código de sesión es inválido.';
        }
      },
      (error) => {
        console.log('error: ', error);
        if (error.status === 401) {
          this.errorMessage = 'Credenciales incorrectas';
        } else {
          this.errorMessage =
            'Se produjo un error. Por favor, inténtalo de nuevo.';
        }
      }
    );
  }
  
  

  toggleOption(option: IPunto) {
    const index = this.puntosSeleccionados.indexOf(option);
    if (index !== -1) {
      this.puntosSeleccionados.splice(index, 1);
    } else {
      this.puntosSeleccionados.push(option);
      this.pointErrorMessage = '';
    }
  }

  removeSelectedOption(option: IPunto) {
    const index = this.puntosSeleccionados.indexOf(option);
    if (index !== -1) {
      this.puntosSeleccionados.splice(index, 1);
    }
  }

  @HostListener('document:click', ['$event'])
  onClick(event: any) {
    if (!event.target.closest('.custom-select')) {
      this.showOptions = false;
    }
  }

  resetForm() {
    this.votoForm.reset(); // Reiniciar el formulario
    this.puntosSeleccionados = []; // Limpiar la lista de puntos seleccionados
    this.pointErrorMessage = ''; // Limpiar el mensaje de error de los puntos
    this.errorMessage = ''; // Limpiar el mensaje de error del código de sesión
    this.confirmationMessage = ''; // Limpiar el mensaje de confirmación
    this.puntos = []; // Limpiar la lista de puntos
}


  registrarVoto(): void {

    if (this.puntosSeleccionados.length === 0) {
      this.pointErrorMessage = 'No hay ningun punto seleccionado';
      return;
    }else{
      this.puntosSeleccionados.forEach((e)=>{
        let votoData = {
          id_usuario:this.payoad.id,
          codigo:this.votoForm.value.codigo,
          punto:e.id_punto,
          opcion:this.votoForm.value.opcion,
          es_razonado:this.votoForm.value.razonado
        }

        this.puntoUsuatioService.saveVote(votoData).subscribe(()=>{
          console.log(`solicitud realizada`);
          this.resetForm();
        });

      });
    }

  }
  
}
