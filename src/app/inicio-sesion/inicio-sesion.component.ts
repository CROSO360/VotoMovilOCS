import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inicio-sesion',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './inicio-sesion.component.html',
  styleUrl: './inicio-sesion.component.css',
})
export class InicioSesionComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private cookieService: CookieService,
    private authService: AuthService,
    private router: Router
  ) {}

  voterLoginForm = this.fb.group({
    codigo: ['', [Validators.required]],
    cedula: ['', [Validators.required]],
    reemplazo: [false],
  });

  errorMessage: string = '';

  async ngOnInit() {
    const cookie = await this.cookieService.check('token');
    if (cookie) {
      await this.cookieService.deleteAll('cookie');
    }
  }

  onSubmit(): void {
    const formData = this.voterLoginForm.value;

    const loginData = {
      codigo: formData.codigo,
      cedula: formData.cedula,
    };

    if (formData.reemplazo == false) {
      this.authService.voterLogin(loginData).subscribe({
        next: (response) => {
          this.cookieService.set('token', response.token);
          this.router.navigate(['/', 'voto']);
        },
        error: (e) => {
          console.log('error: ', e);
          if (e.status === 401) {
            this.errorMessage = 'Credenciales incorrectas';
          } else {
            this.errorMessage =
              'Se produjo un error. Por favor, inténtalo de nuevo.';
          }
        },
      });
    }else{
      this.authService.voterReemplazoLogin(loginData).subscribe({
        next: (response) => {
          this.cookieService.set('token', response.token);
          this.router.navigate(['/voto/reemplazo']);
        },
        error: (e) => {
          console.log('error: ', e);
          if (e.status === 401) {
            this.errorMessage = e.error.message;
          } else {
            this.errorMessage =
              `Se produjo un error. Por favor, inténtalo de nuevo.\r${e.error.message}`;
          }
        },
      });
      
    }

    
  }
}
