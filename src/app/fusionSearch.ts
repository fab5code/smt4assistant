import * as fusionsByDemonData from '../assets/files/fusionsByDemon.json';
import { cartesianProduct } from './utility';
import { Demon } from './demon';
import { PlayerInfo } from './playerInfo';

const fusionsByDemon: Map<string, string[][]> = new Map(Object.entries(fusionsByDemonData));

interface FusionNode {
  demon: Demon,
  parentsList?: FusionNode[][]
}

export interface FusionPath {
  demon: Demon,
  parents?: FusionPath[]
}

export interface FusionResult {
  target: Demon,
  fusionPath: FusionPath,
  usedDemons: Map<Demon, number>
  nbFusions: number,
  nbDemons: number,
  nbEasyNotInParty: number,
  nbInParty: number,
  inPartyDemons: Demon[],
  hasDuplicateUneasyInParty: boolean,
  score: number
}

export interface SearchResult {
  target: Demon,
  inPartyDemons: Demon[],
  score: number
}

export interface SearchOptions {
  usedDemon?: Demon,
  temporaryDemon?: Demon
}

export interface SearchDemonOptions {
  demon: Demon,
  options: SearchOptions
}

export class FusionSearcher {
  demons: Map<string, Demon>;
  playerInfo: PlayerInfo;

  constructor(demons: Map<string, Demon>, playerInfo: PlayerInfo) {
    this.demons = demons;
    this.playerInfo = playerInfo;
  }

  searchDemons(options: SearchOptions): SearchResult[] {
    const targets: string[] = [];
    for (let demon of this.demons.values()) {
      if (demon.level > this.playerInfo.level) {
        continue;
      }
      if (demon?.userInfo?.collected || demon?.userInfo?.easy || demon?.userInfo?.inParty) {
        continue;
      }
      targets.push(demon.name);
    }
    if (targets.length === 0) {
      return [];
    }

    const searchResults: SearchResult[] = [];
    for (let target of targets) {
      let fusionResults = this.searchDemon(target, options);
      if (fusionResults.length === 0) {
        continue;
      }

      fusionResults.sort((a, b) => (a.score - b.score));
      fusionResults = fusionResults.slice(0, 50);
      const inPartyDemons: Set<Demon> = new Set();
      for (let fusionResult of fusionResults) {
        for (let demon of fusionResult.inPartyDemons) {
          inPartyDemons.add(demon);
        }
      }
      const bestFusionResult = fusionResults.reduce((prev, curr) => prev.score < curr.score ? prev : curr);
      const searchResult: SearchResult = {target: this.demons.get(target)!, score: bestFusionResult.score, inPartyDemons: Array.from(inPartyDemons)};
      searchResults.push(searchResult);
    }
    return searchResults;
  }

  searchDemon(demonName: string, options: SearchOptions): FusionResult[] {
    if (options.temporaryDemon) {
      // Temporary change temporary demon in party value for the time of the search.
      var temporaryDemonInParty = options.temporaryDemon.userInfo.inParty;
      options.temporaryDemon.userInfo.inParty = true;
    }
    let fusionResults: FusionResult[] = this.findFusionResults(demonName, options, 2) ?? [];
    if (fusionResults.length < 30) {
      fusionResults = this.findFusionResults(demonName, options, 3) ?? fusionResults;
    }
    if (options.temporaryDemon) {
      options.temporaryDemon.userInfo.inParty = temporaryDemonInParty!;
    }
    return fusionResults;
  }

  findFusionResults(demonName: string, options: SearchOptions, maxRecursionLevel: number) {
    const fusionNodeCache: Map<string, FusionNode | null> = new Map();
    const fusionNode = this.getFusionNodeWithCache(fusionNodeCache, '', demonName, new Set(), true, maxRecursionLevel, 0);
    if (!fusionNode) {
      return [];
    }
    // If there are too many results to process, abort the search.
    if (this.getNbFusionPaths(fusionNode) > 100000) {
      return null;
    }

    let fusionResults: FusionResult[] = [];
    const fusionPaths: FusionPath[] = this.getFusionPaths(fusionNode);
    for (let fusionPath of fusionPaths) {
      const fusionResult: FusionResult = this.getFusionResult(fusionPath);
      if (!fusionResult.hasDuplicateUneasyInParty) {
        fusionResults.push(fusionResult);
      }
    }
    if (options.usedDemon) {
      fusionResults = fusionResults.filter((fusionResult) => fusionResult.usedDemons.has(options.usedDemon!));
    }
    if (options.temporaryDemon) {
      fusionResults = fusionResults.filter((fusionResult) => fusionResult.usedDemons.has(options.temporaryDemon!));
    }
    return fusionResults;
  }

  getFusionNodeWithCache(fusionNodeCache: Map<string, FusionNode | null>, previousCacheKey: string, demonName: string, precedentDemonNames: Set<string>,
      isFirst: boolean, maxRecursionLevel: number, recursionLevel: number): FusionNode | null {
    let cacheKey = previousCacheKey + '_' + demonName;
    if (fusionNodeCache.has(cacheKey)) {
      return fusionNodeCache.get(cacheKey)!;
    }
    let fusionNode = this.getFusionNode(fusionNodeCache, cacheKey, demonName, precedentDemonNames, isFirst, maxRecursionLevel, recursionLevel);
    fusionNodeCache.set(cacheKey, fusionNode);
    return fusionNode;
  }

  getFusionNode(fusionNodeCache: Map<string, FusionNode | null>, cacheKey: string, demonName: string, precedentDemonNames: Set<string>,
      isFirst: boolean, maxRecursionLevel: number, recursionLevel: number): FusionNode | null {
    if (precedentDemonNames.has(demonName)) {
      return null;
    }
    precedentDemonNames.add(demonName);

    let demon = this.demons.get(demonName)!;
    if (!isFirst && demon.level > this.playerInfo.level) {
      return null;
    }
    if (!isFirst && (demon?.userInfo?.easy || demon?.userInfo?.inParty || demon.tribe === 'Element')) {
      return {demon: demon};
    }

    if (recursionLevel >= maxRecursionLevel) {
      return null;
    }

    if (demon.fusions) {
      let parents: FusionNode[] = [];
      for (let fusionDemonName of demon.fusions) {
        let parent: FusionNode | null = this.getFusionNodeWithCache(fusionNodeCache, cacheKey, fusionDemonName,
            new Set(precedentDemonNames), false, maxRecursionLevel, recursionLevel + 1);
        if (!parent) {
          return null;
        }
        parents.push(parent);
      }
      return {demon: demon, parentsList: [parents]};
    } else if (fusionsByDemon.has(demon.name)) {
      let parentsList: FusionNode[][] = [];
      for (let fusionInfo of fusionsByDemon.get(demon.name)!) {
        let parents: FusionNode[] | null = [];
        for (let fusionDemonName of fusionInfo) {
          let parent = this.getFusionNodeWithCache(fusionNodeCache, cacheKey, fusionDemonName, new Set(precedentDemonNames), false, maxRecursionLevel, recursionLevel + 1);
          if (!parent) {
            parents = null;
            break;
          }
          parents.push(parent);
        }
        if (parents) {
          parentsList.push(parents);
        }
      }
      if (parentsList.length !== 0) {
        return {demon: demon, parentsList: parentsList};
      }
    }
    return null;
  }

  getFusionPaths(fusionNode: FusionNode): FusionPath[] {
    if (!fusionNode.parentsList) {
      return [{demon: fusionNode.demon}];
    }

    let fusionPaths: FusionPath[] = [];
    for (let parents of fusionNode.parentsList) {
      let parentsPaths: FusionPath[][] = [];
      for (let parent of parents) {
        let parentPaths: FusionPath[] = this.getFusionPaths(parent);
        parentsPaths.push(parentPaths);
      }
      let paths: FusionPath[][] = cartesianProduct(parentsPaths);
      for (let path of paths) {
        fusionPaths.push({demon: fusionNode.demon, parents: path});
      }
    }
    return fusionPaths;
  }

  getFusionResult(fusionPath: FusionPath): FusionResult {
    let fusionResult: FusionResult = {
      target: fusionPath.demon,
      fusionPath: fusionPath,
      usedDemons: new Map(),
      nbFusions: 1,
      nbDemons: 0,
      nbEasyNotInParty: 0,
      nbInParty: 0,
      inPartyDemons: [],
      hasDuplicateUneasyInParty: false,
      score: 0
    };
    for (let path of fusionPath.parents!) {
      this.updateFusionResult(fusionResult, path);
    }
    return fusionResult;
  }

  updateFusionResult(fusionResult: FusionResult, fusionPath: FusionPath): void {
    if (fusionPath.parents) {
      fusionResult.nbFusions++;
      for (let path of fusionPath.parents) {
        this.updateFusionResult(fusionResult, path);
      }
      return;
    }

    fusionResult.nbDemons++;
    if (fusionPath.demon?.userInfo?.easy && !fusionPath.demon?.userInfo?.inParty) {
      fusionResult.nbEasyNotInParty++;
      fusionResult.score += 1; // TODO: update with value given by user
    }
    if (fusionPath.demon?.userInfo?.inParty) {
      if (fusionResult.inPartyDemons.includes(fusionPath.demon)) {
        if (fusionPath.demon?.userInfo?.easy) {
          fusionResult.nbEasyNotInParty++;
          fusionResult.score += 1; // TODO: update with value given by user
        } else if (fusionPath.demon.tribe === 'Element') {
          // TODO: maybe could manage it differently
          fusionResult.score += 2;
        } else {
          fusionResult.hasDuplicateUneasyInParty = true;
        }
      } else {
        fusionResult.nbInParty++;
        fusionResult.score += 0.5; // TODO: update with value given by user
        fusionResult.inPartyDemons.push(fusionPath.demon);
      }
    }
    if (!fusionPath.demon?.userInfo?.easy && !fusionPath.demon?.userInfo?.inParty && fusionPath.demon.tribe === 'Element') {
      // TODO: maybe could manage it differently
      fusionResult.score += 2;
    }

    if (!fusionResult.usedDemons.has(fusionPath.demon)) {
      fusionResult.usedDemons.set(fusionPath.demon, 0);
    }
    fusionResult.usedDemons.set(fusionPath.demon, fusionResult.usedDemons.get(fusionPath.demon)! + 1);
  }

  getNbFusionPaths(fusionNode: FusionNode): number {
    if (!fusionNode.parentsList) {
      return 1;
    }
    let nbPaths = 0;
    for (let parents of fusionNode.parentsList) {
      let nbParentsPaths = 1;
      for (let parent of parents) {
        let nbParentPaths = this.getNbFusionPaths(parent);
        nbParentsPaths *= nbParentPaths;
      }
      nbPaths += nbParentsPaths;
    }
    return nbPaths;
  }
}
