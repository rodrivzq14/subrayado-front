import { AfterViewInit, Directive, ElementRef, inject } from '@angular/core';

@Directive({ selector: 'input[appAutofoco], textarea[appAutofoco]' })
export class AutofocoDirective implements AfterViewInit {
  private campo = inject<ElementRef<HTMLInputElement | HTMLTextAreaElement>>(ElementRef);

  ngAfterViewInit() {
    setTimeout(() => {
      const el = this.campo.nativeElement;
      el.focus();
      try {
        el.setSelectionRange(el.value.length, el.value.length);
      } catch {
        return;
      }
    });
  }
}
