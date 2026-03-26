import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fullscreen-overlay" (click)="closeFull()">
      <button class="close-btn">&times;</button>
      <img [src]="src" [alt]="alt" 
           class="full-image" 
           [style.transform]="'rotate(' + rotation + 'deg)'" 
           (click)="$event.stopPropagation()">
    </div>
  `,
  styles: [`
  /* Full Screen Modal Styling */
  .fullscreen-overlay {
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    cursor: zoom-out;
  }

  .full-image {
    max-width: 90%;
    max-height: 90%;
    box-shadow: 0 0 20px rgba(0,0,0,0.5);
    cursor: default;
  
  /* --- Added these lines --- */
  border-radius: 1.5rem; /* This gives it the "Card" look */
  overflow: hidden;      /* Ensures the image doesn't bleed past the corners */
  object-fit: contain;   /* Keeps the aspect ratio perfect */
}
    .close-btn {
      position: absolute; top: 20px; right: 30px;
      color: white; font-size: 3rem; background: none; border: none; cursor: pointer;
    }
  `]
})
export class ImageViewerComponent implements OnInit {
  @Input() src: string = '';
  @Input() alt: string = 'Image';
  @Input() rotation: number = 0; // Receive the rotation from the card
  @Output() onClose = new EventEmitter<void>(); // Tell parent to close

  ngOnInit() {
    document.body.style.overflow = 'hidden';
  }

  closeFull() {
    document.body.style.overflow = 'auto';
    this.onClose.emit(); // Send signal to parent
  }
}