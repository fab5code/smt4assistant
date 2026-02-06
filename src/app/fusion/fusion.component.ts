import { compare } from '../utility';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Demon } from '../demon';
import { FormControl } from '@angular/forms';
import { FusionSearcher, SearchDemonOptions, SearchOptions, SearchResult } from '../fusionSearch';
import { map, startWith } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { PlayerInfo } from '../playerInfo';
import { Sort } from '@angular/material/sort';

@Component({
  selector: 'app-fusion',
  templateUrl: './fusion.component.html',
  styleUrls: ['./fusion.component.scss']
})
export class FusionComponent {
  private onInPartyChangeSubscription!: Subscription;
  private onPlayerLevelChangeSubscription!: Subscription;

  @Input() demons!: Map<string, Demon>;
  @Input() playerInfo!: PlayerInfo;
  @Input() fusionSearcher!: FusionSearcher;
  @Input() onInPartyChangeObservable!: Observable<any>;
  @Input() onPlayerLevelChangeObservable!: Observable<any>;
  @Output() showDetails = new EventEmitter<Demon>();
  @Output() showFusionDetails = new EventEmitter<SearchDemonOptions>();
  inPartyDemons!: Demon[];
  selectedInPartyDemon?: Demon;
  searchResults?: SearchResult[];
  sortedSearchResults?: SearchResult[];
  temporaryDemon?: Demon;
  temporaryDemonFormControl = new FormControl('');
  temporaryDemons: Demon[] = [];
  filteredTemporaryDemons!: Observable<Demon[]>;

  ngOnInit() {
    this.onInPartyChangeSubscription = this.onInPartyChangeObservable.subscribe(() => this.onInPartyChange());
    this.onPlayerLevelChangeSubscription = this.onPlayerLevelChangeObservable.subscribe(() => this.onPlayerLevelChange());

    this.filteredTemporaryDemons= this.temporaryDemonFormControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterTemporaryDemons(value || '')),
    );

    this.updateInPartyDemons();
    this.updateTemporaryDemons();
  }

  ngOnDestroy() {
    this.onInPartyChangeSubscription.unsubscribe();
    this.onPlayerLevelChangeSubscription.unsubscribe();
  }

  onInPartyChange() {
    this.updateInPartyDemons();
    this.updateTemporaryDemons();
  }

  onPlayerLevelChange() {
    this.updateTemporaryDemons();
  }

  updateInPartyDemons() {
    this.inPartyDemons = Array.from(this.demons.values()).filter(demon => demon.userInfo.inParty);
    if (this.selectedInPartyDemon && !this.inPartyDemons.includes(this.selectedInPartyDemon)) {
      this.selectedInPartyDemon = undefined;
    }
  }

  updateTemporaryDemons() {
    this.temporaryDemons = Array.from(this.demons.values()).filter(demon => {
      return demon.level <= this.playerInfo.level && !demon.userInfo.inParty;
    });
    this.temporaryDemons.sort((a, b) => compare(a.name, b.name, true));
  }

  filterTemporaryDemons(value: Demon| string) {
    if (typeof value === 'object') {
      return this.temporaryDemons;
    };
    return this.temporaryDemons.filter((demon: Demon) => {
      const optionValue = demon.tribe + ' ' + demon.name + ' ' + demon.level;
      return optionValue.toLowerCase().includes(value.toLowerCase());
    });
  }

  displayTemporaryDemonOption(demon: Demon | undefined) {
    if (!demon) {
      return '';
    }
    return demon.tribe + ' ' + demon.name + ' ' + demon.level;
  }

  getSearchOptions(inPartyDemon: Demon | undefined): SearchOptions {
    return {
      usedDemon: inPartyDemon,
      temporaryDemon: typeof this.temporaryDemon === 'object' ? this.temporaryDemon : undefined
    };
  }

  search(inPartyDemon: Demon | undefined) {
    let options = this.getSearchOptions(inPartyDemon);
    this.searchResults = this.fusionSearcher.searchDemons(options);
    this.searchResults.sort((a, b) => (a.score - b.score));
    this.sortedSearchResults = this.searchResults;
  }

  sortSearchResults(sort: Sort) {
    if (!this.searchResults) {
      return;
    }
    const data = this.searchResults;
    if (!sort.active || sort.direction === '') {
      this.sortedSearchResults = data;
      return;
    }

    this.sortedSearchResults = data.sort((a: SearchResult, b: SearchResult) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'tribe':
          return compare(a.target.tribe, b.target.tribe, isAsc);
        case 'name':
          return compare(a.target.name, b.target.name, isAsc);
        case 'level':
          return compare(a.target.level, b.target.level, isAsc);
        case 'score':
          return compare(a.score, b.score, isAsc);
        default:
          return 0;
      }
    });
  }

  showDemonDetails(demon: Demon): void {
    this.showDetails.emit(demon);
  }

  showDemonFusionDetails(demon: Demon, inPartyDemon: Demon | undefined): void {
    this.showFusionDetails.emit({demon: demon, options: this.getSearchOptions(inPartyDemon)});
  }
}
