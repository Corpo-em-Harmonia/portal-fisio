import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { AvaliacaoForm } from './avaliacao-form';

describe('AvaliacaoForm', () => {
  let component: AvaliacaoForm;
  let fixture: ComponentFixture<AvaliacaoForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvaliacaoForm],
      providers: [{ provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} } } }]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AvaliacaoForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
