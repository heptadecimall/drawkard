import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule],
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

  isFlipped: boolean = true;
  rotationDeg = 0;
  isLoading: boolean = false;
  displayImageUrl: string = '';


  ngOnInit() {
    this.initializeData('symbology', 'symbolData', () => this.fetchSymbology());
    this.initializeData('cardType', 'cardTypeData', () => this.fetchCatalogTypes('card'));
    this.initializeData('artifactType', 'artifactTypeData', () => this.fetchCatalogTypes('artifact'));
    this.initializeData('battleType', 'battleTypeData', () => this.fetchCatalogTypes('battle'));
    this.initializeData('creatureType', 'creatureTypeData', () => this.fetchCatalogTypes('creature'));
    this.initializeData('enchantmentType', 'enchantmentTypeData', () => this.fetchCatalogTypes('enchantment'));
    this.initializeData('landType', 'landTypeData', () => this.fetchCatalogTypes('land'));
    this.initializeData('planeswalkerType', 'planeswalkerTypeData', () => this.fetchCatalogTypes('planeswalker'));
    this.initializeData('spellType', 'spellTypeData', () => this.fetchCatalogTypes('spell'));
    this.initializeData('keywordAbility', 'keywordAbilityData', () => this.fetchKeywordAbilities());
    this.initializeData('keywordAction', 'keywordActionData', () => this.fetchKeywordActions());
    this.initializeData('abilityWord', 'abilityWordData', () => this.fetchAbilityWords());
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

  getURLQuery() {

    const otherFilter = this.selectedArtifactType ||
      this.selectedBattleType ||
      this.selectedCreatureType ||
      this.selectedEnchantmentType ||
      this.selectedLandType ||
      this.selectedPlaneswalkerType ||
      this.selectedSpellType ||
      '';

    if (otherFilter) {
      return `?q=t:${encodeURIComponent(this.selectedCardType)}%20t:${encodeURIComponent(otherFilter)}`
    } else {
      return `?q=t:${encodeURIComponent(this.selectedCardType)}`
    }
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
}
