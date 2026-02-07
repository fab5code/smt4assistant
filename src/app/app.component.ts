import {Component} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Subject} from 'rxjs';
import * as demonsData from '../assets/files/demons.json';
import {Demon} from './demon';
import {FusionSearcher, SearchDemonOptions} from './fusionSearch';
import {downloadUserData, getPlayerInfo, saveDemonUserInfos, savePlayerInfo, updateDemonsWithDemonUserInfos, updateDemonsWithDemonUserInfosFromLocalStorage} from './manageUserData';
import {PlayerInfo} from './playerInfo';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  mainTabsIndex = 0;
  showDetailsSubject: Subject<Demon> = new Subject<Demon>();
  showFusionDetailsSubject: Subject<SearchDemonOptions> = new Subject<SearchDemonOptions>();
  onInPartyChangeSubject: Subject<any> = new Subject<any>();
  onDemonUserInfoChangeSubject: Subject<any> = new Subject<any>();
  onPlayerLevelChangeSubject: Subject<any> = new Subject<any>();
  demons: Map<string, Demon> = new Map();
  playerInfo: PlayerInfo;
  fusionSearcher: FusionSearcher;

  constructor(private snackBar: MatSnackBar) {
    for (let [demonName, demonData] of Object.entries(demonsData)) {
      if (demonName === 'default') {
        continue;
      }
      let demon = Object.assign(
        demonData,
        {
          userInfo: {
            collected: false,
            easy: false,
            inParty: false
          }
        }
      );
      this.demons.set(demonName, demon);
    }
    updateDemonsWithDemonUserInfosFromLocalStorage(this.demons);
    this.playerInfo = getPlayerInfo() ?? {level: 5};
    this.fusionSearcher = new FusionSearcher(this.demons, this.playerInfo);
  }

  onShowDetails(demon: Demon) {
    this.showDetailsSubject.next(demon);
    this.mainTabsIndex = 1;
  }

  onShowFusionDetails(options: SearchDemonOptions) {
    this.showFusionDetailsSubject.next(options);
    this.mainTabsIndex = 3;
  }

  onInPartyChange() {
    this.onInPartyChangeSubject.next(null);
  }

  onDemonUserInfoChange() {
    this.onDemonUserInfoChangeSubject.next(null);
  }

  onPlayerLevelChange() {
    this.onPlayerLevelChangeSubject.next(null);
  }

  importUserData(importNode: any) {
    if (importNode.files.length === 0) {
      return;
    }
    if (importNode.files.length !== 1) {
      this.showErrorAlert('Could not import config.');
      return;
    }

    let fileReader = new FileReader();
    fileReader.onload = (event) => {
      try {
        var userData = JSON.parse(event.target?.result! as string);
        updateDemonsWithDemonUserInfos(this.demons, new Map(Object.entries(userData.demonUserInfos)));
        this.playerInfo.level = userData.playerInfo.level;

        importNode.value = '';
        this.onInPartyChange();
        this.onDemonUserInfoChange();
        saveDemonUserInfos(this.demons);
        savePlayerInfo(this.playerInfo);

        this.showSuccessAlert('Player data imported.');
      } catch {
        this.showErrorAlert('Could not properly import player data.');
      }
    };
    fileReader.readAsText(importNode.files.item(0));
  }

  downloadUserData() {
    downloadUserData(this.demons, this.playerInfo);
  }

  showSuccessAlert(message: string) {
    this.snackBar.open(message, 'Close', {
      panelClass: ['l-alert-success'],
      verticalPosition: 'top'
    });
  }

  showErrorAlert(message: string) {
    this.snackBar.open(message, 'Close', {
      panelClass: ['l-alert-error'],
      verticalPosition: 'top'
    });
  }
}
