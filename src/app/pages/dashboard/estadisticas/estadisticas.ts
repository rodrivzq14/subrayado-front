import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Grafico } from '../../../components/grafico/grafico';
import { PluralizarPipe } from '../../../pipes/pluralizar.pipe';
import { EstadisticasService } from '../../../services/estadisticas';
import { ModalService } from '../../../services/modal';

interface Serie { etiquetas: string[]; valores: number[]; }

const fechaLocal = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const haceDias = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return fechaLocal(d);
};

@Component({
  selector: 'app-dashboard-estadisticas',
  imports: [Grafico, PluralizarPipe],
  templateUrl: './estadisticas.html',
  styleUrl: './estadisticas.css',
})
export class DashboardEstadisticas implements OnInit {
  private api = inject(EstadisticasService);
  private modal = inject(ModalService);

  atajos = [7, 30, 90];
  hoy = fechaLocal(new Date());
  desde = signal(haceDias(29));
  hasta = signal(this.hoy);
  cargando = signal(false);
  error = signal('');

  porUsuario = signal<Serie>({ etiquetas: [], valores: [] });
  porDia = signal<Serie>({ etiquetas: [], valores: [] });
  porPublicacion = signal<Serie>({ etiquetas: [], valores: [] });
  totalComentarios = signal(0);

  atajoActivo = computed(() =>
    this.hasta() === this.hoy ? this.atajos.find((n) => this.desde() === haceDias(n - 1)) : undefined,
  );

  ngOnInit() { this.cargar(); }

  elegirAtajo(dias: number) {
    this.desde.set(haceDias(dias - 1));
    this.hasta.set(this.hoy);
    this.cargar();
  }

  cambiar(campo: 'desde' | 'hasta', valor: string) {
    if (!valor) return;
    this[campo].set(valor);
    this.cargar();
  }

  cargar() {
    if (this.desde() > this.hasta()) {
      this.error.set('La fecha "desde" no puede ser posterior a "hasta".');
      return;
    }
    this.error.set('');
    this.cargando.set(true);
    const [d, h] = [this.desde(), this.hasta()];

    forkJoin([
      this.api.publicacionesPorUsuario(d, h),
      this.api.comentariosPorDia(d, h),
      this.api.comentariosPorPublicacion(d, h),
    ]).subscribe({
      next: ([usuarios, dias, publicaciones]) => {
        this.porUsuario.set({ etiquetas: usuarios.map((u) => `@${u.usuario}`), valores: usuarios.map((u) => u.cantidad) });
        this.porDia.set({
          etiquetas: dias.dias.map((x) => `${x.fecha.slice(8, 10)}/${x.fecha.slice(5, 7)}`),
          valores: dias.dias.map((x) => x.cantidad),
        });
        this.totalComentarios.set(dias.total);
        this.porPublicacion.set({
          etiquetas: publicaciones.map((p) => p.publicacion),
          valores: publicaciones.map((p) => p.cantidad),
        });
        this.cargando.set(false);
      },
      error: (e) => {
        this.cargando.set(false);
        const m = e.error?.message;
        this.modal.abrir('No pudimos cargar las estadísticas', Array.isArray(m) ? m.join('. ') : m ?? 'Error de conexión', 'error');
      },
    });
  }
}
