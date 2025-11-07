import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService, FormSubmissionResponse, Request, UpdateQuestionResponse } from './api.service';
import { FormData } from '../../types/form.types';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('submitForm', () => {
    it('should submit form data successfully', (done) => {
      const mockFormData: FormData = {
        requestData: {
          id: 'test-id',
          title: 'Test Request',
          sections: []
        }
      };

      const mockResponse = {
        id: 1,
        success: true,
        message: 'Form submitted successfully',
        submittedAt: '2025-11-07T20:00:00.000Z'
      };

      service.submitForm(mockFormData).subscribe({
        next: (response) => {
          expect(response.success).toBeTruthy();
          expect(response.message).toBe('Form submitted successfully');
          expect(response.submittedAt).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne('api/submissions');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(jasmine.objectContaining(mockFormData));
      req.flush(mockResponse);
    });

    it('should handle form submission with missing response fields', (done) => {
      const mockFormData: FormData = {
        requestData: {
          id: 'test-id',
          title: 'Test Request',
          sections: []
        }
      };

      const incompleteResponse = {
        id: 1
      };

      service.submitForm(mockFormData).subscribe({
        next: (response) => {
          expect(response.success).toBeTruthy();
          expect(response.message).toBe('Form submitted successfully');
          expect(response.submittedAt).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne('api/submissions');
      req.flush(incompleteResponse);
    });

    it('should handle form submission error', (done) => {
      const mockFormData: FormData = {
        requestData: {
          id: 'test-id',
          title: 'Test Request',
          sections: []
        }
      };

      service.submitForm(mockFormData).subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne('api/submissions');
      req.flush('Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('updateQuestionAnswer', () => {
    it('should update question answer successfully', (done) => {
      const requestId = 1;
      const questionId = 'test-question';
      const answer = 'test answer';

      const mockResponse: UpdateQuestionResponse = {
        success: true,
        message: 'Answer updated successfully',
        data: {
          questionId: questionId,
          answer: answer,
          updatedAt: '2025-11-07T20:00:00.000Z'
        },
        timestamp: '2025-11-07T20:00:00.000Z'
      };

      service.updateQuestionAnswer(requestId, questionId, answer).subscribe({
        next: (response) => {
          expect(response.success).toBeTruthy();
          expect(response.data.questionId).toBe(questionId);
          expect(response.data.answer).toBe(answer);
          done();
        }
      });

      const req = httpMock.expectOne(`api/requests/${requestId}/question/${questionId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ answer: answer });
      req.flush(mockResponse);
    });

    it('should handle update question error', (done) => {
      const requestId = 1;
      const questionId = 'test-question';
      const answer = 'test answer';

      service.updateQuestionAnswer(requestId, questionId, answer).subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne(`api/requests/${requestId}/question/${questionId}`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('getSchemas', () => {
    it('should get schemas successfully', (done) => {
      const mockSchemas = [
        {
          id: 'schema1',
          title: 'Schema 1',
          sections: []
        },
        {
          id: 'schema2',
          title: 'Schema 2',
          sections: []
        }
      ];

      service.getSchemas().subscribe({
        next: (schemas) => {
          expect(schemas.length).toBe(2);
          expect(schemas[0].id).toBe('schema1');
          expect(schemas[1].id).toBe('schema2');
          done();
        }
      });

      const req = httpMock.expectOne('api/schemas');
      expect(req.request.method).toBe('GET');
      req.flush(mockSchemas);
    });

    it('should handle get schemas error', (done) => {
      service.getSchemas().subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne('api/schemas');
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getRequests', () => {
    it('should get requests successfully', (done) => {
      const mockRequests: Request[] = [
        {
          id: 1,
          title: 'Request 1',
          status: 'active',
          createdAt: '2025-11-07T20:00:00.000Z',
          questions: []
        },
        {
          id: 2,
          title: 'Request 2',
          status: 'completed',
          createdAt: '2025-11-07T19:00:00.000Z',
          questions: []
        }
      ];

      service.getRequests().subscribe({
        next: (requests) => {
          expect(requests.length).toBe(2);
          expect(requests[0].title).toBe('Request 1');
          expect(requests[1].status).toBe('completed');
          done();
        }
      });

      const req = httpMock.expectOne('api/requests');
      expect(req.request.method).toBe('GET');
      req.flush(mockRequests);
    });

    it('should handle get requests error', (done) => {
      service.getRequests().subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne('api/requests');
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });
});