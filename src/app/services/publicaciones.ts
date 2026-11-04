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

  obtener(id: string) { return this.http.get<any>(`${API}/publicaciones/${id}`); }
  crear(datos: FormData) { return this.http.post<any>(`${API}/publicaciones`, datos); }
  eliminar(id: string) { return this.http.delete<any>(`${API}/publicaciones/${id}`); }
  darMeGusta(id: string) { return this.http.post<any>(`${API}/publicaciones/${id}/me-gusta`, {}); }
  quitarMeGusta(id: string) { return this.http.delete<any>(`${API}/publicaciones/${id}/me-gusta`); }

  listarComentarios(id: string, offset = 0, limit = 5) {
    const params = new HttpParams().set('offset', offset).set('limit', limit);
    return this.http.get<any>(`${API}/publicaciones/${id}/comentarios`, { params });
  }

  comentar(id: string, mensaje: string) {
    return this.http.post<any>(`${API}/publicaciones/${id}/comentarios`, { mensaje });
  }

  editarComentario(id: string, comentarioId: string, mensaje: string) {
    return this.http.put<any>(`${API}/publicaciones/${id}/comentarios/${comentarioId}`, { mensaje });
  }
}