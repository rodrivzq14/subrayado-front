import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Resena } from '../../components/resena/resena';
import { AuthService } from '../../services/auth';
import { PublicacionesService } from '../../services/publicaciones';

@Component({
  selector: 'app-mi-perfil',
  imports: [DatePipe, RouterLink, Resena],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})
export class MiPerfil implements OnInit {
  auth = inject(AuthService);
  private api = inject(PublicacionesService);

  resenas = signal<any[]>([]);
  cargando = signal(true);

  ngOnInit() {
    const u = this.auth.usuario();
    if (!u) return;
    this.api.listar({ usuario: u._id, orden: 'fecha', limit: 3 }).subscribe({
      next: (r) => {
        this.resenas.set(r.items);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  quitar(id: string) { this.resenas.update((l) => l.filter((r) => r._id !== id)); }
}