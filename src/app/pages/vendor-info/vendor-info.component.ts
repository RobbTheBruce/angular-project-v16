import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FormStateService } from '../../services/state/form-state.service';
import { Section } from '../../types/form.types';

@Component({
  selector: 'app-vendor-info',
  templateUrl: './vendor-info.component.html',
  styleUrls: ['./vendor-info.component.scss']
})
export class VendorInfoComponent implements OnInit, OnDestroy {
  currentSection: Section | null = null;
  requestId = 1;
  isSubmitting = false;
  private destroy$ = new Subject<void>();

  constructor(
    private formStateService: FormStateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.formStateService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        const requestData = state.formData.requestData;
        if (requestData) {
          this.currentSection = requestData.sections.find(s => s.id === 'vendor-info') || null;
        }
        this.isSubmitting = state.isLoading;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onNext(formData: any): void {
    this.formStateService.setVendorInfoData(formData);
    this.formStateService.saveRequestData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.router.navigate(['/summary']);
        },
        error: (err: any) => {
          console.error('Form submission failed', err);
        }
      });
  }

  onPrevious(formData: any): void {
    this.formStateService.setVendorInfoData(formData);
    
    this.router.navigate(['/requested-item']);
  }

  goToStart(): void {
    this.router.navigate(['/']);
  }
}