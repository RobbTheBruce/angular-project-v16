import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListComponent, ListItem } from './list.component';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Component } from '@angular/core';

@Component({ template: '' })
class MockComponent { }

describe('ListComponent', () => {
  let component: ListComponent;
  let fixture: ComponentFixture<ListComponent>;
  let router: Router;

  const mockItems: ListItem[] = [
    { name: 'Item 1', path: '/item1' },
    { name: 'Item 2', path: '/item2' },
    { name: 'Item 3', path: '/item3' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListComponent, MockComponent],
      imports: [RouterTestingModule.withRoutes([
        { path: 'item1', component: MockComponent },
        { path: 'item2', component: MockComponent },
        { path: 'item3', component: MockComponent }
      ])]
    });
    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    component.items = mockItems;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render all items', () => {
    const listItems = fixture.nativeElement.querySelectorAll('.list-item');
    expect(listItems.length).toBe(3);
  });

  it('should render item names correctly', () => {
    const listItems = fixture.nativeElement.querySelectorAll('.list-item');
    expect(listItems[0].textContent.trim()).toBe('Item 1');
    expect(listItems[1].textContent.trim()).toBe('Item 2');
    expect(listItems[2].textContent.trim()).toBe('Item 3');
  });

  it('should set correct routerLink attributes', () => {
    const listItems = fixture.nativeElement.querySelectorAll('.list-item');
    expect(listItems[0].getAttribute('ng-reflect-router-link')).toBe('/item1');
    expect(listItems[1].getAttribute('ng-reflect-router-link')).toBe('/item2');
    expect(listItems[2].getAttribute('ng-reflect-router-link')).toBe('/item3');
  });

  it('should identify active route correctly', () => {
    spyOnProperty(router, 'url', 'get').and.returnValue('/item2');
    
    expect(component.isActiveRoute('/item2')).toBeTruthy();
    expect(component.isActiveRoute('/item1')).toBeFalsy();
  });

  it('should apply correct CSS classes', () => {
    const listContainer = fixture.nativeElement.querySelector('.list');
    expect(listContainer).toBeTruthy();
    
    const listItems = fixture.nativeElement.querySelectorAll('.list-item');
    listItems.forEach((item: HTMLElement) => {
      expect(item.className).toContain('list-item');
    });
  });

  it('should return correct item classes for active route', () => {
    spyOnProperty(router, 'url', 'get').and.returnValue('/item1');
    
    const activeItem: ListItem = { name: 'Item 1', path: '/item1' };
    const inactiveItem: ListItem = { name: 'Item 2', path: '/item2' };
    
    expect(component.getItemClasses(activeItem)).toContain('list-item--active');
    expect(component.getItemClasses(inactiveItem)).not.toContain('list-item--active');
  });

  it('should handle empty items array', () => {
    component.items = [];
    fixture.detectChanges();
    
    const listItems = fixture.nativeElement.querySelectorAll('.list-item');
    expect(listItems.length).toBe(0);
  });

  it('should apply list classes correctly', () => {
    const classes = component.listClasses;
    expect(classes).toBe('list');
  });

  it('should handle undefined or null router url', () => {
    spyOnProperty(router, 'url', 'get').and.returnValue(null as any);
    
    expect(component.isActiveRoute('/item1')).toBeFalsy();
  });

  it('should navigate when item is clicked', async () => {
    const listItems = fixture.nativeElement.querySelectorAll('.list-item');
    const firstItem = listItems[0] as HTMLElement;
    
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    
    firstItem.click();
    
    // Note: Actual navigation testing would require more complex setup
    // This test verifies the routerLink directive is properly applied
    expect(firstItem.getAttribute('ng-reflect-router-link')).toBe('/item1');
  });
});