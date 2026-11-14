import { AbstractControl, ValidationErrors } from '@angular/forms';

export const hoy = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const noFutura = (c: AbstractControl): ValidationErrors | null =>
  c.value && c.value > hoy() ? { futura: true } : null;
