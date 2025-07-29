import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FooterComponent } from "../components/footer/footer.component";

@Component({
  selector: 'app-inicio-sesion',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FooterComponent],
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
  iniciandoSesion = false;

  async ngOnInit() {
    const cookie = await this.cookieService.check('token');
    if (cookie) {
      await this.cookieService.deleteAll('cookie');
    }
  }

  onSubmit(): void {
    if (this.voterLoginForm.invalid) return;

    this.iniciandoSesion = true;

    const formData = this.voterLoginForm.value;
    const loginData = {
      codigo: formData.codigo,
      cedula: formData.cedula,
    };

    const callback = {
      next: (response: any) => {
        this.cookieService.set('token', response.token);
        const ruta = formData.reemplazo ? '/voto/reemplazo' : '/voto';
        this.router.navigate([ruta]);
      },
      error: (e: any) => {
        if (e.status === 401) {
          this.errorMessage = e.error.message || 'Credenciales incorrectas';
          this.iniciandoSesion = false;
        } else {
          this.errorMessage = `Se produjo un error. Por favor, inténtalo de nuevo.\r${
            e.error.message || ''
          }`;
          this.iniciandoSesion = false;
        }
        
      },
      complete: () => {
        this.iniciandoSesion = false;
      },
    };

    if (!formData.reemplazo) {
      this.authService.voterLogin(loginData).subscribe(callback);
    } else {
      this.authService.voterReemplazoLogin(loginData).subscribe(callback);
    }
  }
}
