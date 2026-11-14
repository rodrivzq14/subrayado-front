import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { hoy, noFutura } from '../../validadores';

const PASS = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
const iguales = (g: AbstractControl) =>
  g.get('password')?.value === g.get('repetir')?.value ? null : { noCoinciden: true };

@Component({
  selector: 'app-formulario-usuario',
  imports: [ReactiveFormsModule],
  templateUrl: './formulario-usuario.html',
  styleUrl: './formulario-usuario.css',
})
export class FormularioUsuario {
  @Input() conPerfil = false;
  @Input() textoBoton = 'Registrarme';
  @Input() enviando = false;
  @Output() enviar = new EventEmitter<FormData>();

  private fb = inject(FormBuilder);
  imagen?: File;
  vista = '';
  hoy = hoy();

  form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    correo: ['', [Validators.required, Validators.email]],
    nombreUsuario: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.pattern(PASS)]],
    repetir: ['', Validators.required],
    fechaNacimiento: ['', [Validators.required, noFutura]],
    descripcion: ['', Validators.maxLength(300)],
    perfil: ['usuario'],
  }, { validators: iguales });

  invalido(c: string) {
    const x = this.form.get(c);
    return x?.invalid && x.touched;
  }

  onFile(e: Event) {
    this.imagen = (e.target as HTMLInputElement).files?.[0];
    this.vista = this.imagen ? URL.createObjectURL(this.imagen) : '';
  }

  confirmar() {
    if (this.form.invalid) return this.form.markAllAsTouched();
    const { repetir, perfil, ...datos } = this.form.getRawValue();
    const fd = new FormData();
    Object.entries(datos).forEach(([k, v]) => fd.append(k, v));
    if (this.conPerfil) fd.append('perfil', perfil);
    if (this.imagen) fd.append('imagenPerfil', this.imagen);
    this.enviar.emit(fd);
  }

  limpiar() {
    this.form.reset();
    this.imagen = undefined;
    this.vista = '';
  }
}
