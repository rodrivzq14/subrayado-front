import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormularioUsuario } from '../../../components/formulario-usuario/formulario-usuario';
import { ImagenRespaldoDirective } from '../../../directives/imagen-respaldo.directive';
import { PluralizarPipe } from '../../../pipes/pluralizar.pipe';
import { AuthService } from '../../../services/auth';
import { ModalService } from '../../../services/modal';
import { UsuariosService } from '../../../services/usuarios';

@Component({
  selector: 'app-dashboard-usuarios',
  imports: [FormularioUsuario, PluralizarPipe, ImagenRespaldoDirective],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class DashboardUsuarios implements OnInit {
  private api = inject(UsuariosService);
  private modal = inject(ModalService);
  private auth = inject(AuthService);

  usuarios = signal<any[]>([]);
  cargando = signal(true);
  mostrarForm = signal(false);
  creando = signal(false);
  enProceso = signal<string | null>(null);
  busqueda = signal('');

  filtrados = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    if (!q) return this.usuarios();
    return this.usuarios().filter((u) =>
      [u.nombre, u.apellido, u.nombreUsuario, u.correo].join(' ').toLowerCase().includes(q),
    );
  });

  resumen = computed(() => ({
    total: this.usuarios().length,
    admins: this.usuarios().filter((u) => u.perfil === 'administrador').length,
    deshabilitados: this.usuarios().filter((u) => !u.activo).length,
  }));

  ngOnInit() {
    this.api.listar().subscribe({
      next: (lista) => {
        this.usuarios.set(lista);
        this.cargando.set(false);
      },
      error: (e) => {
        this.cargando.set(false);
        this.modal.abrir('No pudimos cargar los usuarios', e.error?.message ?? 'Error de conexión', 'error');
      },
    });
  }

  esYo(u: any) { return this.auth.usuario()?._id === u._id; }

  crear(fd: FormData) {
    this.creando.set(true);
    this.api.crear(fd).subscribe({
      next: (u) => {
        this.usuarios.update((l) => [u, ...l]);
        this.creando.set(false);
        this.mostrarForm.set(false);
        this.modal.abrir('Usuario creado', `@${u.nombreUsuario} ya puede ingresar con perfil ${u.perfil}.`, 'exito');
      },
      error: (e) => {
        this.creando.set(false);
        const m = e.error?.message;
        this.modal.abrir('No pudimos crear el usuario', Array.isArray(m) ? m.join('. ') : m ?? 'Error de conexión', 'error');
      },
    });
  }

  async cambiarEstado(u: any) {
    const deshabilitar = u.activo;
    const acepto = await this.modal.confirmar(
      deshabilitar ? `¿Deshabilitar a @${u.nombreUsuario}?` : `¿Habilitar a @${u.nombreUsuario}?`,
      deshabilitar
        ? 'No va a poder ingresar a la aplicación hasta que lo vuelvas a habilitar.'
        : 'Va a poder volver a ingresar a la aplicación.',
      deshabilitar ? 'Deshabilitar' : 'Habilitar',
    );
    if (!acepto) return;

    this.enProceso.set(u._id);
    const pedido = deshabilitar ? this.api.deshabilitar(u._id) : this.api.habilitar(u._id);
    pedido.subscribe({
      next: (r) => {
        this.usuarios.update((l) => l.map((x) => (x._id === r.usuario._id ? r.usuario : x)));
        this.enProceso.set(null);
        this.modal.abrir(r.mensaje, `@${u.nombreUsuario} quedó ${deshabilitar ? 'deshabilitado' : 'habilitado'}.`, 'exito');
      },
      error: (e) => {
        this.enProceso.set(null);
        this.modal.abrir('No pudimos cambiar el estado', e.error?.message ?? 'Error de conexión', 'error');
      },
    });
  }
}
