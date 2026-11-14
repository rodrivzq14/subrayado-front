import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API } from '../api';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private http = inject(HttpClient);

  listar() { return this.http.get<any[]>(`${API}/usuarios`); }
  crear(datos: FormData) { return this.http.post<any>(`${API}/usuarios`, datos); }
  deshabilitar(id: string) { return this.http.delete<any>(`${API}/usuarios/${id}`); }
  habilitar(id: string) { return this.http.post<any>(`${API}/usuarios/${id}/habilitar`, {}); }
  actualizarPerfil(datos: FormData) { return this.http.put<any>(`${API}/usuarios/mi-perfil`, datos); }
}
