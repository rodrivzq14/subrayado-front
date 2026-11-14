import { Pipe, PipeTransform } from '@angular/core';

const MINUTO = 60_000;
const HORA = 60 * MINUTO;
const DIA = 24 * HORA;

@Pipe({ name: 'tiempoRelativo' })
export class TiempoRelativoPipe implements PipeTransform {
  transform(fecha: string | Date | null | undefined): string {
    if (!fecha) return '';
    const momento = new Date(fecha);
    const pasado = Date.now() - momento.getTime();

    if (pasado < MINUTO) return 'hace instantes';
    if (pasado < HORA) return `hace ${Math.floor(pasado / MINUTO)} min`;
    if (pasado < DIA) return `hace ${Math.floor(pasado / HORA)} h`;
    if (pasado < 2 * DIA) return 'ayer';
    if (pasado < 7 * DIA) return `hace ${Math.floor(pasado / DIA)} días`;
    return momento.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
