import * as fusionsByDemonData from '../../assets/files/fusionsByDemon.json';
import { compare, localStoragaAvailable } from '../utility';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Demon } from '../demon';
import { Observable, Subscription } from 'rxjs';
import { PlayerInfo } from './../playerInfo';
import { SearchDemonOptions } from '../fusionSearch';
import { Sort } from '@angular/material/sort';
import { saveDemonUserInfos } from '../manageUserData';

export const fusionsByDemon: Map<string, string[][]> = new Map(Object.entries(fusionsByDemonData));

@Component({
  selector: 'app-demon-details',
  templateUrl: './demon-details.component.html',
  styleUrls: ['./demon-details.component.scss']
})
export class DemonDetailsComponent {
  private showDetailsSubscription!: Subscription;
  private filterInfoLocalStorageKey: string = 'smtAssistant-demonDetails-filterInfo';

  @Input() demons!: Map<string, Demon>;
  @Input() onShowDetails!: Observable<Demon>;
  @Input() playerInfo!: PlayerInfo;
  @Output() onInPartyChange = new EventEmitter<any>();
  @Output() onDemonUserInfoChange = new EventEmitter<any>();
  @Output() showFusionDetails = new EventEmitter<SearchDemonOptions>();
  demon?: Demon;
  fusions?: Demon[][];
  displayedFusions?: Demon[][];
  filterInfo: {level: boolean, collected: number, easy: number, inParty: number} = {level: false, collected: 0, easy: 0, inParty: 0};

  ngOnInit(){
    this.showDetailsSubscription = this.onShowDetails.subscribe((demon) => this.updateDemon(demon));
    this.loadFilterInfo();
  }

  ngOnDestroy() {
    this.showDetailsSubscription.unsubscribe();
  }

  updateDemon(demon: Demon): void {
    this.demon = demon;

    this.displayedFusions = [];
    if (this.demon.fusions) {
      const fusion: Demon[] = this.demon.fusions.map(demonId => this.demons.get(demonId)!);
      this.fusions = [fusion];
      return;
    }
    if (!fusionsByDemon.has(this.demon.name)) {
      this.fusions = [];
      return;
    }
    const fusions: string[][] = fusionsByDemon.get(this.demon.name)!;
    this.fusions = fusions.map((fusionInfo) => fusionInfo.map(demonId => this.demons.get(demonId)!));
    this.applyFilter();
  }

  filterByPlayerLevel() {
    this.filterInfo.level = !this.filterInfo.level;
    this.applyFilter();
    this.saveFilterInfo();
  }

  filterByCollected() {
    this.filterInfo.collected = (this.filterInfo.collected + 1) % 4;
    this.applyFilter();
    this.saveFilterInfo();
  }

  filterByEasy() {
    this.filterInfo.easy = (this.filterInfo.easy + 1) % 4;
    this.applyFilter();
    this.saveFilterInfo();
  }

  filterByInParty() {
    this.filterInfo.inParty = (this.filterInfo.inParty + 1) % 4;
    this.applyFilter();
    this.saveFilterInfo();
  }

  applyFilter() {
    if (!this.fusions) {
      return;
    }
    this.displayedFusions = this.fusions.filter(demons => {
      if (this.filterInfo.level && (demons[0].level > this.playerInfo.level || demons[1].level > this.playerInfo.level)) {
        return false;
      }
      if (this.filterInfo.collected === 1 && !demons[0].userInfo.collected && !demons[1].userInfo.collected) {
        return false;
      }
      if (this.filterInfo.collected === 2 && (!demons[0].userInfo.collected || !demons[1].userInfo.collected)) {
        return false;
      }
      if (this.filterInfo.collected === 3 && (demons[0].userInfo.collected || demons[1].userInfo.collected)) {
        return false;
      }
      if (this.filterInfo.easy === 1 && !demons[0].userInfo.easy && !demons[1].userInfo.easy) {
        return false;
      }
      if (this.filterInfo.easy === 2 && (!demons[0].userInfo.easy || !demons[1].userInfo.easy)) {
        return false;
      }
      if (this.filterInfo.easy === 3 && (demons[0].userInfo.easy || demons[1].userInfo.easy)) {
        return false;
      }
      if (this.filterInfo.inParty === 1 && !demons[0].userInfo.inParty && !demons[1].userInfo.inParty) {
        return false;
      }
      if (this.filterInfo.inParty === 2 && (!demons[0].userInfo.inParty || !demons[1].userInfo.inParty)) {
        return false;
      }
      if (this.filterInfo.inParty === 3 && (demons[0].userInfo.inParty || demons[1].userInfo.inParty)) {
        return false;
      }
      return true;
    });
  }

  sortFusions(sort: Sort) {
    if (!this.fusions) {
      return;
    }
    const data = this.fusions;
    if (!sort.active || sort.direction === '') {
      this.fusions = data;
      return;
    }

    this.fusions = data.sort((a: Demon[], b: Demon[]) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'tribe0':
          return compare(a[0].tribe, b[0].tribe, isAsc);
        case 'name0':
          return compare(a[0].name, b[0].name, isAsc);
        case 'level0':
          return compare(a[0].level, b[0].level, isAsc);
        case 'collected0':
          return compare(a[0].userInfo.collected, b[0].userInfo.collected, !isAsc);
        case 'easy0':
          return compare(a[0].userInfo.easy, b[0].userInfo.easy, !isAsc);
        case 'inParty0':
          return compare(a[0].userInfo.inParty, b[0].userInfo.inParty, !isAsc);
        default:
          return 0;
      }
    });
    this.applyFilter();
  }

  saveFilterInfo(): void {
    if (!localStoragaAvailable()) {
      return;
    }
    localStorage.setItem(this.filterInfoLocalStorageKey, JSON.stringify(this.filterInfo));
  }

  loadFilterInfo(): void {
    if (!localStoragaAvailable()) {
      return;
    }
    let filterInfoData: string | null = localStorage.getItem(this.filterInfoLocalStorageKey);
    if (!filterInfoData) {
      return;
    }
    this.filterInfo = JSON.parse(filterInfoData);
  }

  showDemonFusionDetails(demon: Demon): void {
    this.showFusionDetails.emit({demon: demon, options: {}});
  }

  setDemonCollected(collected: boolean): void {
    this.demon!.userInfo.collected = collected;
    this.onDemonUserInfoChange.emit(null);
    saveDemonUserInfos(this.demons);
  }

  setDemonEasy(easy: boolean): void {
    this.demon!.userInfo.easy = easy;
    this.onDemonUserInfoChange.emit(null);
    saveDemonUserInfos(this.demons);
  }

  setDemonInParty(inParty: boolean): void {
    this.demon!.userInfo.inParty = inParty;
    this.onInPartyChange.emit(null);
    saveDemonUserInfos(this.demons);
  }
}
