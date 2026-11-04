import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { API } from '../api';
import { ModalService } from './modal';

const MINUTO = 60_000;
const AVISO_A = 10 * MINUTO; // a los 10 minutos se ofrece extender la sesión
const VENCE_A = 15 * MINUTO; // el token vence a los 15 minutos

const leerUsuario = () => {
  try { return JSON.parse(localStorage.getItem('usuario') ?? 'null'); } catch { return null; }
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private modal = inject(ModalService);

  token = signal<string | null>(localStorage.getItem('token'));
  usuario = signal<any>(leerUsuario());
  validada = signal(false); // true cuando el token ya se validó en esta carga de la app
  private temporizadores: ReturnType<typeof setTimeout>[] = [];

  registro(datos: FormData) {
    return this.http.post<any>(`${API}/autenticacion/registro`, datos).pipe(tap((r) => this.iniciarSesion(r)));
  }

  login(datos: { identificador: string; password: string }) {
    return this.http.post<any>(`${API}/autenticacion/login`, datos).pipe(tap((r) => this.iniciarSesion(r)));
  }

  // Se usa al abrir la app: valida el token guardado y trae los datos frescos del usuario
  autorizar() {
    return this.http.post<any>(`${API}/autenticacion/autorizar`, {}).pipe(
      tap((r) => {
        localStorage.setItem('usuario', JSON.stringify(r.usuario));
        this.usuario.set(r.usuario);
        this.validada.set(true);
        this.programar();
      }),
    );
  }

  refrescar() {
    return this.http.post<any>(`${API}/autenticacion/refrescar`, {}).pipe(
      tap((r) => {
        localStorage.setItem('token', r.token);
        localStorage.setItem('sesionDesde', String(Date.now()));
        this.token.set(r.token);
        this.programar();
      }),
    );
  }

  logout() {
    this.limpiarTemporizadores();
    ['token', 'usuario', 'sesionDesde'].forEach((k) => localStorage.removeItem(k));
    this.token.set(null);
    this.usuario.set(null);
    this.validada.set(false);
  }

  // Lo llama el interceptor ante un 401 y el temporizador cuando el token ya venció
  sesionVencida() {
    if (!this.token()) return;
    this.logout();
    this.router.navigate(['/login']);
    this.modal.abrir('Tu sesión venció', 'Ingresá de nuevo para seguir leyendo.', 'info');
  }

  private iniciarSesion(r: { token: string; usuario: any }) {
    localStorage.setItem('token', r.token);
    localStorage.setItem('usuario', JSON.stringify(r.usuario));
    localStorage.setItem('sesionDesde', String(Date.now()));
    this.token.set(r.token);
    this.usuario.set(r.usuario);
    this.validada.set(true);
    this.programar();
  }

  private programar() {
    this.limpiarTemporizadores();
    let desde = Number(localStorage.getItem('sesionDesde'));
    if (!desde) {
      desde = Date.now();
      localStorage.setItem('sesionDesde', String(desde));
    }
    const falta = (ms: number) => Math.max(desde + ms - Date.now(), 0);
    this.temporizadores = [
      setTimeout(() => this.avisar(), falta(AVISO_A)),
      setTimeout(() => this.sesionVencida(), falta(VENCE_A)),
    ];
  }

  private limpiarTemporizadores() {
    this.temporizadores.forEach(clearTimeout);
    this.temporizadores = [];
  }

  private async avisar() {
    const extender = await this.modal.confirmar(
      'Tu sesión está por vencer',
      'Quedan 5 minutos de sesión. ¿Querés extenderla?',
      'Extender sesión',
      'No, gracias',
    );
    if (!extender) return;
    this.refrescar().subscribe({
      next: () => this.modal.abrir('Sesión extendida', 'Tenés 15 minutos más.', 'exito'),
      error: (e) => {
        if (e.status !== 401) this.modal.abrir('No pudimos extender la sesión', 'Probá de nuevo en unos minutos.', 'error');
      },
    });
  }
}