import { TestBed } from '@angular/core/testing';
import { FormStateService } from './form-state.service';
import { ApiService } from '../api/api.service';
import { FormState, RequestData } from '../../types/form.types';
import { of, throwError } from 'rxjs';

describe('FormStateService', () => {
  let service: FormStateService;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;

  const mockSchemas = [
    {
      id: 'software-request',
      title: 'Software Request',
      sections: [
        {
          id: 'requested-item',
          title: 'Requested Item',
          fields: []
        }
      ]
    },
    {
      id: 'hardware-request',
      title: 'Hardware Request',
      sections: [
        {
          id: 'requested-item',
          title: 'Requested Item',
          fields: []
        }
      ]
    }
  ];

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ApiService', ['getSchemas', 'submitForm']);

    TestBed.configureTestingModule({
      providers: [
        FormStateService,
        { provide: ApiService, useValue: spy }
      ]
    });
    service = TestBed.inject(FormStateService);
    apiServiceSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have initial state', () => {
    const state = service.getCurrentState();
    expect(state.formData).toEqual({});
    expect(state.availableSchemas).toEqual([]);
    expect(state.schemasLoaded).toBeFalsy();
    expect(state.isLoading).toBeFalsy();
    expect(state.errors).toEqual([]);
    expect(state.isCompleted).toBeFalsy();
  });

  describe('loadSchemas', () => {
    it('should call api service getSchemas', () => {
      apiServiceSpy.getSchemas.and.returnValue(of(mockSchemas));

      service.loadSchemas();
      
      expect(apiServiceSpy.getSchemas).toHaveBeenCalled();
    });

    it('should handle successful schema loading', () => {
      apiServiceSpy.getSchemas.and.returnValue(of(mockSchemas));

      service.loadSchemas();
      
      // After successful loading, schemas should be available
      expect(service.areSchemasLoaded()).toBeTruthy();
      expect(service.getAvailableSchemas().length).toBe(2);
    });
  });

  describe('setInitialRequestData', () => {
    beforeEach(() => {
      // Setup schemas in state first
      service['stateSubject'].next({
        ...service.getCurrentState(),
        availableSchemas: mockSchemas as any,
        schemasLoaded: true
      });
    });

    it('should set software request data', () => {
      service.setInitialRequestData({ productType: 'software' });
      
      const state = service.getCurrentState();
      expect(state.formData.requestData?.id).toBe('software-request');
    });

    it('should set hardware request data', () => {
      service.setInitialRequestData({ productType: 'hardware' });
      
      const state = service.getCurrentState();
      expect(state.formData.requestData?.id).toBe('hardware-request');
    });

    it('should handle invalid product type', () => {
      // Set up state without any schemas to trigger error
      service['stateSubject'].next({
        ...service.getCurrentState(),
        availableSchemas: [], // Empty schemas array
        schemasLoaded: true
      });
      
      const initialErrorCount = service.getCurrentState().errors.length;
      
      service.setInitialRequestData({ productType: 'invalid' });
      
      const finalErrorCount = service.getCurrentState().errors.length;
      expect(finalErrorCount).toBeGreaterThan(initialErrorCount);
    });

    it('should handle missing product type', () => {
      service.setInitialRequestData(null as any);
      
      // Should not throw error or change state
      const state = service.getCurrentState();
      expect(state.formData.requestData).toBeUndefined();
    });
  });

  describe('setRequestedItemData', () => {
    beforeEach(() => {
      // Setup initial request data
      const mockRequestData: RequestData = {
        id: 'software-request',
        title: 'Software Request',
        sections: [
          {
            id: 'requested-item',
            title: 'Requested Item',
            fields: [
              { id: 'itemName', label: 'Item Name', type: 'text', value: '' }
            ]
          }
        ]
      };

      service['stateSubject'].next({
        ...service.getCurrentState(),
        formData: { requestData: mockRequestData }
      });
    });

    it('should update requested item data', () => {
      const formData = { itemName: 'Test Software' };
      
      service.setRequestedItemData(formData);
      
      const state = service.getCurrentState();
      const requestedItemSection = state.formData.requestData?.sections.find(s => s.id === 'requested-item');
      const itemNameField = requestedItemSection?.fields.find(f => f.id === 'itemName');
      
      expect(itemNameField?.value).toBe('Test Software');
    });

    it('should handle null form data', () => {
      service.setRequestedItemData(null);
      
      // Should not throw error
      expect(service.getCurrentState()).toBeTruthy();
    });
  });

  describe('saveRequestData', () => {
    beforeEach(() => {
      const mockRequestData: RequestData = {
        id: 'software-request',
        title: 'Software Request',
        sections: []
      };

      service['stateSubject'].next({
        ...service.getCurrentState(),
        formData: { requestData: mockRequestData }
      });
    });

    it('should call api service with form data', () => {
      const mockResponse = { 
        id: 1, 
        success: true, 
        message: 'Saved', 
        submittedAt: '2025-11-07T20:00:00.000Z' 
      };
      apiServiceSpy.submitForm.and.returnValue(of(mockResponse));

      service.saveRequestData();
      
      expect(apiServiceSpy.submitForm).toHaveBeenCalled();
    });

    it('should return error observable when no form data', () => {
      service['stateSubject'].next({
        ...service.getCurrentState(),
        formData: {}
      });

      let errorThrown = false;
      service.saveRequestData().subscribe({
        error: (error) => {
          errorThrown = true;
          expect(error.message).toBe('No form data to save');
        }
      });
      
      expect(errorThrown).toBeTruthy();
    });
  });

  describe('utility methods', () => {
    it('should get available schemas', () => {
      service['stateSubject'].next({
        ...service.getCurrentState(),
        availableSchemas: mockSchemas as any
      });

      const schemas = service.getAvailableSchemas();
      expect(schemas.length).toBe(2);
    });

    it('should check if schemas are loaded', () => {
      expect(service.areSchemasLoaded()).toBeFalsy();

      service['stateSubject'].next({
        ...service.getCurrentState(),
        schemasLoaded: true
      });

      expect(service.areSchemasLoaded()).toBeTruthy();
    });

    it('should set loading state', () => {
      service.setLoading(true);
      expect(service.getCurrentState().isLoading).toBeTruthy();

      service.setLoading(false);
      expect(service.getCurrentState().isLoading).toBeFalsy();
    });

    it('should add and clear errors', () => {
      service.addError('Test error');
      expect(service.getCurrentState().errors).toContain('Test error');

      service.clearErrors();
      expect(service.getCurrentState().errors.length).toBe(0);
    });

    it('should set completed state', () => {
      service.setCompleted(true);
      expect(service.getCurrentState().isCompleted).toBeTruthy();

      service.setCompleted(false);
      expect(service.getCurrentState().isCompleted).toBeFalsy();
    });

    it('should reset form', () => {
      // Modify state first
      service.addError('Test error');
      service.setCompleted(true);

      service.resetForm();

      const state = service.getCurrentState();
      expect(state.formData).toEqual({});
      expect(state.errors).toEqual([]);
      expect(state.isCompleted).toBeFalsy();
    });

    it('should get complete form data', () => {
      const mockRequestData: RequestData = {
        id: 'test',
        title: 'Test',
        sections: []
      };

      service['stateSubject'].next({
        ...service.getCurrentState(),
        formData: { requestData: mockRequestData }
      });

      const formData = service.getCompleteFormData();
      expect(formData?.requestData).toEqual(mockRequestData);
    });

    it('should return null when no form data', () => {
      const formData = service.getCompleteFormData();
      expect(formData).toBeNull();
    });
  });
});