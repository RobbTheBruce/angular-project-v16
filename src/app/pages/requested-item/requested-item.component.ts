import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FormStateService } from '../../services/state/form-state.service';
import { Section } from '../../types/form.types';

@Component({
  selector: 'app-requested-item',
  templateUrl: './requested-item.component.html',
  styleUrls: ['./requested-item.component.scss']
})
export class RequestedItemComponent implements OnInit, OnDestroy {
  currentSection: Section | null = null;
  requestId = 1;
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
          this.currentSection = requestData.sections.find(s => s.id === 'requested-item') || null;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onNext(formData: any): void {
    this.formStateService.setRequestedItemData(formData);
    
    this.router.navigate(['/vendor-info']);
  }

  onPrevious(formData: any): void {
    this.formStateService.setRequestedItemData(formData);
    
    this.router.navigate(['/initial-request']);
  }

  goToStart(): void {
    this.router.navigate(['/']);
  }
}
