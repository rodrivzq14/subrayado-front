import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ModalService } from '../../services/modal';

@Component({
  selector: 'app-cargando',
  templateUrl: './cargando.html',
  styleUrl: './cargando.css',
})
export class Cargando implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  private router = inject(Router);
  private modal = inject(ModalService);

  lento = signal(false);
  private espera?: ReturnType<typeof setTimeout>;

  ngOnInit() {
    if (!this.auth.token()) {
      this.router.navigate(['/login']);
      return;
    }

    // El servidor gratuito puede estar dormido: si tarda, se lo avisamos al usuario
    this.espera = setTimeout(() => this.lento.set(true), 4000);

    this.auth.autorizar().subscribe({
      next: () => this.router.navigate(['/publicaciones']),
      error: (e) => {
        if (e.status === 401) return; // el interceptor ya cerró la sesión y llevó al login
        this.auth.logout();
        this.router.navigate(['/login']);
        this.modal.abrir('No pudimos conectar con el servidor', 'Probá de nuevo en unos minutos.', 'error');
      },
    });
  }

  ngOnDestroy() { clearTimeout(this.espera); }
}