import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadsAvaliacoes } from './leads-avaliacoes';

describe('LeadsAvaliacoes', () => {
  let component: LeadsAvaliacoes;
  let fixture: ComponentFixture<LeadsAvaliacoes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeadsAvaliacoes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeadsAvaliacoes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
