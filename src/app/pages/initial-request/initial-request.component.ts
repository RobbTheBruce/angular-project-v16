import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FormStateService } from '../../services/state/form-state.service';
import { RadioOption } from '../../components/radio/radio.component';
import { ApiService } from '../../services/api/api.service';

@Component({
  selector: 'app-initial-request',
  templateUrl: './initial-request.component.html',
  styleUrls: ['./initial-request.component.scss']
})
export class InitialRequestComponent implements OnInit, OnDestroy {
  stepOneForm: FormGroup;
  isLoading = false;
  schemasLoaded = false;
  availableSchemas: Array<{id: string, title: string}> = [];
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private formStateService: FormStateService,
    private apiService: ApiService,
    private router: Router
  ) {
    this.stepOneForm = this.fb.group({
      productType: ['', [Validators.required]],
    });
  }

  get purchaseOptions(): RadioOption[] {
    return this.availableSchemas.map(schema => ({
      id: schema.id,
      value: schema.id,
      label: schema.title
    }));
  }

  ngOnInit(): void {
    this.formStateService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.isLoading = state.isLoading;
        this.schemasLoaded = state.schemasLoaded;
        
        this.availableSchemas = state.availableSchemas.map(schema => ({
          id: schema.id,
          title: schema.title
        }));

        if (state.formData.requestData) {
          const productType = state.formData.requestData.id === 'software-request' ? 'software-request' : 'hardware-request';
          this.stepOneForm.patchValue({ productType });
        }
      });

    if (!this.formStateService.areSchemasLoaded()) {
      this.formStateService.loadSchemas();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onNext(): void {
    if (this.stepOneForm.valid && this.schemasLoaded) {
      const stepOneData = this.stepOneForm.value;
      
      const productType = stepOneData.productType === 'software-request' ? 'software' : 'hardware';
      
      this.formStateService.setInitialRequestData({ productType });
      
      this.router.navigate(['/requested-item']);
    } else if (!this.schemasLoaded) {
      this.formStateService.loadSchemas();
    }
  }
}
