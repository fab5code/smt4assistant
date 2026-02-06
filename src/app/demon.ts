import { DemonUserInfo } from './demonUserInfo';

export interface Demon {
  tribe: string,
  alignment: string,
  name: string,
  level: number,
  stats: {
    hp: number,
    mp: number,
    strength: number,
    skill: number,
    magic: number,
    speed: number,
    luck: number
  },
  affinity: {
    physical: string,
    gun: string,
    fire: string,
    ice: string,
    thunder: string,
    shock: string,
    banish: string,
    curse: string,
    bind: string,
    sleep: string,
    cold: string,
    confusion: string,
    poison: string
  }
  skills: {
      name: string,
      level: number
  }[]
  fusions?: string[],
  userInfo: DemonUserInfo
}