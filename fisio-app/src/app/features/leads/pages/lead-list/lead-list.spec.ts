import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadList } from './lead-list';

describe('LeadList', () => {
  let component: LeadList;
  let fixture: ComponentFixture<LeadList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeadList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeadList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
