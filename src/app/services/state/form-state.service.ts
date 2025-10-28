import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { FormData, FormState, RequestData } from '../../types/form.types';
import { ApiService } from '../api/api.service';

/*
This is the little bear of luck, if you find this easter egg, good fortune will follow you in your coding journey.

 ʕ •ᴥ• ʔ
*/

@Injectable({
  providedIn: 'root'
})
export class FormStateService {
  private initialState: FormState = {
    formData: {},
    availableSchemas: [],
    schemasLoaded: false,
    isLoading: false,
    errors: [],
    isCompleted: false
  };

  private stateSubject = new BehaviorSubject<FormState>(this.initialState);
  public state$: Observable<FormState> = this.stateSubject.asObservable();
  
  constructor(private apiService: ApiService) { 
  }
  
  getCurrentState(): FormState {
    return this.stateSubject.value;
  }

  public loadSchemas(): void {
    const currentState = this.getCurrentState();
    this.stateSubject.next({
      ...currentState,
      isLoading: true
    });
    
    this.apiService.getSchemas().subscribe({
      next: (schemas: any[]) => {
        const requestDataSchemas: RequestData[] = schemas.map(schema => ({
          id: schema.id,
          title: schema.title,
          sections: schema.sections || []
        }));

        const updatedState = this.getCurrentState();
        const newState = {
          ...updatedState,
          availableSchemas: requestDataSchemas,
          schemasLoaded: true,
          isLoading: false
        };
        
        this.stateSubject.next(newState);
      },
      error: (error) => {
        console.error('FormStateService: Failed to load schemas:', error);
        const errorState = this.getCurrentState();
        this.stateSubject.next({
          ...errorState,
          isLoading: false,
          errors: [...errorState.errors, 'Unable to load form types. Please refresh the page.']
        });
      }
    });
  }

  getAvailableSchemas(): RequestData[] {
    return this.getCurrentState().availableSchemas;
  }

  areSchemasLoaded(): boolean {
    return this.getCurrentState().schemasLoaded;
  }

  setInitialRequestData(data: { productType: string }): void {
    if (!data || !data.productType) return;

    const currentState = this.getCurrentState();
    const schemaId = data.productType === 'software' ? 'software-request' : 'hardware-request';
    const selectedSchema = currentState.availableSchemas.find(schema => schema.id === schemaId);
    
    if (!selectedSchema) {
      console.error(`Schema not found for product type: ${data.productType}`);
      this.addError(`Schema not available for ${data.productType}. Please try again.`);
      return;
    }

    const initialStateData: RequestData = JSON.parse(JSON.stringify(selectedSchema));

    this.stateSubject.next({
      ...currentState,
      formData: {
        requestData: initialStateData
      }
    });
  }

  setRequestedItemData(formData: any): void {
    if (!formData) return;

    const currentState = this.getCurrentState();
    const currentRequestData = currentState.formData.requestData;
    
    if (!currentRequestData) {
      console.error('No request data found. Make sure to call setInitialRequestData first.');
      return;
    }

    const updatedSections = currentRequestData.sections.map(section => {
      if (section.id === 'requested-item') {
        const updatedFields = section.fields.map(field => {
          const fieldKey = typeof field.id === 'string' ? field.id : field.id.toString();
          const fieldValue = formData[fieldKey];
          if (fieldValue !== undefined) {
            return { ...field, value: fieldValue };
          }
          return field;
        });
        return { ...section, fields: updatedFields };
      }
      return section;
    });

    this.stateSubject.next({
      ...currentState,
      formData: {
        ...currentState.formData,
        requestData: {
          ...currentRequestData,
          sections: updatedSections
        }
      }
    });
  }

  setVendorInfoData(formData: any): void {
    if (!formData) return;

    const currentState = this.getCurrentState();
    const currentRequestData = currentState.formData.requestData;
    
    if (!currentRequestData) {
      console.error('No request data found. Make sure to call setInitialRequestData first.');
      return;
    }

    const updatedSections = currentRequestData.sections.map(section => {
      if (section.id === 'vendor-info') {
        const updatedFields = section.fields.map(field => {
          const fieldKey = typeof field.id === 'string' ? field.id : field.id.toString();
          const fieldValue = formData[fieldKey];
          if (fieldValue !== undefined) {
            return { ...field, value: fieldValue };
          }
          return field;
        });
        return { ...section, fields: updatedFields };
      }
      return section;
    });

    this.stateSubject.next({
      ...currentState,
      formData: {
        ...currentState.formData,
        requestData: {
          ...currentRequestData,
          sections: updatedSections
        }
      }
    });
  }

  saveRequestData(): Observable<any> {
    this.setLoading(true);
    this.clearErrors();
    
    const formData = this.getCompleteFormData();
    
    if (!formData) {
      this.setLoading(false);
      this.addError('No form data to save');
      return throwError(() => new Error('No form data to save'));
    }

    return this.apiService.submitForm(formData).pipe(
      tap(() => {
        this.setCompleted(true);
        this.setLoading(false);
      }),
      catchError((error) => {
        console.error('Form submission error in FormStateService:', error);
        this.setLoading(false);
        const errorMessage = error.status === 0 
          ? 'Network error - please check your connection and try again'
          : 'Failed to submit request. Please try again or contact support if the problem persists.';
        this.addError(errorMessage);
        console.error('Form submission failed:', error);
        return throwError(() => error);
      })
    );
  }

  setLoading(isLoading: boolean): void {
    const currentState = this.getCurrentState();
    this.stateSubject.next({
      ...currentState,
      isLoading
    });
  }

  addError(error: string): void {
    const currentState = this.getCurrentState();
    this.stateSubject.next({
      ...currentState,
      errors: [...currentState.errors, error]
    });
  }

  clearErrors(): void {
    const currentState = this.getCurrentState();
    this.stateSubject.next({
      ...currentState,
      errors: []
    });
  }

  setCompleted(isCompleted: boolean): void {
    const currentState = this.getCurrentState();
    this.stateSubject.next({
      ...currentState,
      isCompleted
    });
  }

  resetForm(): void {
    this.stateSubject.next(this.initialState);
  }

  getCompleteFormData(): FormData | null {
    const currentState = this.getCurrentState();
    const { requestData } = currentState.formData;

    if (requestData) {
      return {
        requestData: requestData || {} as RequestData
      };
    }

    return null;
  }
}