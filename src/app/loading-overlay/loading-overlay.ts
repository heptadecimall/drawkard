import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-screen">
      <div class="deck-container">
        <div class="card-deck card-3"></div>
        <div class="card-deck card-2"></div>
        <div class="card-deck card-1"></div>

        <div class="card-draw top-card"></div>
      </div>
      <p class="loading-text">{{ statusText }}</p>
    </div>
  `,
  styles: [`
    .loading-screen {
      position: fixed; top: 0; left: 0;
      width: 100vw; height: 100vh;
      background: rgba(253, 253, 253, 0.15); /* Light with slight transparency */
      backdrop-filter: blur(3px); 
      display: flex; flex-direction: column;
      justify-content: center; align-items: center;
      z-index: 10000;
      font-family: sans-serif;
    }

    .deck-container {
      position: relative;
      /* SMALLER SIZE: 80px x 112px */
      width: 80px; 
      height: 112px;
      margin-bottom: 20px;
    }

    .card-deck, .card-draw {
      position: absolute;
      width: 100%; height: 100%;
      border-radius: 6px; /* Slightly smaller radius for smaller cards */
      background: #ffffff; 
      box-shadow: none; 
    }

    /* --- COMPACT DIAGONAL STACK --- */
    .card-1 { 
      transform: translate(0px, 0px); 
      z-index: 10; 
      border: 2px solid #aaaaaa; 
    }
    .card-2 { 
      transform: translate(6px, -6px); /* Reduced offset */
      z-index: 9; 
      opacity: 0.7; 
      border: 2px solid #cccccc; 
    }
    .card-3 { 
      transform: translate(12px, -12px); /* Reduced offset */
      z-index: 8; 
      opacity: 0.4; 
      border: 2px solid #dddddd; 
    }

    /* --- FASTER ANIMATING TOP CARD --- */
    .top-card {
      z-index: 11;
      border: 2px solid #aaaaaa;
      /* INCREASED SPEED: 0.8s loop */
      animation: draw-fast 0.8s infinite ease-in-out;
    }

    @keyframes draw-fast {
      0% {
        transform: translate(0px, 0px);
        opacity: 1;
      }
      30% {
        /* Quick lift and move */
        transform: translate(-30px, -40px);
        opacity: 0.8;
      }
      70% {
        /* Reaching the end of the fade */
        transform: translate(-60px, -80px);
        opacity: 0;
      }
      100% {
        /* Loop Reset */
        transform: translate(0px, 0px);
        opacity: 0;
      }
    }

    .loading-text {
      color: #555555;
      font-size: 0.75rem; /* Smaller text */
      font-weight: bold;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
  `]
})
export class LoadingOverlayComponent {
  @Input() statusText: string = 'Shuffling...';
}