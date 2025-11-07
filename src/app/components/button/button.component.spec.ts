import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;
  let buttonElement: HTMLButtonElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ButtonComponent]
    });
    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    buttonElement = fixture.nativeElement.querySelector('button');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render with default properties', () => {
    expect(component.size).toBe('medium');
    expect(component.variant).toBe('primary');
    expect(component.disabled).toBeFalse();
    expect(component.loading).toBeFalse();
    expect(component.type).toBe('button');
  });

  it('should apply correct CSS classes for primary variant', () => {
    component.variant = 'primary';
    component.size = 'large';
    fixture.detectChanges();
    
    expect(buttonElement.className).toContain('btn--primary');
    expect(buttonElement.className).toContain('btn--large');
  });

  it('should apply correct CSS classes for secondary variant', () => {
    component.variant = 'secondary';
    fixture.detectChanges();
    
    expect(buttonElement.className).toContain('btn--secondary');
  });

  it('should apply disabled class when disabled', () => {
    component.disabled = true;
    fixture.detectChanges();
    
    expect(buttonElement.className).toContain('btn--disabled');
    expect(buttonElement.disabled).toBeTruthy();
  });

  it('should apply loading class when loading', () => {
    component.loading = true;
    fixture.detectChanges();
    
    expect(buttonElement.className).toContain('btn--loading');
    expect(buttonElement.disabled).toBeTruthy();
  });

  it('should emit clicked event when clicked and not disabled', () => {
    spyOn(component.clicked, 'emit');
    
    buttonElement.click();
    
    expect(component.clicked.emit).toHaveBeenCalledWith(jasmine.any(MouseEvent));
  });

  it('should not emit clicked event when disabled', () => {
    spyOn(component.clicked, 'emit');
    component.disabled = true;
    fixture.detectChanges();
    
    buttonElement.click();
    
    expect(component.clicked.emit).not.toHaveBeenCalled();
  });

  it('should not emit clicked event when loading', () => {
    spyOn(component.clicked, 'emit');
    component.loading = true;
    fixture.detectChanges();
    
    buttonElement.click();
    
    expect(component.clicked.emit).not.toHaveBeenCalled();
  });

  it('should render content projection', () => {
    fixture = TestBed.createComponent(ButtonComponent);
    fixture.nativeElement.innerHTML = '<app-button>Test Content</app-button>';
    fixture.detectChanges();
    
    expect(fixture.nativeElement.textContent).toContain('Test Content');
  });

  it('should apply text transform classes', () => {
    component.transform = 'uppercase';
    fixture.detectChanges();
    
    expect(buttonElement.className).toContain('btn--transform-uppercase');
  });

  it('should apply full width class', () => {
    component.fullWidth = true;
    fixture.detectChanges();
    
    expect(buttonElement.className).toContain('btn--full-width');
  });

  it('should show spinner when loading', () => {
    component.loading = true;
    fixture.detectChanges();
    
    const spinner = fixture.nativeElement.querySelector('.btn__spinner');
    expect(spinner).toBeTruthy();
  });
});