import { Demon } from './demon';
import { DemonUserInfo } from './demonUserInfo';
import { localStoragaAvailable } from './utility';
import { PlayerInfo } from './playerInfo';

const playerInfoLocalStorageKey: string = 'smtAssistant-playerInfo';
const userInfosLocalStorageKey: string = 'smtAssistant-userInfos';

export function getPlayerInfo(): PlayerInfo | null {
  if (!localStoragaAvailable()) {
    return null;
  }
  let playerInfoData: string | null = localStorage.getItem(playerInfoLocalStorageKey);
  if (!playerInfoData) {
    return null;
  }
  try {
    return JSON.parse(playerInfoData);
  } catch {
    return null;
  }
}

export function savePlayerInfo(playerInfo: PlayerInfo): void {
  if (!localStoragaAvailable()) {
    return;
  }
  localStorage.setItem(playerInfoLocalStorageKey, JSON.stringify(playerInfo));
}

export function updateDemonsWithDemonUserInfos(demons: Map<string, Demon>, demonUserInfos: Map<string, DemonUserInfo>): void {
  for (const [demonName, userInfo] of demonUserInfos) {
    if (demons.has(demonName)) {
      demons.get(demonName)!.userInfo = userInfo;
    }
  }
}

export function updateDemonsWithDemonUserInfosFromLocalStorage(demons: Map<string, Demon>): void {
  if (!localStoragaAvailable()) {
    return;
  }
  let userInfosData: string | null = localStorage.getItem(userInfosLocalStorageKey);
  if (!userInfosData) {
    return;
  }
  try {
    var demonUserInfos: Map<string, DemonUserInfo> = new Map(JSON.parse(userInfosData));
  } catch {
    return;
  }
  updateDemonsWithDemonUserInfos(demons, demonUserInfos);
}

function getDemonUserInfos(demons: Map<string, Demon>): Map<string, DemonUserInfo> {
  let userInfos: Map<string, DemonUserInfo> = new Map();
  for (let demon of demons.values()) {
    userInfos.set(demon.name, demon.userInfo);
  }
  return userInfos;
}

export function saveDemonUserInfos(demons: Map<string, Demon>): void {
  if (!localStoragaAvailable()) {
    return;
  }
  const userInfos = getDemonUserInfos(demons);
  localStorage.setItem(userInfosLocalStorageKey, JSON.stringify(Array.from(userInfos.entries())));
}

export function downloadUserData(demons: Map<string, Demon>, playerInfo: PlayerInfo): void {
  const userData = {
    demonUserInfos: Object.fromEntries(getDemonUserInfos(demons)),
    playerInfo: playerInfo
  }
  downloadJson(userData, 'smt4FusionAssitantConfig');
}

function downloadJson(jsonObject: object, filename: string): void {
  var jsonData = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonObject));
  var downloadNode = document.createElement('a');
  downloadNode.setAttribute("href", jsonData);
  downloadNode.setAttribute("download", filename + ".json");
  document.body.appendChild(downloadNode);
  downloadNode.click();
  downloadNode.remove();
}
