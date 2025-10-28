import { InMemoryDbService, RequestInfo, ResponseOptions, STATUS } from 'angular-in-memory-web-api';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MockDataService implements InMemoryDbService {
  createDb() {

    const requests = [
      {
        id: 1,
        title: 'Adobe Creative Suite License',
        status: 'pending_approval',
        createdAt: '2025-10-18T11:20:00.000Z',
        questions: [
          {
            id: 'itemName',
            text: 'What software do you need?',
            type: 'text',
            required: true,
            answer: 'Adobe Creative Suite'
          },
          {
            id: 'quantity', 
            text: 'How many licenses?',
            type: 'number',
            required: true,
            answer: 3
          }
        ]
      },
      {
        id: 2,
        title: 'Dell Laptop for New Hire',
        status: 'approved',
        createdAt: '2025-10-14T16:45:12.000Z',
        questions: [
          {
            id: 'itemName',
            text: 'Hardware needed',
            type: 'text', 
            required: true,
            answer: 'Dell XPS 13 laptop'
          },
          {
            id: 'needsShipping',
            text: 'Ship to remote employee?',
            type: 'boolean',
            required: false,
            answer: true
          }
        ]
      }
    ];

    const schemas = [
      {
        "id": "software-request",
        "title": "Software Request",
        "sections": [
          {
            "id": "requested-item",
            "title": "Requested Item",
            "fields": [
              {
                "id": "itemName",
                "label": "Item Name",
                "type": "text",
                "required": true
              },
              {
                "id": "quantity",
                "label": "Quantity",
                "type": "number",
                "required": true
              }
            ]
          },
          {
            "id": "vendor-info",
            "title": "Vendor Information",
            "fields": [
              {
                "id": "vendorName",
                "label": "Vendor Name",
                "type": "text",
                "required": true
              },
              {
                "id": "vendorLocation",
                "label": "Vendor Location",
                "type": "radio",
                "required": true,
                "options": ["USA", "UK", "Other"]
              },
              {
                "id": "website",
                "label": "Website",
                "type": "text",
                "required": false
              }
            ]
          }
        ]
      },
      {
        "id": "hardware-request",
        "title": "Hardware Request",
        "sections": [
          {
            "id": "requested-item",
            "title": "Requested Item",
            "fields": [
              {
                "id": "itemName",
                "label": "Item Name",
                "type": "text",
                "required": true
              },
              {
                "id": "qty",
                "label": "Quantity",
                "type": "number",
                "required": false
              },
              {
                "id": "needsShipping",
                "label": "Requires shipping",
                "type": "toggle",
                "required": false,
                "default": false
              }
            ]
          },
          {
            "id": "vendor-info",
            "title": "Vendor Information",
            "fields": [
              {
                "id": "vendorName",
                "label": "Vendor Name",
                "type": "text",
                "required": true
              },
              {
                "id": "vendorLocation", 
                "label": "Vendor Location",
                "type": "radio",
                "required": true,
                "options": ["USA", "UK", "Other"]
              }
            ]
          }
        ]
      }
    ];

    const submissions: any[] = [];

    return {
      requests,
      schemas,
      submissions
    };
  }

  put(reqInfo: RequestInfo): Observable<ResponseOptions> {
    const { collectionName, id, req } = reqInfo;
    
    if (collectionName === 'requests' && req.url.includes('/question/')) {
      return this.updateQuestionAnswer(reqInfo);
    }
    
    return undefined as any;
  }

  genId(collection: any[], collectionName: string): number {
    if (collectionName === 'submissions') {
      const id = collection && collection.length > 0 ? 
        Math.max(...collection.map(s => s.id || 0)) + 1 : 1;
      return id;
    }
    return collection && collection.length > 0 ? 
      Math.max(...collection.map(item => item.id || 0)) + 1 : 1;
  }



  private updateQuestionAnswer(reqInfo: RequestInfo): Observable<ResponseOptions> {
    const { collection, id, req } = reqInfo;
    const url = req.url;
    
    const questionIdMatch = url.match(/\/question\/([^\/]+)$/);
    const questionId = questionIdMatch ? questionIdMatch[1] : null;
    
    if (!questionId) {
      return throwError(() => ({
        error: { message: 'Invalid question ID' },
        status: STATUS.BAD_REQUEST,
        headers: reqInfo.headers,
        url: reqInfo.url
      }));
    }

    if (this.shouldSimulateError()) {
      const errorMessages = [
        'Connection timed out - please try again',
        'Database temporarily unavailable',
        'Invalid request format', 
        'Something went wrong. Please refresh and try again.',
        'Server error - our team has been notified'
      ];
      
      const randomError = errorMessages[Math.floor(Math.random() * errorMessages.length)];
      
      return throwError(() => ({
        error: { 
          message: randomError,
          code: 'MOCK_ERROR',
          timestamp: new Date().toISOString()
        },
        status: this.getRandomErrorStatus(),
        headers: reqInfo.headers,
        url: reqInfo.url
      })).pipe(
        delay(this.getRandomLatency(600, 1000))
      );
    }

    const request = collection.find((r: any) => r.id == id);
    
    if (!request) {
      return throwError(() => ({
        error: { message: 'Request not found' },
        status: STATUS.NOT_FOUND,
        headers: reqInfo.headers,
        url: reqInfo.url
      }));
    }

    const question = request.questions.find((q: any) => q.id === questionId);
    
    if (!question) {
      return throwError(() => ({
        error: { message: 'Question not found' },
        status: STATUS.NOT_FOUND,
        headers: reqInfo.headers,
        url: reqInfo.url
      }));
    }

    const requestBody = reqInfo.utils.getJsonBody(req);
    question.answer = requestBody.answer;
    question.updatedAt = new Date().toISOString();

    const response = {
      success: true,
      message: 'Answer updated successfully',
      data: {
        questionId: questionId,
        answer: question.answer,
        updatedAt: question.updatedAt
      },
      timestamp: new Date().toISOString()
    };

    return of({
      body: response,
      status: STATUS.OK,
      headers: reqInfo.headers,
      url: reqInfo.url
    }).pipe(
      delay(this.getRandomLatency(600, 1000))
    );
  }

  private shouldSimulateError(): boolean {
    const errorRate = 0.15;
    return Math.random() < errorRate;
  }

  private getRandomLatency(min: number, max: number): number {
    const spike = Math.random() < 0.1 ? 2000 : 0; 
    return Math.floor(Math.random() * (max - min + 1)) + min + spike;
  }

  private getRandomErrorStatus(): number {
    const errorStatuses = [
      STATUS.BAD_REQUEST, STATUS.BAD_REQUEST, 
      STATUS.INTERNAL_SERVER_ERROR, STATUS.INTERNAL_SERVER_ERROR,
      STATUS.NOT_FOUND,
      STATUS.BAD_GATEWAY
    ];
    
    return errorStatuses[Math.floor(Math.random() * errorStatuses.length)];
  }
}