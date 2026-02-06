import json
from math import ceil

with open('generated/demons.json') as file:
  demons = json.load(file)
with open('generated/fusionChart.json') as file:
  fusionChart = json.load(file)
with open('generated/tribes.json') as file:
  tribes = json.load(file)
with open('generated/elementalByTribe.json') as file:
  elementalByTribe = json.load(file)
with open('generated/rankByTribeAndElemental.json') as file:
  rankByTribeAndElemental = json.load(file)

demonNamesByTribe = {}
for demon in demons.values():
  if 'fusions' in demon:
    continue
  if demon['tribe'] not in demonNamesByTribe:
    demonNamesByTribe[demon['tribe']] = []
  demonNamesByTribe[demon['tribe']].append(demon['name'])
for demonNames in demonNamesByTribe.values():
  demonNames.sort(key=lambda demonName: (demons[demonName]['level']))

def main():
  generateFusions()
  #testFusion()
  #showFusions()

def generateFusions():
  fusionsByDemon = {}
  allDemons = list(demons.values())
  for i in range(len(allDemons)):
    demonA = allDemons[i]
    for j in range(i + 1):
      demonB = allDemons[j]
      demonName = tryFusion(demonA, demonB)
      if not demonName:
        continue
      if demonName not in fusionsByDemon:
        fusionsByDemon[demonName] = []
      fusionsByDemon[demonName].append([demonA['name'], demonB['name']])
  with open('generated/fusionsByDemon.json', 'w') as file:
    json.dump(fusionsByDemon, file)

def tryFusion(demonA, demonB):
  if demonA['name'] == demonB['name']:
    return None

  if demonA['tribe'] == demonB['tribe']:
    return tryFusionElement(demonA['tribe'])
  elif demonA['tribe'] == 'Element' or demonB['tribe'] == 'Element':
    return tryFusionWithElement(demonA, demonB)
  else:
    return tryNormalFusion(demonA, demonB)

def tryFusionElement(tribe):
  if tribe not in elementalByTribe:
    return None
  return elementalByTribe[tribe]

def tryFusionWithElement(demonA, demonB):
  if demonA['tribe'] == 'Element':
    normalDemon = demonB
    elemental = demonA
  else:
    normalDemon = demonA
    elemental = demonB
  tribeAndElemental = normalDemon['tribe'] + '_' + elemental['name']
  
  if tribeAndElemental not in rankByTribeAndElemental:
    return None
  rank = rankByTribeAndElemental[tribeAndElemental]
  if rank == 'u':  
    for demonName in demonNamesByTribe[normalDemon['tribe']]:
      level = demons[demonName]['level']
      if level > normalDemon['level']:
        return demonName
    return demonNamesByTribe[normalDemon['tribe']][0]
  else:
    for demonName in reversed(demonNamesByTribe[normalDemon['tribe']]):
      level = demons[demonName]['level']
      if level < normalDemon['level']:
        return demonName
    return None

def tryNormalFusion(demonA, demonB):
  tribeIndexA = tribes.index(demonA['tribe'])
  tribeIndexB = tribes.index(demonB['tribe'])
  if tribeIndexA >= len(fusionChart) or tribeIndexB >= len(fusionChart):
    return None
  fusionTribe = fusionChart[tribeIndexA][tribeIndexB]
  if not fusionTribe:
    return None
  fusionLevel = ceil((demonA['level'] + demonB['level']) / 2)
  for demonName in demonNamesByTribe[fusionTribe]:
    level = demons[demonName]['level']
    if level > fusionLevel:
      return demonName
  return None

def testFusion():
  demonA = demons['Gremlin']
  demonB = demons['Aeros']
  #print(demonA)
  #print(demonB)
  demonName = tryFusion(demonA, demonB)
  print(demonA['name'], '+', demonB['name'], '->', demonName)

def showFusions():
  with open('generated/fusionsByDemon.json') as file:
    fusionsByDemon = json.load(file)
  demon = demons['Napaea']
  fusions = fusionsByDemon[demon['name']]
  print(demon)
  for fusion in fusions:
    print('  ', fusion)

def showFusionTribe():
  tribeIndexA = tribes.index('Foul')
  tribeIndexB = tribes.index('Food')
  if tribeIndexA >= len(fusionChart) or tribeIndexB >= len(fusionChart):
    print('out of range')
    return
  fusionTribe = fusionChart[tribeIndexA][tribeIndexB]
  if not fusionTribe:
    print('Empty', fusionTribe)
    return
  print(fusionTribe)

main()
#showFusionTribe()