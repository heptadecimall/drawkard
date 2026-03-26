import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { from, of } from 'rxjs';
import { concatMap, delay } from 'rxjs/operators';
import { ImageViewerComponent } from './image-viewer/image-viewer';
import { LoadingOverlayComponent } from "./loading-overlay/loading-overlay";

@Component({
  selector: 'app-root',
  imports: [CommonModule, ImageViewerComponent, LoadingOverlayComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

  constructor(private http: HttpClient) { };

  cardData: any;
  symbolData: any;
  cardTypeData: any;
  artifactTypeData: any;
  battleTypeData: any;
  creatureTypeData: any;
  enchantmentTypeData: any;
  landTypeData: any;
  planeswalkerTypeData: any;
  spellTypeData: any;
  keywordAbilityData: any;
  keywordActionData: any;
  abilityWordData: any;

  selectedCardType: string = '';
  selectedArtifactType!: string;
  selectedBattleType!: string;
  selectedCreatureType!: string;
  selectedEnchantmentType!: string;
  selectedLandType!: string;
  selectedPlaneswalkerType!: string;
  selectedSpellType!: string;
  selectedManaColors: any[] = []

  isFlipped: boolean = true;
  rotationDeg = 0;
  isLoading: boolean = false;
  displayImageUrl: string = '';
  colorManaData = [
    { color: 'White', code: '{W}' },
    { color: 'Blue', code: '{U}' },
    { color: 'Black', code: '{B}' },
    { color: 'Red', code: '{R}' },
    { color: 'Green', code: '{G}' },
    { color: 'Colorless', code: '{C}' }
  ]
  showImageViewer: boolean = false;


  ngOnInit() {

    const tasks = [
      () => this.initializeData('symbology', 'symbolData', () => this.fetchSymbology()),
      () => this.initializeData('cardType', 'cardTypeData', () => this.fetchCatalogTypes('card')),
      () => this.initializeData('artifactType', 'artifactTypeData', () => this.fetchCatalogTypes('artifact')),
      () => this.initializeData('battleType', 'battleTypeData', () => this.fetchCatalogTypes('battle')),
      () => this.initializeData('creatureType', 'creatureTypeData', () => this.fetchCatalogTypes('creature')),
      () => this.initializeData('enchantmentType', 'enchantmentTypeData', () => this.fetchCatalogTypes('enchantment')),
      () => this.initializeData('landType', 'landTypeData', () => this.fetchCatalogTypes('land')),
      () => this.initializeData('planeswalkerType', 'planeswalkerTypeData', () => this.fetchCatalogTypes('planeswalker')),
      () => this.initializeData('spellType', 'spellTypeData', () => this.fetchCatalogTypes('spell')),
      () => this.initializeData('keywordAbility', 'keywordAbilityData', () => this.fetchKeywordAbilities()),
      () => this.initializeData('keywordAction', 'keywordActionData', () => this.fetchKeywordActions()),
      () => this.initializeData('abilityWord', 'abilityWordData', () => this.fetchAbilityWords())
    ];

    from(tasks).pipe(
      concatMap(task => of(task()).pipe(delay(2000)))
    ).subscribe({
      next: () => {
        console.log('Task completed...');
      },
      error: (err) => {
        console.error('Loading failed', err);
        this.isLoading = false; // Hide if something breaks
      },
      complete: () => {
        console.log('All library data initialized!');
        this.isLoading = false; // <--- HIDE THE OVERLAY HERE
      }
    });

  }

  // allow efficient fetch 
  private initializeData(lsKey: string, propertyName: string, fetchFn: () => void) {
    const localData = localStorage.getItem(lsKey);

    if (localData) {
      // Dynamically assign to the class property
      (this as any)[propertyName] = JSON.parse(localData);
    } else {
      fetchFn();
    }
  }

  fetchRandomCard() {
    this.cardData = null;
    this.isLoading = true;
    this.isFlipped = false;
    this.rotationDeg = 0;

    this.http.get<any>(`https://api.scryfall.com/cards/random${this.getURLQuery()}`).subscribe({
      next: (res) => {
        this.cardData = res;
        this.updateDisplayImage()
      },
      error: (err) => console.error(`Error fetching card data: ${err}`),
      complete: () => console.log('Successfully fetching card data.')
    })
  }

  fetchSymbology() {
    this.http.get<any>('https://api.scryfall.com/symbology').subscribe({
      next: (res) => {
        this.symbolData = res;
        localStorage.setItem('symbology', JSON.stringify(res));
      },
      error: (err) => console.error(`Error fetching symbol data: ${err}`),
      complete: () => console.log('Successfully fetching symbol data.')
    })
  }

  fetchCatalogTypes(name: string) {
    this.http.get<any>(`https://api.scryfall.com/catalog/${name}-types`).subscribe({
      next: (res) => {
        (this as any)[`${name}Data`] = res;
        localStorage.setItem(`${name}Type`, JSON.stringify(res));
      },
      error: (err) => console.error(`Error fetching ${name} types data: ${err}`),
      complete: () => console.log(`Successfully fetching ${name} types data.`)
    })
  }

  fetchKeywordAbilities() {
    this.http.get<any>('https://api.scryfall.com/catalog/keyword-abilities ').subscribe({
      next: (res) => {
        this.symbolData = res;
        localStorage.setItem('keywordAbility', JSON.stringify(res));
      },
      error: (err) => console.error(`Error fetching keyword ability data: ${err}`),
      complete: () => console.log('Successfully fetching keyword ability data.')
    })
  }

  fetchKeywordActions() {
    this.http.get<any>('https://api.scryfall.com/catalog/keyword-actions').subscribe({
      next: (res) => {
        this.symbolData = res;
        localStorage.setItem('keywordAction', JSON.stringify(res));
      },
      error: (err) => console.error(`Error fetching keyword action data: ${err}`),
      complete: () => console.log('Successfully fetching keyword action data.')
    })
  }

  fetchAbilityWords() {
    this.http.get<any>('https://api.scryfall.com/catalog/ability-words').subscribe({
      next: (res) => {
        this.symbolData = res;
        localStorage.setItem('abilityWord', JSON.stringify(res));
      },
      error: (err) => console.error(`Error fetching ability word data: ${err}`),
      complete: () => console.log('Successfully fetching ability word data.')
    })
  }

  // convert string to svg url
  mappedSymbols(raw: string) {
    const symbols = raw.match(/\{[^}]+\}/g); // This regex looks for text inside {braces}

    console.log('Symbol:', raw, 'Extracted Symbol:', symbols);

    const mappedSymbols = symbols?.map((symbol) => {
      const found = this.symbolData.data.find((item: any) => item.symbol === symbol);
      console.log(`Looking for ${symbol}, found:`, found);
      return found;
    }).filter(Boolean) || [];

    console.log('Mapped symbols:', mappedSymbols);

    return mappedSymbols;
  }

  // dynamic filter selection
  selectCardType(name: string, type: string) {
    this.clearSelectedFilter();
    name = name.replace(/^./, char => char.toUpperCase()); // first letter is uppercase
    (this as any)[`selected${name}Type`] = type;
    console.log(`${name} type "${type}" selected.`);
  }

  clearSelectedFilter() {
    this.selectedArtifactType = ''
    this.selectedBattleType = ''
    this.selectedCreatureType = ''
    this.selectedEnchantmentType = ''
    this.selectedLandType = ''
    this.selectedPlaneswalkerType = ''
    this.selectedSpellType = ''
  }

  getURLQuery(): string {
    const parts: string[] = [];

    // 1. Handle Card Type
    if (this.selectedCardType) {
      parts.push(`t:${encodeURIComponent(this.selectedCardType)}`);
    }

    // 2. Handle Sub-Types (Artifact, Creature, etc.)
    // We use || to find the first truthy value among the specific type filters
    const specificType = this.selectedArtifactType ||
      this.selectedBattleType ||
      this.selectedCreatureType ||
      this.selectedEnchantmentType ||
      this.selectedLandType ||
      this.selectedPlaneswalkerType ||
      this.selectedSpellType;

    if (specificType) {
      parts.push(`t:${encodeURIComponent(specificType)}`);
    }

    // 3. Handle Mana Colors
    if (this.selectedManaColors?.length > 0) {
      const codes = this.selectedManaColors
        .map(item => item.code.replace(/[{}]/g, ''))
        .join('');
      parts.push(`c:${codes}`);
    }

    // Final Assembly
    return parts.length > 0 ? `?q=${parts.join('+')}` : '';
  }

  isDoubleSidedCard() {
    if (this.cardData?.image_uris?.normal) return false;
    return true;
  }

  flipCard() {
    this.isFlipped = !this.isFlipped

    setTimeout(() => {
      this.updateDisplayImage();
    }, 100)
  }

  getFlippedCard() {
    if (this.cardData?.card_faces) {
      if (this.isFlipped) return this.cardData?.card_faces[0];
      if (!this.isFlipped) return this.cardData?.card_faces[1];
    } else {
      return this.cardData;
    }
  }

  rotateCard() {
    this.rotationDeg += 90;
  }

  onImageLoad() {
    this.isLoading = false;
  }

  updateDisplayImage() {
    if (this.cardData?.card_faces) {
      this.displayImageUrl = this.isFlipped
        ? this.cardData.card_faces[1].image_uris.normal
        : this.cardData.card_faces[0].image_uris.normal;
    } else {
      this.displayImageUrl = this.cardData?.image_uris?.normal;
    }
    console.log('displayImageUrl', this.displayImageUrl);

  }

  selectColorMana(raw: any) {
    const isAlreadySelected = this.selectedManaColors.some(item => item.code === raw.code);

    if (isAlreadySelected) {
      this.selectedManaColors = this.selectedManaColors.filter(item => item.code !== raw.code);
    } else {
      this.selectedManaColors.push(raw);
    }

  }

  clearColorSelections() {
    this.selectedManaColors = [];
  }

  clickCard() {
    this.showImageViewer = true;
    console.log('yes');

  }

  closeImageViewer() {
    this.showImageViewer = false;
    document.body.style.overflow = 'auto';
  }
}
