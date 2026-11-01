import { Component, HostListener, inject } from '@angular/core';
import { ModalService } from '../../services/modal';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal {
  modal = inject(ModalService);

  @HostListener('document:keydown.escape')
  cerrarConEsc() { this.modal.cerrar(); }
}