import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth';
import { ModalService } from '../../services/modal';
import { PublicacionesService } from '../../services/publicaciones';

@Component({
  selector: 'app-resena',
  imports: [DatePipe],
  templateUrl: './resena.html',
  styleUrl: './resena.css',
})
export class Resena implements OnInit {
  @Input({ required: true }) resena!: any;
  @Output() eliminada = new EventEmitter<string>();

  private api = inject(PublicacionesService);
  private auth = inject(AuthService);
  private modal = inject(ModalService);

  cantidad = signal(0);
  leGusto = signal(false);
  enCurso = signal(false);

  ngOnInit() {
    this.cantidad.set(this.resena.cantidadMeGusta);
    this.leGusto.set(this.resena.yaLeGusto);
  }

  get esMia() { return this.auth.usuario()?._id === this.resena.autor?._id; }

  get estrellas() {
    const n = this.resena.calificacion ?? 0;
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  }

  alternarMeGusta() {
    this.enCurso.set(true);
    const peticion = this.leGusto()
      ? this.api.quitarMeGusta(this.resena._id)
      : this.api.darMeGusta(this.resena._id);

    peticion.subscribe({
      next: (r) => {
        this.cantidad.set(r.cantidadMeGusta);
        this.leGusto.set(r.yaLeGusto);
        this.enCurso.set(false);
      },
      error: (e) => {
        this.enCurso.set(false);
        this.modal.abrir('No pudimos actualizar tu recomendación', e.error?.message ?? 'Error de conexión', 'error');
      },
    });
  }

  async eliminar() {
    const acepto = await this.modal.confirmar(
      '¿Eliminar esta reseña?',
      'Va a dejar de estar disponible para los demás lectores.',
      'Eliminar',
    );
    if (!acepto) return;

    this.api.eliminar(this.resena._id).subscribe({
      next: () => this.eliminada.emit(this.resena._id),
      error: (e) => this.modal.abrir('No pudimos eliminarla', e.error?.message ?? 'Error de conexión', 'error'),
    });
  }
}