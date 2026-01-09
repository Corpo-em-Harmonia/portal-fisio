import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCadastroComponent } from './modal-cadastro.component';

describe('ModalCadastroComponent', () => {
  let component: ModalCadastroComponent;
  let fixture: ComponentFixture<ModalCadastroComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalCadastroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalCadastroComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
