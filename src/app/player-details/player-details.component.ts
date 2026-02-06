import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Demon } from '../demon';
import { Observable, Subscription } from 'rxjs';
import { PlayerInfo } from './../playerInfo';
import { savePlayerInfo } from '../manageUserData';

interface Stats {
  nbDemons: number,
  nbCollectedDemons: number,
  nbEasyDemons: number
}

@Component({
  selector: 'app-player-details',
  templateUrl: './player-details.component.html',
  styleUrls: ['./player-details.component.scss']
})
export class PlayerDetailsComponent {
  private playerInfoLocalStorageKey: string = 'smtAssistant-playerInfo';
  private onDemonUserInfoChangeSubscription!: Subscription;
  
  @Input() playerInfo!: PlayerInfo;
  @Input() demons!: Map<string, Demon>;
  @Input() onDemonUserInfoChangeObservable!: Observable<any>;
  @Output() onPlayerLevelChange = new EventEmitter<any>();
  stats?: Stats;

  ngOnInit() {
    this.onDemonUserInfoChangeSubscription = this.onDemonUserInfoChangeObservable.subscribe(() => this.onDemonUserInfoChange());
    this.updateStats();
  }

  ngOnDestroy() {
    this.onDemonUserInfoChangeSubscription.unsubscribe();
  }

  onDemonUserInfoChange() {
    this.updateStats();
  }

  updateStats() {
    let nbCollectedDemons = 0;
    let nbEasyDemons = 0;
    for (let demon of this.demons.values()) {
      if (demon?.userInfo.collected) {
        nbCollectedDemons++;
      }
      if (demon?.userInfo.easy) {
        nbEasyDemons++;
      }
    }
    this.stats = {
      nbDemons: this.demons.size,
      nbCollectedDemons: nbCollectedDemons,
      nbEasyDemons: nbEasyDemons
    }
  }

  onPlayerInfoChange(): void {
    savePlayerInfo(this.playerInfo);
    this.onPlayerLevelChange.emit(null);
  }
}
