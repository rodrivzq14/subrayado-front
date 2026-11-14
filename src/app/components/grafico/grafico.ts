import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, ViewChild } from '@angular/core';
import Chart from 'chart.js/auto';

export type TipoGrafico = 'bar' | 'line' | 'pie' | 'doughnut';

const VERDE = '#2F5D50';
const COLORES = ['#2F5D50', '#C8963E', '#7A2E3A', '#4F7CAC', '#81B29A', '#D9822B', '#6A4C93', '#3D405B'];

Chart.defaults.font.family = 'Inter, sans-serif';
Chart.defaults.color = '#3B2A20b3';

@Component({
  selector: 'app-grafico',
  template: '<div class="lienzo"><canvas #lienzo [attr.aria-label]="nombre" role="img"></canvas></div>',
  styles: ':host { display:block; } .lienzo { position:relative; height:280px; }',
})
export class Grafico implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) tipo!: TipoGrafico;
  @Input() etiquetas: string[] = [];
  @Input() valores: number[] = [];
  @Input() nombre = '';
  @ViewChild('lienzo') lienzo?: ElementRef<HTMLCanvasElement>;

  private grafico?: Chart;

  ngAfterViewInit() { this.dibujar(); }
  ngOnChanges() { if (this.lienzo) this.dibujar(); }
  ngOnDestroy() { this.grafico?.destroy(); }

  private dibujar() {
    this.grafico?.destroy();
    const circular = this.tipo === 'pie' || this.tipo === 'doughnut';
    const linea = this.tipo === 'line';

    this.grafico = new Chart(this.lienzo!.nativeElement, {
      type: this.tipo,
      data: {
        labels: this.etiquetas,
        datasets: [{
          label: this.nombre,
          data: this.valores,
          backgroundColor: circular ? COLORES : linea ? '#2F5D5026' : VERDE,
          borderColor: circular ? '#FFFBF4' : VERDE,
          borderWidth: 2,
          borderRadius: this.tipo === 'bar' ? 6 : 0,
          fill: linea,
          tension: 0.3,
          pointRadius: linea ? 3 : 0,
          pointBackgroundColor: VERDE,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: circular, position: 'bottom' } },
        scales: circular
          ? {}
          : {
              y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#3B2A2014' } },
              x: { grid: { display: false } },
            },
      },
    });
  }
}
