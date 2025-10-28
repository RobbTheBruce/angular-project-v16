import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Angular Test Project';
  currentUrl = '';
  private destroy$ = new Subject<void>();
  listItems = [
    { name: 'Requested Item', path: '/requested-item' },
    { name: 'Vendor Information', path: '/vendor-info' },
  ];

  constructor(private router: Router) {}

  isSchemaFormPages(): boolean {
    return this.currentUrl === '/requested-item' || this.currentUrl === '/vendor-info';
  }

  ngOnInit(): void {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: NavigationEnd) => {
      this.currentUrl = event.url;
    });
      
    this.currentUrl = this.router.url;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


}
