import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ModalService {
  datos = signal<{ titulo: string; texto: string } | null>(null);
  abrir(titulo: string, texto: string) { this.datos.set({ titulo, texto }); }
  cerrar() { this.datos.set(null); }
}