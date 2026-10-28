import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { tap } from 'rxjs';

const API = 'https://subrayado-back.onrender.com';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  usuario = signal<any>(JSON.parse(localStorage.getItem('usuario') ?? 'null'));

  registro(datos: FormData) {
    return this.http.post<any>(`${API}/autenticacion/registro`, datos);
  }

  login(datos: { identificador: string; password: string }) {
    return this.http.post<any>(`${API}/autenticacion/login`, datos).pipe(
      tap((r) => {
        localStorage.setItem('token', r.token);
        localStorage.setItem('usuario', JSON.stringify(r.usuario));
        this.usuario.set(r.usuario);
      }),
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.usuario.set(null);
  }
}