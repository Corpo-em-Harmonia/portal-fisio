import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendaDia } from './agenda-dia';

describe('AgendaDia', () => {
  let component: AgendaDia;
  let fixture: ComponentFixture<AgendaDia>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgendaDia]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgendaDia);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
