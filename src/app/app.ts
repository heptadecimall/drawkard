import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

  constructor(private http: HttpClient) { };

  cardData: any;
  symbolData: any;

  ngOnInit() {
    const lsSymbolData = localStorage.getItem('symbology');

    if (lsSymbolData) {
      this.symbolData = JSON.parse(lsSymbolData!)
    } else {
      this.fetchSymbology();
    }

    this.fetchSymbology();

  }

  fetchRandomCard() {
    this.http.get<any>('https://api.scryfall.com/cards/random').subscribe({
      next: (res) => this.cardData = res,
      error: (err) => console.error(`Error fetching card data: ${err}`),
      complete: () => console.log('Successfully fetching card data.')
    })
  }

  fetchSymbology() {
    this.http.get<any>('https://api.scryfall.com/symbology ').subscribe({
      next: (res) => {
        this.symbolData = res;
        localStorage.setItem('symbology', JSON.stringify(res));
      },
      error: (err) => console.error(`Error fetching symbol data: ${err}`),
      complete: () => console.log('Successfully fetching symbol data.')
    })
  }

  mappedSymbols(raw: string) {
    const symbols = raw.match(/\{[^}]+\}/g); // This regex looks for text inside {braces}

    console.log('Raw string:', raw);
    console.log('Extracted symbols:', symbols);
    console.log('Symbol data:', this.symbolData);

    const mappedSymbols = symbols?.map((symbol) => {
      const found = this.symbolData.data.find((item: any) => item.symbol === symbol);
      console.log(`Looking for ${symbol}, found:`, found);
      return found;
    }).filter(Boolean) || [];

    console.log('Mapped symbols:', mappedSymbols);

    return mappedSymbols;
  }
}
