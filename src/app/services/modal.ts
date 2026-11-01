import { Injectable, signal } from '@angular/core';

export type TipoModal = 'exito' | 'error' | 'info';

@Injectable({ providedIn: 'root' })
export class ModalService {
  datos = signal<{ titulo: string; texto: string; tipo: TipoModal } | null>(null);
  abrir(titulo: string, texto: string, tipo: TipoModal = 'info') { this.datos.set({ titulo, texto, tipo }); }
  cerrar() { this.datos.set(null); }
}