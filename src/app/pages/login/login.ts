import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ModalService } from '../../services/modal';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
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
      next: () => this.router.navigate(['/publicaciones']),
      error: (e) => this.modal.abrir('No pudimos ingresar', e.error?.message ?? 'Error de conexión'),
    });
  }
}