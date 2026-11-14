import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'pluralizar' })
export class PluralizarPipe implements PipeTransform {
  transform(cantidad: number | null | undefined, singular: string, plural = `${singular}s`): string {
    const n = cantidad ?? 0;
    return `${n} ${n === 1 ? singular : plural}`;
  }
}
