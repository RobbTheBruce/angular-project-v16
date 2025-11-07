import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RadioComponent, RadioOption } from './radio.component';
import { FormsModule } from '@angular/forms';

describe('RadioComponent', () => {
  let component: RadioComponent;
  let fixture: ComponentFixture<RadioComponent>;

  const mockOptions: RadioOption[] = [
    { id: 'option1', value: 'value1', label: 'Option 1' },
    { id: 'option2', value: 'value2', label: 'Option 2' },
    { id: 'option3', value: 'value3', label: 'Option 3' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RadioComponent],
      imports: [FormsModule]
    });
    fixture = TestBed.createComponent(RadioComponent);
    component = fixture.componentInstance;
    component.options = mockOptions;
    component.name = 'test-radio';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render all radio options', () => {
    const radioItems = fixture.nativeElement.querySelectorAll('.radio-item');
    expect(radioItems.length).toBe(3);
  });

  it('should render correct labels', () => {
    const labels = fixture.nativeElement.querySelectorAll('label');
    expect(labels[0].textContent.trim()).toBe('Option 1');
    expect(labels[1].textContent.trim()).toBe('Option 2');
    expect(labels[2].textContent.trim()).toBe('Option 3');
  });

  it('should set correct input attributes', () => {
    const inputs = fixture.nativeElement.querySelectorAll('input[type="radio"]');
    expect(inputs[0].id).toBe('option1');
    expect(inputs[0].value).toBe('value1');
    expect(inputs[0].name).toBe('test-radio');
  });

  it('should update value when radio is selected', () => {
    const secondRadio = fixture.nativeElement.querySelector('#option2');
    secondRadio.click();
    fixture.detectChanges();
    
    expect(component.value).toBe('value2');
  });

  it('should check the correct radio when value is set programmatically', () => {
    component.writeValue('value2');
    fixture.detectChanges();
    
    const secondRadio = fixture.nativeElement.querySelector('#option2');
    expect(secondRadio.checked).toBeTruthy();
  });

  it('should call onChange when value changes', () => {
    let changedValue: string;
    component.registerOnChange((value: string) => {
      changedValue = value;
    });
    
    component.onRadioChange('value3');
    
    expect(changedValue!).toBe('value3');
  });

  it('should call onTouched when value changes', () => {
    let touched = false;
    component.registerOnTouched(() => {
      touched = true;
    });
    
    component.onRadioChange('value1');
    
    expect(touched).toBeTruthy();
  });

  it('should disable all radios when disabled', () => {
    component.setDisabledState(true);
    fixture.detectChanges();
    
    const inputs = fixture.nativeElement.querySelectorAll('input[type="radio"]');
    inputs.forEach((input: HTMLInputElement) => {
      expect(input.disabled).toBeTruthy();
    });
  });

  it('should not change value when disabled and radio is clicked', () => {
    component.disabled = true;
    const initialValue = component.value;
    
    component.onRadioChange('value2');
    
    expect(component.value).toBe(initialValue);
  });

  it('should apply disabled CSS class when disabled', () => {
    component.disabled = true;
    fixture.detectChanges();
    
    const radioBtn = fixture.nativeElement.querySelector('.radio-btn');
    expect(radioBtn.className).toContain('radio-btn--disabled');
  });

  it('should handle empty options array', () => {
    component.options = [];
    fixture.detectChanges();
    
    const radioItems = fixture.nativeElement.querySelectorAll('.radio-item');
    expect(radioItems.length).toBe(0);
  });

  it('should clear value when writeValue is called with empty value', () => {
    component.value = 'value1';
    component.writeValue('');
    
    expect(component.value).toBe('');
  });
});