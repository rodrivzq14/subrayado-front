import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Resena } from '../../components/resena/resena';
import { AuthService } from '../../services/auth';
import { ModalService } from '../../services/modal';
import { PublicacionesService } from '../../services/publicaciones';

const POR_CARGA = 5;

@Component({
  selector: 'app-publicacion',
  imports: [DatePipe, RouterLink, Resena],
  templateUrl: './publicacion.html',
  styleUrl: './publicacion.css',
})
export class Publicacion implements OnInit {
  private ruta = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(PublicacionesService);
  private modal = inject(ModalService);
  private auth = inject(AuthService);

  id = this.ruta.snapshot.paramMap.get('id') ?? '';
  resena = signal<any>(null);
  cargando = signal(true);

  comentarios = signal<any[]>([]);
  total = signal(0);
  cargandoMas = signal(false);

  texto = signal('');
  enviando = signal(false);

  editandoId = signal<string | null>(null);
  edicion = signal('');
  guardando = signal(false);

  puedeEnviar = computed(() => this.texto().trim().length > 0 && !this.enviando());
  puedeGuardar = computed(() => this.edicion().trim().length > 0 && !this.guardando());
  quedan = computed(() => this.total() - this.comentarios().length);

  ngOnInit() {
    this.api.obtener(this.id).subscribe({
      next: (r) => {
        this.resena.set(r);
        this.cargando.set(false);
        this.cargarComentarios();
      },
      error: (e) => {
        this.cargando.set(false);
        if (![400, 401, 404].includes(e.status)) {
          this.modal.abrir('No pudimos cargar la reseña', e.error?.message ?? 'Error de conexión', 'error');
        }
      },
    });
  }

  // Se usa para la primera carga y para "Cargar más": agrega sin quitar las anteriores
  cargarComentarios() {
    this.cargandoMas.set(true);
    this.api.listarComentarios(this.id, this.comentarios().length, POR_CARGA).subscribe({
      next: (r) => {
        const existentes = new Set(this.comentarios().map((c) => c._id));
        this.comentarios.update((l) => [...l, ...r.items.filter((c: any) => !existentes.has(c._id))]);
        this.total.set(r.total);
        this.cargandoMas.set(false);
      },
      error: (e) => {
        this.cargandoMas.set(false);
        this.modal.abrir('No pudimos cargar las notas', e.error?.message ?? 'Error de conexión', 'error');
      },
    });
  }

  comentar() {
    if (!this.puedeEnviar()) return;
    this.enviando.set(true);
    this.api.comentar(this.id, this.texto().trim()).subscribe({
      next: (nuevo) => {
        this.comentarios.update((l) => [nuevo, ...l]);
        this.total.update((t) => t + 1);
        this.texto.set('');
        this.enviando.set(false);
      },
      error: (e) => {
        this.enviando.set(false);
        const m = e.error?.message;
        this.modal.abrir('No pudimos publicar tu nota', Array.isArray(m) ? m.join('. ') : m ?? 'Error de conexión', 'error');
      },
    });
  }

  esMio(c: any) { return this.auth.usuario()?._id === c.autor?._id; }

  empezarEdicion(c: any) {
    this.editandoId.set(c._id);
    this.edicion.set(c.mensaje);
  }

  cancelarEdicion() { this.editandoId.set(null); }

  guardarEdicion(c: any) {
    if (!this.puedeGuardar()) return;
    this.guardando.set(true);
    this.api.editarComentario(this.id, c._id, this.edicion().trim()).subscribe({
      next: (editado) => {
        this.comentarios.update((l) => l.map((x) => (x._id === editado._id ? editado : x)));
        this.editandoId.set(null);
        this.guardando.set(false);
      },
      error: (e) => {
        this.guardando.set(false);
        const m = e.error?.message;
        this.modal.abrir('No pudimos guardar el cambio', Array.isArray(m) ? m.join('. ') : m ?? 'Error de conexión', 'error');
      },
    });
  }

  alEliminar() { this.router.navigate(['/publicaciones']); }
}