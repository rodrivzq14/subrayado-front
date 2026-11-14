import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API } from '../api';

@Injectable({ providedIn: 'root' })
export class EstadisticasService {
  private http = inject(HttpClient);

  private pedir<T>(ruta: string, desde: string, hasta: string) {
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get<T>(`${API}/estadisticas/${ruta}`, { params });
  }

  publicacionesPorUsuario(desde: string, hasta: string) {
    return this.pedir<{ usuario: string; cantidad: number }[]>('publicaciones-por-usuario', desde, hasta);
  }

  comentariosPorDia(desde: string, hasta: string) {
    return this.pedir<{ total: number; dias: { fecha: string; cantidad: number }[] }>('comentarios-por-dia', desde, hasta);
  }

  comentariosPorPublicacion(desde: string, hasta: string) {
    return this.pedir<{ publicacion: string; cantidad: number }[]>('comentarios-por-publicacion', desde, hasta);
  }
}
