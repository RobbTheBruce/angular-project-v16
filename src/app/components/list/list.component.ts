import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

export interface ListItem {
  name: string;
  path: string;
}

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent {
  @Input() items: ListItem[] = [];

  constructor(private router: Router) {}

  get listClasses(): string {
    const classes = [
      'list',
    ];
    return classes.join(' ');
  }

  isActiveRoute(path: string): boolean {
    return this.router.url === path;
  }

  getItemClasses(item: ListItem): string {
    const classes = ['list-item'];
    
    if (this.isActiveRoute(item.path)) {
      classes.push('list-item--active');
    }
    
    return classes.join(' ');
  }
}