import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AutofocoDirective } from '../../directives/autofoco.directive';
import { AuthService } from '../../services/auth';
import { ModalService } from '../../services/modal';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, AutofocoDirective],
  templateUrl: './login.html',
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private modal = inject(ModalService);
  private router = inject(Router);

  form = this.fb.nonNullable.group({
    identificador: ['', Validators.required],
    password: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*\d).{8,}$/)]],
  });

  invalido(c: string) {
    const x = this.form.get(c);
    return x?.invalid && x.touched;
  }

  enviar() {
    if (this.form.invalid) return this.form.markAllAsTouched();
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate(['/cargando']),
      error: (e) => {
        const mensaje: string = e.error?.message ?? 'Error de conexión';
        const titulo = mensaje.includes('deshabilitado') ? 'Usuario deshabilitado' : 'No pudimos ingresar';
        this.modal.abrir(titulo, mensaje, 'error');
      },
    });
  }
}