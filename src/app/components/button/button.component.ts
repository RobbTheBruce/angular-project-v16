import { Component, Input, Output, EventEmitter } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary';
export type ButtonSize = 'medium' | 'large';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent {
  @Input() size: ButtonSize = 'medium';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() textAlign: 'left' | 'center' | 'right' = 'center';
  @Input() fullWidth: boolean = false;
  @Input() variant: ButtonVariant = 'primary';
  @Input() transform: 'uppercase' | 'lowercase' | 'none' = 'none';

  @Output() clicked = new EventEmitter<Event>();

  onClick(event: Event): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit(event);
    }
  }

  get buttonClasses(): string {
    const classes = [
      'btn',
      `btn--${this.size}`,
      `btn--text-${this.textAlign}`,
      `btn--${this.variant}`,
      `btn--transform-${this.transform}`
    ];

    if (this.disabled) {
      classes.push('btn--disabled');
    }

    if (this.loading) {
      classes.push('btn--loading');
    }

    if (this.fullWidth) {
      classes.push('btn--full-width');
    }

    return classes.join(' ');
  }
}