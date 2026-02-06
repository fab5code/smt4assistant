import { compare } from '../utility';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Demon } from '../demon';
import { FusionGraphComponent } from '../fusion-graph/fusion-graph.component';
import { FusionResult, FusionSearcher, SearchDemonOptions, SearchOptions } from '../fusionSearch';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import { Sort } from '@angular/material/sort';
import { saveDemonUserInfos } from '../manageUserData';

@Component({
  selector: 'app-fusion-details',
  templateUrl: './fusion-details.component.html',
  styleUrls: ['./fusion-details.component.scss']
})
export class FusionDetailsComponent {
  private showDetailsSubscription!: Subscription;

  @Input() demons!: Map<string, Demon>;
  @Input() fusionSearcher!: FusionSearcher;
  @Input() onShowFusionDetails!: Observable<SearchDemonOptions>;
  @Output() onInPartyChange = new EventEmitter<any>();
  @Output() onDemonUserInfoChange = new EventEmitter<any>();
  @Output() showDetails = new EventEmitter<Demon>();
  demon?: Demon;
  searchOptions?: SearchOptions;
  fusionResults?: FusionResult[];
  sortedFusionResults?: FusionResult[];
  maxNbFusionResults: number = 50;

  constructor(public dialog: MatDialog) {
  }

  ngOnInit() {
    this.showDetailsSubscription = this.onShowFusionDetails.subscribe((searchDemonOptions) => this.searchDemon(searchDemonOptions.demon, searchDemonOptions.options));
  }

  ngOnDestroy() {
    this.showDetailsSubscription.unsubscribe();
  }

  searchDemon(demon: Demon, options: SearchOptions) {
    this.demon = demon;
    this.searchOptions = options;
    this.fusionResults = this.fusionSearcher.searchDemon(this.demon.name, options);
    this.fusionResults.sort((a, b) => (a.score - b.score));
    this.sortedFusionResults = this.fusionResults.slice(0, this.maxNbFusionResults);
  }

  sortFusions(sort: Sort) {
    if (!this.fusionResults) {
      return;
    }
    const data = this.fusionResults.slice(0, this.maxNbFusionResults);
    if (!sort.active || sort.direction === '') {
      this.sortedFusionResults = data;
      return;
    }

    this.sortedFusionResults = data.sort((a: FusionResult, b: FusionResult) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'nbFusions':
          return compare(a.nbFusions, b.nbFusions, isAsc);
        case 'nbDemons':
          return compare(a.nbDemons, b.nbDemons, isAsc);
        case 'nbEasyNotInParty':
          return compare(a.nbEasyNotInParty, b.nbEasyNotInParty, isAsc);
        case 'nbInParty':
          return compare(a.nbInParty, b.nbInParty, isAsc);
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

  showFusionTree(fusionResult: FusionResult): void {
    const dialogRef = this.dialog.open(FusionGraphComponent, {
      data: fusionResult,
      height: '80%',
      width: '80%'
    });
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
