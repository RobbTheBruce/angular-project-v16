import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { FormData } from '../../types/form.types';



export interface FormSubmissionResponse {
  id: number;
  success: boolean;
  message: string;
  submittedAt: string;
}

export interface Question {
  id: string;
  text: string;
  type: 'rating' | 'text' | 'boolean';
  required: boolean;
  answer?: any;
  updatedAt?: string;
}

export interface Request {
  id: number;
  title: string;
  status: 'active' | 'draft' | 'completed';
  createdAt: string;
  questions: Question[];
}

export interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'boolean';
  min?: number;
  max?: number;
  maxLength?: number;
  required: boolean;
  label: string;
}

export interface Schema {
  id: string;
  name: string;
  version: string;
  fields: SchemaField[];
}

export interface UpdateQuestionResponse {
  success: boolean;
  message: string;
  data: {
    questionId: string;
    answer: any;
    updatedAt: string;
  };
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'api';

  constructor(private http: HttpClient) {}

  submitForm(formData: FormData): Observable<FormSubmissionResponse> {
    const submissionPayload = {
      ...formData,
      submittedAt: new Date().toISOString(),
      success: true,
      message: 'Form submitted successfully'
    };
    
    return this.http.post<any>(`${this.baseUrl}/submissions`, submissionPayload)
      .pipe(
        tap(response => {
          if (!response.success) {
            response.success = true;
          }
          if (!response.message) {
            response.message = 'Form submitted successfully';
          }
          if (!response.submittedAt) {
            response.submittedAt = new Date().toISOString();
          }
        }),
        catchError(error => {
          console.error('API error occurred:', error);
          throw error;
        }),
        delay(200) 
      );
  }



  updateQuestionAnswer(requestId: number, questionId: string, answer: any): Observable<UpdateQuestionResponse> {
    const url = `${this.baseUrl}/requests/${requestId}/question/${questionId}`;
    const body = { answer };
    
    return this.http.put<UpdateQuestionResponse>(url, body);
  }

  getSchemas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/schemas`).pipe(
      tap((schemas: any[]) => console.log('ApiService: Received schemas response:', schemas)),
      catchError((error: any) => {
        console.error('ApiService: Error getting schemas:', error);
        throw error;
      })
    );
  }

  getRequests(): Observable<Request[]> {
    return this.http.get<Request[]>(`${this.baseUrl}/requests`)
      .pipe(delay(300));
  }


}