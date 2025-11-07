import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TextInputComponent } from './text-input.component';
import { FormControl, Validators } from '@angular/forms';

describe('TextInputComponent', () => {
  let component: TextInputComponent;
  let fixture: ComponentFixture<TextInputComponent>;
  let inputElement: HTMLInputElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TextInputComponent]
    });
    fixture = TestBed.createComponent(TextInputComponent);
    component = fixture.componentInstance;
    inputElement = fixture.nativeElement.querySelector('input');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render with default properties', () => {
    expect(component.label).toBe('');
    expect(component.placeholder).toBe('');
    expect(component.type).toBe('text');
    expect(component.disabled).toBeFalse();
  });

  it('should display label when provided', () => {
    component.label = 'Test Label';
    fixture.detectChanges();
    
    const label = fixture.nativeElement.querySelector('label');
    expect(label.textContent.trim()).toBe('Test Label');
  });

  it('should not display label when not provided', () => {
    component.label = '';
    fixture.detectChanges();
    
    const label = fixture.nativeElement.querySelector('label');
    expect(label).toBeNull();
  });

  it('should set input attributes correctly', () => {
    component.placeholder = 'Enter text';
    component.type = 'email';
    component.maxLength = 100;
    fixture.detectChanges();
    
    expect(inputElement.placeholder).toBe('Enter text');
    expect(inputElement.type).toBe('email');
    expect(inputElement.maxLength).toBe(100);
  });

  it('should update value when input changes', () => {
    inputElement.value = 'test value';
    inputElement.dispatchEvent(new Event('input'));
    
    expect(component.value).toBe('test value');
  });

  it('should call onChange when value changes', () => {
    let changedValue: string;
    component.registerOnChange((value: string) => {
      changedValue = value;
    });
    
    inputElement.value = 'new value';
    inputElement.dispatchEvent(new Event('input'));
    
    expect(changedValue!).toBe('new value');
  });

  it('should call onTouched when input loses focus', () => {
    let touched = false;
    component.registerOnTouched(() => {
      touched = true;
    });
    
    inputElement.dispatchEvent(new Event('blur'));
    
    expect(touched).toBeTruthy();
  });

  it('should set value programmatically', () => {
    component.writeValue('programmatic value');
    fixture.detectChanges();
    
    expect(component.value).toBe('programmatic value');
  });

  it('should handle null value in writeValue', () => {
    component.writeValue(null as any);
    
    expect(component.value).toBe('');
  });

  it('should disable input when setDisabledState is called', () => {
    component.setDisabledState(true);
    fixture.detectChanges();
    
    expect(inputElement.disabled).toBeTruthy();
    expect(component.disabled).toBeTruthy();
  });

  it('should apply error class when form control has errors', () => {
    const control = new FormControl('', Validators.required);
    control.markAsTouched();
    component.control = control;
    fixture.detectChanges();
    
    expect(inputElement.className).toContain('text-input-field--error');
  });

  it('should not apply error class when form control is valid', () => {
    const control = new FormControl('valid value', Validators.required);
    component.control = control;
    fixture.detectChanges();
    
    expect(inputElement.className).not.toContain('text-input-field--error');
  });

  it('should apply disabled class when disabled', () => {
    component.disabled = true;
    fixture.detectChanges();
    
    expect(inputElement.className).toContain('text-input-field--disabled');
  });

  it('should show required error message', () => {
    const control = new FormControl('', Validators.required);
    control.markAsTouched();
    component.control = control;
    fixture.detectChanges();
    
    const errorMessage = fixture.nativeElement.querySelector('.error-message');
    expect(errorMessage.textContent.trim()).toBe('This field is required.');
  });

  it('should show max length error message', () => {
    const control = new FormControl('toolong', Validators.maxLength(5));
    control.markAsTouched();
    component.control = control;
    component.maxLength = 5;
    fixture.detectChanges();
    
    const errorMessage = fixture.nativeElement.querySelector('.error-message');
    expect(errorMessage.textContent.trim()).toBe('Maximum length of 5 characters exceeded.');
  });

  it('should show min length error message', () => {
    const control = new FormControl('ab', Validators.minLength(5));
    control.markAsTouched();
    component.control = control;
    fixture.detectChanges();
    
    const errorMessage = fixture.nativeElement.querySelector('.error-message');
    expect(errorMessage.textContent.trim()).toBe('Minimum length of 5 characters required.');
  });

  it('should show email error message', () => {
    const control = new FormControl('invalid-email', Validators.email);
    control.markAsTouched();
    component.control = control;
    fixture.detectChanges();
    
    const errorMessage = fixture.nativeElement.querySelector('.error-message');
    expect(errorMessage.textContent.trim()).toBe('Please enter a valid email address.');
  });

  it('should generate unique input ID', () => {
    const component1 = TestBed.createComponent(TextInputComponent).componentInstance;
    const component2 = TestBed.createComponent(TextInputComponent).componentInstance;
    
    expect(component1.inputId).not.toBe(component2.inputId);
    expect(component1.inputId).toContain('text-input-');
    expect(component2.inputId).toContain('text-input-');
  });
});