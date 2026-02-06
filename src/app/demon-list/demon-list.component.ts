import { compare, localStoragaAvailable } from '../utility';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Demon } from '../demon';
import { PlayerInfo } from './../playerInfo';
import { saveDemonUserInfos } from '../manageUserData';
import { SearchDemonOptions } from '../fusionSearch';
import { Sort } from '@angular/material/sort';

@Component({
  selector: 'app-demon-list',
  templateUrl: './demon-list.component.html',
  styleUrls: ['./demon-list.component.scss']
})
export class DemonListComponent {
  private filterInfoLocalStorageKey: string = 'smtAssistant-demonList-filterInfo';

  @Input() demons!: Map<string, Demon>;
  @Input() playerInfo!: PlayerInfo;
  @Output() showDetails = new EventEmitter<Demon>();
  @Output() showFusionDetails = new EventEmitter<SearchDemonOptions>();
  @Output() onInPartyChange = new EventEmitter<any>();
  @Output() onDemonUserInfoChange = new EventEmitter<any>();
  sortedDemons!: Demon[];
  displayedDemons!: Demon[];
  filterInfo: {level: boolean, collected: number, easy: number, inParty: number, contains: string} = {level: false, collected: 0, easy: 0, inParty: 0, contains: ''};

  ngOnInit() {
    this.loadFilterInfo();
    this.sortedDemons = Array.from(this.demons.values());
    this.sortedDemons.sort((demonA, demonB) => (demonB.level - demonA.level));
    this.applyFilter();
  }

  filterByPlayerLevel() {
    this.filterInfo.level = !this.filterInfo.level;
    this.applyFilter();
    this.saveFilterInfo();
  }

  filterByCollected() {
    this.filterInfo.collected = (this.filterInfo.collected + 1) % 3;
    this.applyFilter();
    this.saveFilterInfo();
  }

  filterByEasy() {
    this.filterInfo.easy = (this.filterInfo.easy + 1) % 3;
    this.applyFilter();
    this.saveFilterInfo();
  }

  filterByInParty() {
    this.filterInfo.inParty = (this.filterInfo.inParty + 1) % 3;
    this.applyFilter();
    this.saveFilterInfo();
  }

  applyFilter() {
    this.displayedDemons = this.sortedDemons.filter(demon => {
      if (this.filterInfo.level && demon.level > this.playerInfo.level) {
        return false;
      }
      if (this.filterInfo.collected === 1 && !demon.userInfo.collected) {
        return false;
      }
      if (this.filterInfo.collected === 2 && demon.userInfo.collected) {
        return false;
      }
      if (this.filterInfo.easy === 1 && !demon.userInfo.easy) {
        return false;
      }
      if (this.filterInfo.easy === 2 && demon.userInfo.easy) {
        return false;
      }
      if (this.filterInfo.inParty === 1 && !demon.userInfo.inParty) {
        return false;
      }
      if (this.filterInfo.inParty === 2 && demon.userInfo.inParty) {
        return false;
      }
      if (this.filterInfo.contains) {
        let demonValue = demon.tribe + ' ' + demon.name + ' ' + demon.level;
        if (!demonValue.toLocaleLowerCase().includes(this.filterInfo.contains.toLocaleLowerCase())) {
          return false;
        }
      }
      return true;
    });
  }

  sortDemons(sort: Sort) {
    const data = Array.from(this.demons.values());
    data.sort((demonA, demonB) => (demonA.level - demonB.level));
    if (!sort.active || sort.direction === '') {
      this.sortedDemons = data;
      return;
    }

    this.sortedDemons = data.sort((a: Demon, b: Demon) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'tribe':
          return compare(a.tribe, b.tribe, isAsc);
        case 'name':
          return compare(a.name, b.name, isAsc);
        case 'level':
          return compare(a.level, b.level, isAsc);
        case 'collected':
          return compare(a.userInfo.collected, b.userInfo.collected, !isAsc);
        case 'easy':
          return compare(a.userInfo.easy, b.userInfo.easy, !isAsc);
        case 'inParty':
          return compare(a.userInfo.inParty, b.userInfo.inParty, !isAsc);
        default:
          return 0;
      }
    });
    this.applyFilter();
  }

  setDemonCollected(name: string, collected: boolean): void {
    const demon = this.demons.get(name)!;
    demon.userInfo.collected = collected;
    this.onDemonUserInfoChange.emit(null);
    saveDemonUserInfos(this.demons);
  }

  setDemonEasy(name: string, easy: boolean): void {
    const demon = this.demons.get(name)!;
    demon.userInfo.easy = easy;
    this.onDemonUserInfoChange.emit(null);
    saveDemonUserInfos(this.demons);
  }

  setDemonInParty(name: string, inParty: boolean): void {
    const demon = this.demons.get(name)!;
    demon.userInfo.inParty = inParty;
    this.onInPartyChange.emit(null);
    saveDemonUserInfos(this.demons);
  }

  onfilterContainsChange(): void {
    this.applyFilter();
    this.saveFilterInfo();
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
    const filterInfoData: string | null = localStorage.getItem(this.filterInfoLocalStorageKey);
    if (!filterInfoData) {
      return;
    }
    this.filterInfo = JSON.parse(filterInfoData);
  }

  showDemonDetails(demon: Demon): void {
    this.showDetails.emit(demon);
  }

  showDemonFusionDetails(demon: Demon): void {
    this.showFusionDetails.emit({demon: demon, options: {}});
  }
}
