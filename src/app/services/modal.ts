import { Injectable, signal } from '@angular/core';

export type TipoModal = 'exito' | 'error' | 'info';

interface DatosModal {
  titulo: string;
  texto: string;
  tipo: TipoModal;
  confirmar: boolean;
  boton: string;
  cancelar: string;
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  datos = signal<DatosModal | null>(null);
  private resolver?: (acepto: boolean) => void;

  abrir(titulo: string, texto: string, tipo: TipoModal = 'info') {
    this.cerrar();
    this.datos.set({ titulo, texto, tipo, confirmar: false, boton: 'Entendido', cancelar: '' });
  }

  confirmar(titulo: string, texto: string, boton = 'Confirmar', cancelar = 'Cancelar'): Promise<boolean> {
    this.cerrar();
    return new Promise((resolver) => {
      this.resolver = resolver;
      this.datos.set({ titulo, texto, tipo: 'info', confirmar: true, boton, cancelar });
    });
  }

  cerrar(acepto = false) {
    this.datos.set(null);
    this.resolver?.(acepto);
    this.resolver = undefined;
  }
}