import { Component, Input, forwardRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl } from "@angular/forms";

@Component({
  selector: "app-text-input",
  templateUrl: "./text-input.component.html",
  styleUrls: ["./text-input.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextInputComponent),
      multi: true
    }
  ]
})
export class TextInputComponent implements ControlValueAccessor {
  @Input() label: string = "";
  @Input() placeholder: string = "";
  @Input() type: string = "text";
  @Input() maxLength?: number;
  @Input() disabled: boolean = false;
  @Input() control: FormControl = new FormControl();

  private _value: string = "";
  private onChange = (value: string) => {};
  private onTouched = () => {};

  inputId = `text-input-${Math.random().toString(36).substr(2, 9)}`;

  get value(): string {
    return this._value;
  }

  set value(val: string) {
    this._value = val;
    this.onChange(val);
    this.onTouched();
  }

  writeValue(value: string): void {
    this._value = value || "";
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
  }

  onBlur(): void {
    this.onTouched();
  }

  get inputClasses(): string {
    const classes = ['text-input-field'];
    
    if (this.disabled) {
      classes.push('text-input-field--disabled');
    }
    
    if (this.control?.invalid && (this.control?.dirty || this.control?.touched)) {
      classes.push('text-input-field--error');
    }
    
    return classes.join(' ');
  }

  get containerClasses(): string {
    const classes = ['text-input'];
    
    if (this.disabled) {
      classes.push('text-input--disabled');
    }
    
    return classes.join(' ');
  }
}