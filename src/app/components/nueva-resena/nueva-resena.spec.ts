import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NuevaResena } from './nueva-resena';

describe('NuevaResena', () => {
  let component: NuevaResena;
  let fixture: ComponentFixture<NuevaResena>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NuevaResena],
    }).compileComponents();

    fixture = TestBed.createComponent(NuevaResena);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
