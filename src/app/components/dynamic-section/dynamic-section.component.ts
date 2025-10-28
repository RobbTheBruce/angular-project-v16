import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Subject, debounceTime, takeUntil, distinctUntilChanged } from 'rxjs';
import { Field, Section, SaveState, AutoSaveConfig } from '../../types/form.types';
import { ApiService } from '../../services/api/api.service';

@Component({
  selector: 'app-dynamic-section',
  templateUrl: './dynamic-section.component.html',
  styleUrls: ['./dynamic-section.component.scss']
})
export class DynamicSectionComponent implements OnInit, OnDestroy {
  @Input() section!: Section;
  @Input() requestId?: number;
  @Input() showNextButton = true;
  @Input() showPreviousButton = true;
  @Input() showSubmitButton = false;
  @Input() isSubmitting = false;
  @Input() autoSaveConfig: AutoSaveConfig = {
    enabled: true,
    interval: 2000,
    retryAttempts: 2
  };

  @Output() next = new EventEmitter<any>();
  @Output() previous = new EventEmitter<any>();
  @Output() submit = new EventEmitter<any>();

  sectionForm: FormGroup;
  saveState: SaveState = { status: 'idle' };
  private destroy$ = new Subject<void>();
  private saveRetryCount = 0;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService
  ) {
    this.sectionForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.buildForm();
    this.setupAutoSave();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildForm(): void {
    const formControls: any = {};

    this.section.fields.forEach(field => {
      const validators = [];
      
      if (field.required) {
        validators.push(Validators.required);
      }

      if (field.type === 'number') {
        validators.push(Validators.pattern(/^\d+$/));
      }

      const defaultValue = field.value ?? field.default ?? this.getDefaultValueForType(field.type);
      const fieldKey = typeof field.id === 'string' ? field.id : field.id.toString();
      formControls[fieldKey] = [defaultValue, validators];
    });

    this.sectionForm = this.fb.group(formControls);
  }

  private getDefaultValueForType(type: string): any {
    switch (type) {
      case 'number':
        return 0;
      case 'toggle':
        return false;
      case 'radio':
        return '';
      case 'text':
      default:
        return '';
    }
  }

  private setupAutoSave(): void {
    if (!this.autoSaveConfig.enabled || !this.requestId) {
      return;
    }

    this.sectionForm.valueChanges.pipe(
      debounceTime(this.autoSaveConfig.interval),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(formValue => {
      this.autoSaveFields(formValue);
    });
  }

  private autoSaveFields(formValue: any): void {
    this.saveState = { status: 'saving', message: 'Saving...' };
    this.saveRetryCount = 0;

    Object.keys(formValue).forEach(fieldId => {
      const field = this.section.fields.find(f => 
        (typeof f.id === 'string' ? f.id : f.id.toString()) === fieldId
      );
      if (field && field.value !== formValue[fieldId]) {
        this.saveField(fieldId, formValue[fieldId]);
      }
    });
  }

  private saveField(fieldId: string, value: any): void {
    if (!this.requestId) return;

    this.apiService.updateQuestionAnswer(this.requestId, fieldId, value)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.saveState = { 
              status: 'saved', 
              message: 'Saved', 
              lastSaved: new Date() 
            };
            
            const field = this.section.fields.find(f => 
              (typeof f.id === 'string' ? f.id : f.id.toString()) === fieldId
            );
            if (field) {
              field.value = value;
            }

            setTimeout(() => {
              if (this.saveState.status === 'saved') {
                this.saveState = { status: 'idle' };
              }
            }, 3000);
          }
        },
        error: (error) => {
          this.handleSaveError(fieldId, value, error);
        }
      });
  }

  private handleSaveError(fieldId: string, value: any, error: any): void {
    this.saveRetryCount++;
    
    if (this.saveRetryCount <= this.autoSaveConfig.retryAttempts) {
      this.saveState = { 
        status: 'error', 
        message: `Retrying (${this.saveRetryCount}/${this.autoSaveConfig.retryAttempts})...` 
      };
      
      setTimeout(() => {
        this.saveField(fieldId, value);
      }, 1000 * this.saveRetryCount);
    } else {
      this.saveState = { 
        status: 'error', 
        message: 'Auto-save failed. Changes may be lost.' 
      };
    }
  }

  getFieldRadioOptions(field: Field): Array<{id: string, value: string, label: string}> {
    if (!field.options) return [];
    
    const fieldIdStr = typeof field.id === 'string' ? field.id : field.id.toString();
    return field.options.map((option, index) => ({
      id: `${fieldIdStr}_${index}`,
      value: option,
      label: option
    }));
  }

  onNext(): void {
    if (this.sectionForm.valid) {
      const formData = this.sectionForm.value;
      this.next.emit(formData);
    } else {
      this.markFormGroupTouched();
    }
  }

  onPrevious(): void {
    const formData = this.sectionForm.value;
    this.previous.emit(formData);
  }

  onSubmit(): void {
    if (this.sectionForm.valid) {
      const formData = this.sectionForm.value;
      this.submit.emit(formData);
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.sectionForm.controls).forEach(key => {
      const control = this.sectionForm.get(key);
      control?.markAsTouched();
    });
  }

  hasError(fieldId: string | number, errorType: string): boolean {
    const fieldKey = typeof fieldId === 'string' ? fieldId : fieldId.toString();
    const control = this.sectionForm.get(fieldKey);
    return !!(control && control.hasError(errorType) && (control.dirty || control.touched));
  }

  getErrorMessage(field: Field): string {
    const fieldKey = typeof field.id === 'string' ? field.id : field.id.toString();
    const control = this.sectionForm.get(fieldKey);
    if (!control || !control.errors || !(control.dirty || control.touched)) {
      return '';
    }

    if (control.errors['required']) {
      return field.label.toLowerCase().includes('name') 
        ? `Please enter a ${field.label.toLowerCase()}`
        : `${field.label} is required`;
    }

    if (control.errors['pattern'] && field.type === 'number') {
      return `Please enter a valid number for ${field.label.toLowerCase()}`;
    }

    return 'Please check this field'; 
  }

  getFormControl(fieldId: string): FormControl {
    return this.sectionForm.get(fieldId) as FormControl;
  }
}