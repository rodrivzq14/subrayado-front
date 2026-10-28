import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ModalService } from '../../services/modal';

const PASS = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
const iguales = (g: AbstractControl) =>
  g.get('password')?.value === g.get('repetir')?.value ? null : { noCoinciden: true };

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
})
export class Registro {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private modal = inject(ModalService);
  private router = inject(Router);
  imagen?: File;

  form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    correo: ['', [Validators.required, Validators.email]],
    nombreUsuario: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.pattern(PASS)]],
    repetir: ['', Validators.required],
    fechaNacimiento: ['', Validators.required],
    descripcion: ['', Validators.maxLength(300)],
  }, { validators: iguales });

  invalido(c: string) {
    const x = this.form.get(c);
    return x?.invalid && x.touched;
  }

  onFile(e: Event) {
    this.imagen = (e.target as HTMLInputElement).files?.[0];
  }

  enviar() {
    if (this.form.invalid) return this.form.markAllAsTouched();
    const { repetir, ...datos } = this.form.getRawValue();
    const fd = new FormData();
    Object.entries(datos).forEach(([k, v]) => fd.append(k, v));
    if (this.imagen) fd.append('imagenPerfil', this.imagen);

    this.auth.registro(fd).subscribe({
      next: () => {
        this.modal.abrir('¡Bienvenido a Subrayado!', 'Tu cuenta fue creada. Ya podés ingresar.');
        this.router.navigate(['/login']);
      },
      error: (e) => {
        const m = e.error?.message;
        this.modal.abrir('No pudimos registrarte', Array.isArray(m) ? m.join('. ') : m ?? 'Error de conexión');
      },
    });
  }
}