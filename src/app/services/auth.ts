import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { API } from '../api';
import { ModalService } from './modal';

const AVISO = 2 / 3;

const duracionDelToken = (token: string | null) => {
  try {
    const base64 = token!.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const { iat, exp } = JSON.parse(atob(base64));
    return (exp - iat) * 1000;
  } catch {
    return 0;
  }
};

const duracion = (ms: number) => {
  const total = Math.max(Math.round(ms / 1000), 0);
  const min = Math.floor(total / 60);
  const seg = total % 60;
  const partes = [];
  if (min) partes.push(`${min} ${min === 1 ? 'minuto' : 'minutos'}`);
  if (seg || !min) partes.push(`${seg} ${seg === 1 ? 'segundo' : 'segundos'}`);
  return partes.join(' y ');
};

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

  // Lo llama el interceptor ante un 401
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
    const vence = duracionDelToken(this.token());
    if (!vence) return;
    const falta = (ms: number) => Math.max(desde + ms - Date.now(), 0);
    this.temporizadores = [
      setTimeout(() => this.avisar(), falta(vence * AVISO)),
      setTimeout(() => this.verificarVencimiento(), falta(vence) + 1000),
    ];
  }

  private verificarVencimiento() {
    this.http.post(`${API}/autenticacion/autorizar`, {}).subscribe({
      next: () => this.temporizadores.push(setTimeout(() => this.verificarVencimiento(), 2000)),
      error: () => this.sesionVencida(),
    });
  }

  private limpiarTemporizadores() {
    this.temporizadores.forEach(clearTimeout);
    this.temporizadores = [];
  }

  private async avisar() {
    const restante = Number(localStorage.getItem('sesionDesde')) + duracionDelToken(this.token()) - Date.now();
    const extender = await this.modal.confirmar(
      'Tu sesión está por vencer',
      `Tu sesión vence en ${duracion(restante)}. ¿Querés extenderla?`,
      'Extender sesión',
      'No, gracias',
    );
    if (!extender) return;
    this.refrescar().subscribe({
      next: () => this.modal.abrir('Sesión extendida', `Tenés ${duracion(duracionDelToken(this.token()))} más.`, 'exito'),
      error: (e) => {
        if (e.status !== 401) this.modal.abrir('No pudimos extender la sesión', 'Probá de nuevo en unos minutos.', 'error');
      },
    });
  }
}