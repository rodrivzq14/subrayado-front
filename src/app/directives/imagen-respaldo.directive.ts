import { Directive, ElementRef, HostListener, inject } from '@angular/core';

const RESPALDO =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300">' +
      '<rect width="200" height="300" fill="#E8DFD2"/>' +
      '<path d="M70 120h60v70H70z" fill="none" stroke="#3B2A2066" stroke-width="6"/>' +
      '<path d="M78 180l18-22 14 14 10-10 12 18" fill="none" stroke="#3B2A2066" stroke-width="6"/>' +
      '<text x="100" y="225" text-anchor="middle" font-family="Inter, sans-serif" font-size="15" fill="#3B2A2099">Imagen no disponible</text>' +
    '</svg>',
  );

@Directive({ selector: 'img[appImagenRespaldo]' })
export class ImagenRespaldoDirective {
  private img = inject<ElementRef<HTMLImageElement>>(ElementRef);
  private reemplazada = false;

  @HostListener('error')
  alFallar() {
    if (this.reemplazada) return;
    this.reemplazada = true;
    this.img.nativeElement.src = RESPALDO;
    this.img.nativeElement.alt = 'Imagen no disponible';
  }
}
