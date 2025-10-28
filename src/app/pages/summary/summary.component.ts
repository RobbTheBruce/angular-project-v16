import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FormStateService } from '../../services/state/form-state.service';
import { RequestData, Field } from '../../types/form.types';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnInit, OnDestroy {
  requestData: RequestData | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private formStateService: FormStateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.formStateService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.requestData = state.formData.requestData || null;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onCreateNewRequest(): void {
    this.formStateService.resetForm();
    
    this.router.navigate(['/initial-request']);
  }

  getFieldDisplayValue(field: Field): string {
    if (field.value === undefined || field.value === null) {
      return field.default ?? 'Not provided';
    }

    if (field.type === 'toggle') {
      return field.value ? 'Yes' : 'No';
    }

    return field.value.toString();
  }

  hasAnyData(): boolean {
    if (!this.requestData) return false;
    
    return this.requestData.sections.some(section =>
      section.fields.some(field => 
        field.value !== undefined && field.value !== null && field.value !== ''
      )
    );
  }
}