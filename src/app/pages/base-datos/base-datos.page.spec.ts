import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BaseDatosPage } from './base-datos.page';

describe('BaseDatosPage', () => {
  let component: BaseDatosPage;
  let fixture: ComponentFixture<BaseDatosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseDatosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
