import { Component, EventEmitter, HostListener, Output, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalService } from '../../services/modal';
import { PublicacionesService } from '../../services/publicaciones';


@Component({
  selector: 'app-nueva-resena',
  imports: [ReactiveFormsModule],
  templateUrl: './nueva-resena.html',
  styleUrl: './nueva-resena.css',
})
export class NuevaResena {
  @Output() cerrar = new EventEmitter<void>();
  @Output() creada = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private api = inject(PublicacionesService);
  private modal = inject(ModalService);

  calificacion = signal(0);
  vista = signal('');
  enviando = signal(false);
  imagen?: File;

  form = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.maxLength(150)]],
    mensaje: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  @HostListener('document:keydown.escape')
    alEscape() { this.cerrar.emit(); }

  invalido(c: string) {
    const x = this.form.get(c);
    return x?.invalid && x.touched;
  }

  // Tocar la misma estrella otra vez quita la calificación
  elegir(n: number) { this.calificacion.set(this.calificacion() === n ? 0 : n); }

  onFile(e: Event) {
    this.imagen = (e.target as HTMLInputElement).files?.[0];
    this.vista.set(this.imagen ? URL.createObjectURL(this.imagen) : '');
  }

  publicar() {
    if (this.form.invalid) return this.form.markAllAsTouched();
    const { titulo, mensaje } = this.form.getRawValue();

    const fd = new FormData();
    fd.append('titulo', titulo.trim());
    fd.append('mensaje', mensaje.trim());
    if (this.calificacion()) fd.append('calificacion', String(this.calificacion()));
    if (this.imagen) fd.append('imagen', this.imagen);

    this.enviando.set(true);
    this.api.crear(fd).subscribe({
      next: () => {
        this.modal.abrir('Reseña publicada', 'Tu reseña ya está en la lista.', 'exito');
        this.creada.emit();
      },
      error: (e) => {
        this.enviando.set(false);
        const m = e.error?.message;
        this.modal.abrir('No pudimos publicar', Array.isArray(m) ? m.join('. ') : m ?? 'Error de conexión', 'error');
      },
    });
  }
}