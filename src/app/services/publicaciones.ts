import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API } from '../api';

@Injectable({ providedIn: 'root' })
export class PublicacionesService {
  private http = inject(HttpClient);

  listar(p: { orden?: string; usuario?: string; offset?: number; limit?: number }) {
    let params = new HttpParams();
    Object.entries(p).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params = params.set(k, String(v));
    });
    return this.http.get<any>(`${API}/publicaciones`, { params });
  }

  crear(datos: FormData) { return this.http.post<any>(`${API}/publicaciones`, datos); }
  eliminar(id: string) { return this.http.delete<any>(`${API}/publicaciones/${id}`); }
  darMeGusta(id: string) { return this.http.post<any>(`${API}/publicaciones/${id}/me-gusta`, {}); }
  quitarMeGusta(id: string) { return this.http.delete<any>(`${API}/publicaciones/${id}/me-gusta`); }
}