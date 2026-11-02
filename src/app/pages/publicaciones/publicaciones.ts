import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NuevaResena } from '../../components/nueva-resena/nueva-resena';
import { Resena } from '../../components/resena/resena';
import { ModalService } from '../../services/modal';
import { PublicacionesService } from '../../services/publicaciones';

const POR_PAGINA = 5;

@Component({
  selector: 'app-publicaciones',
  imports: [Resena, NuevaResena],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.css',
})
export class Publicaciones implements OnInit {
  private api = inject(PublicacionesService);
  private modal = inject(ModalService);

  resenas = signal<any[]>([]);
  total = signal(0);
  pagina = signal(1);
  orden = signal<'fecha' | 'meGusta'>('fecha');
  cargando = signal(true);
  mostrarForm = signal(false);
  totalPaginas = computed(() => Math.max(1, Math.ceil(this.total() / POR_PAGINA)));

  ngOnInit() { this.cargar(); }

  cargar() {
    this.cargando.set(true);
    this.api.listar({ orden: this.orden(), offset: (this.pagina() - 1) * POR_PAGINA, limit: POR_PAGINA }).subscribe({
      next: (r) => {
        this.resenas.set(r.items);
        this.total.set(r.total);
        this.cargando.set(false);
      },
      error: (e) => {
        this.cargando.set(false);
        this.modal.abrir('No pudimos cargar las reseñas', e.error?.message ?? 'Error de conexión', 'error');
      },
    });
  }

  cambiarOrden(valor: string) {
    this.orden.set(valor === 'meGusta' ? 'meGusta' : 'fecha');
    this.pagina.set(1);
    this.cargar();
  }

  irA(p: number) {
    this.pagina.set(p);
    this.cargar();
    window.scrollTo({ top: 0 });
  }

  alCrear() {
    this.mostrarForm.set(false);
    this.orden.set('fecha');
    this.pagina.set(1);
    this.cargar();
  }

  alEliminar() {
    // Si era la última de la página, volvemos a la anterior
    if (this.resenas().length === 1 && this.pagina() > 1) this.pagina.update((p) => p - 1);
    this.cargar();
  }
}