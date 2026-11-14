import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ImagenRespaldoDirective } from '../../directives/imagen-respaldo.directive';
import { EstrellasPipe } from '../../pipes/estrellas.pipe';
import { AuthService } from '../../services/auth';
import { ModalService } from '../../services/modal';
import { PublicacionesService } from '../../services/publicaciones';

@Component({
  selector: 'app-resena',
  imports: [DatePipe, RouterLink, EstrellasPipe, ImagenRespaldoDirective],
  templateUrl: './resena.html',
  styleUrl: './resena.css',
})
export class Resena implements OnInit {
  @Input({ required: true }) resena!: any;
  @Input() detalle = false;
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

  get puedeEliminar() { return this.esMia || this.auth.esAdmin(); }

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
      this.esMia ? '¿Eliminar esta reseña?' : `¿Dar de baja la reseña de @${this.resena.autor?.nombreUsuario}?`,
      'Va a dejar de estar disponible para los demás lectores, junto con sus notas.',
      this.esMia ? 'Eliminar' : 'Dar de baja',
    );
    if (!acepto) return;

    this.api.eliminar(this.resena._id).subscribe({
      next: () => this.eliminada.emit(this.resena._id),
      error: (e) => this.modal.abrir('No pudimos eliminarla', e.error?.message ?? 'Error de conexión', 'error'),
    });
  }
}