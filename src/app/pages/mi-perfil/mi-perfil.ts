import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Resena } from '../../components/resena/resena';
import { ImagenRespaldoDirective } from '../../directives/imagen-respaldo.directive';
import { TiempoRelativoPipe } from '../../pipes/tiempo-relativo.pipe';
import { AuthService } from '../../services/auth';
import { PublicacionesService } from '../../services/publicaciones';

@Component({
  selector: 'app-mi-perfil',
  imports: [DatePipe, RouterLink, Resena, TiempoRelativoPipe, ImagenRespaldoDirective],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})
export class MiPerfil implements OnInit {
  auth = inject(AuthService);
  private api = inject(PublicacionesService);

  resenas = signal<any[]>([]);
  notas = signal<Record<string, { items: any[]; total: number }>>({});
  cargando = signal(true);

  ngOnInit() {
    const u = this.auth.usuario();
    if (!u) return;
    this.api.listar({ usuario: u._id, orden: 'fecha', limit: 3 }).subscribe({
      next: (r) => {
        this.resenas.set(r.items);
        this.cargando.set(false);
        // Las primeras notas de cada una de mis últimas reseñas
        r.items.forEach((p: any) =>
          this.api.listarComentarios(p._id, 0, 3).subscribe((c) =>
            this.notas.update((m) => ({ ...m, [p._id]: { items: c.items, total: c.total } })),
          ),
        );
      },
      error: () => this.cargando.set(false),
    });
  }

  quitar(id: string) { this.resenas.update((l) => l.filter((r) => r._id !== id)); }
}