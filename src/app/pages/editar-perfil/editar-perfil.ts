import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ModalService } from '../../services/modal';
import { UsuariosService } from '../../services/usuarios';
import { hoy, noFutura } from '../../validadores';

@Component({
  selector: 'app-editar-perfil',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './editar-perfil.html',
  styleUrl: './editar-perfil.css',
})
export class EditarPerfil {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private api = inject(UsuariosService);
  private modal = inject(ModalService);
  private router = inject(Router);

  private actual = this.auth.usuario();
  imagen?: File;
  vista = signal<string>(this.actual?.imagenPerfil ?? '');
  guardando = signal(false);
  hoy = hoy();

  form = this.fb.nonNullable.group({
    nombre: [this.actual?.nombre ?? '', Validators.required],
    apellido: [this.actual?.apellido ?? '', Validators.required],
    fechaNacimiento: [String(this.actual?.fechaNacimiento ?? '').slice(0, 10), [Validators.required, noFutura]],
    descripcion: [this.actual?.descripcion ?? '', Validators.maxLength(300)],
  });

  invalido(c: string) {
    const x = this.form.get(c);
    return x?.invalid && x.touched;
  }

  onFile(e: Event) {
    this.imagen = (e.target as HTMLInputElement).files?.[0];
    this.vista.set(this.imagen ? URL.createObjectURL(this.imagen) : this.actual?.imagenPerfil ?? '');
  }

  guardar() {
    if (this.form.invalid) return this.form.markAllAsTouched();
    const fd = new FormData();
    Object.entries(this.form.getRawValue()).forEach(([k, v]) => fd.append(k, v.trim()));
    if (this.imagen) fd.append('imagenPerfil', this.imagen);

    this.guardando.set(true);
    this.api.actualizarPerfil(fd).subscribe({
      next: (usuario) => {
        this.auth.actualizarUsuario(usuario);
        this.router.navigate(['/mi-perfil']);
        this.modal.abrir('Perfil actualizado', 'Tus datos se guardaron correctamente.', 'exito');
      },
      error: (e) => {
        this.guardando.set(false);
        const m = e.error?.message;
        this.modal.abrir('No pudimos guardar los cambios', Array.isArray(m) ? m.join('. ') : m ?? 'Error de conexión', 'error');
      },
    });
  }
}
