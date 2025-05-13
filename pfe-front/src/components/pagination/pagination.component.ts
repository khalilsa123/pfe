// src/app/components/pagination/pagination.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav aria-label="Pagination" class="pagination-container">
      <ul class="pagination justify-content-center">
        <li class="page-item" [class.disabled]="currentPage === 1">
          <a class="page-link" (click)="onPageChange(currentPage - 1)" aria-label="Previous">
            <i class="fas fa-chevron-left"></i>
          </a>
        </li>
        
        <li class="page-item" 
            *ngFor="let page of getPages()" 
            [class.active]="page === currentPage">
          <a class="page-link" (click)="onPageChange(page)">{{ page }}</a>
        </li>
        
        <li class="page-item" [class.disabled]="currentPage === totalPages">
          <a class="page-link" (click)="onPageChange(currentPage + 1)" aria-label="Next">
            <i class="fas fa-chevron-right"></i>
          </a>
        </li>
      </ul>
      
      <div class="pagination-info">
        <span>Affichage {{ startIndex + 1 }}-{{ endIndex }} sur {{ totalItems }} entrées</span>
      </div>
    </nav>
  `,
  styles: [`
    .pagination-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 20px;
      flex-wrap: wrap;
      gap: 15px;
    }

    .pagination {
      margin: 0;
    }

    .page-item {
      &.disabled .page-link {
        cursor: not-allowed;
        opacity: 0.5;
      }

      &.active .page-link {
        background-color: var(--onetech-blue);
        border-color: var(--onetech-blue);
        color: white;
      }
    }

    .page-link {
      color: var(--onetech-blue);
      cursor: pointer;
      padding: 0.5rem 0.75rem;
      transition: all 0.2s ease;

      &:hover:not(.disabled) {
        background-color: var(--onetech-light-blue);
      }
    }

    .pagination-info {
      color: #6c757d;
      font-size: 0.9rem;
    }

    @media (max-width: 576px) {
      .pagination-container {
        justify-content: center;
      }
    }
  `]
})
export class PaginationComponent {
  @Input() currentPage = 1;
  @Input() itemsPerPage = 10;
  @Input() totalItems = 0;
  @Output() pageChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  get endIndex(): number {
    return Math.min(this.startIndex + this.itemsPerPage, this.totalItems);
  }

  getPages(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }
    this.pageChange.emit(page);
  }
}