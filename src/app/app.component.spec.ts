import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { AppComponent } from './app.component';
import { Component } from '@angular/core';

// Mock components for testing
@Component({
  selector: 'app-list',
  template: '<div class="mock-list"></div>'
})
class MockListComponent {}

describe('AppComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [RouterTestingModule],
    declarations: [AppComponent, MockListComponent]
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'Angular Test Project'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Angular Test Project');
  });

  it('should render app container', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.app-container')).toBeTruthy();
  });

  it('should have list items initialized', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.listItems.length).toBe(2);
    expect(app.listItems[0].name).toBe('Requested Item');
    expect(app.listItems[1].name).toBe('Vendor Information');
  });

  it('should identify schema form pages correctly', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    
    app.currentUrl = '/requested-item';
    expect(app.isSchemaFormPages()).toBeTruthy();
    
    app.currentUrl = '/vendor-info';
    expect(app.isSchemaFormPages()).toBeTruthy();
    
    app.currentUrl = '/other-page';
    expect(app.isSchemaFormPages()).toBeFalsy();
  });

  it('should initialize current URL on ngOnInit', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const router = TestBed.inject(Router);
    
    spyOnProperty(router, 'url').and.returnValue('/test-url');
    
    app.ngOnInit();
    
    expect(app.currentUrl).toBe('/test-url');
  });
});
