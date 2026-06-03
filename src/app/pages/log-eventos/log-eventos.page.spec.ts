import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LogEventosPage } from './log-eventos.page';

describe('LogEventosPage', () => {
  let component: LogEventosPage;
  let fixture: ComponentFixture<LogEventosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LogEventosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
