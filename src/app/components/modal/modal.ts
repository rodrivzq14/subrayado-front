import { Component, inject } from '@angular/core';
import { ModalService } from '../../services/modal';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.html',
})
export class Modal {
  modal = inject(ModalService);
}