import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'estrellas' })
export class EstrellasPipe implements PipeTransform {
  transform(calificacion: number | null | undefined, maximo = 5): string {
    const llenas = Math.max(0, Math.min(maximo, Math.round(calificacion ?? 0)));
    return '★'.repeat(llenas) + '☆'.repeat(maximo - llenas);
  }
}
