import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormularioUsuario } from '../../components/formulario-usuario/formulario-usuario';
import { AuthService } from '../../services/auth';
import { ModalService } from '../../services/modal';

@Component({
  selector: 'app-registro',
  imports: [RouterLink, FormularioUsuario],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  private auth = inject(AuthService);
  private modal = inject(ModalService);
  private router = inject(Router);
  enviando = signal(false);

  registrar(fd: FormData) {
    this.enviando.set(true);
    this.auth.registro(fd).subscribe({
      next: () => {
        this.router.navigate(['/publicaciones']);
        this.modal.abrir('¡Bienvenido a Subrayado!', 'Tu cuenta fue creada y ya iniciaste sesión.', 'exito');
      },
      error: (e) => {
        this.enviando.set(false);
        const m = e.error?.message;
        this.modal.abrir('No pudimos registrarte', Array.isArray(m) ? m.join('. ') : m ?? 'Error de conexión', 'error');
      },
    });
  }
}
