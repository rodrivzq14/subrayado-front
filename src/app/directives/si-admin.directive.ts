import { Directive, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { AuthService } from '../services/auth';

@Directive({ selector: '[appSiAdmin]' })
export class SiAdminDirective {
  private plantilla = inject(TemplateRef<unknown>);
  private contenedor = inject(ViewContainerRef);
  private auth = inject(AuthService);
  private visible = false;

  constructor() {
    effect(() => {
      const admin = this.auth.esAdmin();
      if (admin && !this.visible) {
        this.contenedor.createEmbeddedView(this.plantilla);
        this.visible = true;
      } else if (!admin && this.visible) {
        this.contenedor.clear();
        this.visible = false;
      }
    });
  }
}
