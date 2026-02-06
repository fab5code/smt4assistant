# Shin Megami Tensi IV Fusion Assistant
The aim of this application is to provide an easy way to manage fusions while playing the video game Shin Megami Tensei IV.
You can use this application to search for available direct and chained fusions considering the player level, the demons in your party and demons you have marked as easy to scout.

You can use the application here: [https://fab5code.github.io/smt4assistant](https://fab5code.github.io/smt4assistant).

Beside the application itself you may be curious of

- [the demons data and images](#demons-data-and-images)
- [the algorithm for chained fusions](#algorithm-for-chained-fusions)

## Features
- search the most interesting available fusions of all demons not yet collected
- search the most interesting available fusions of any demon
- search the most interesting available fusions of all demons not yet collected which are using a particular demon in party and/or a new demon in party
- view the direct fusions of any demon
- filter and sort the list of demons
- import and download your user data ie your player level and the demons you have marked as collected, easy to scout and in party
- your user data is automatically saved locally on your browser

## Motivation
Other websites like the following ones offer similar and on many aspects more advanced functionalities.

- [https://megamitensei.fandom.com/wiki/List_of_Shin_Megami_Tensei_IV_Demons](https://megamitensei.fandom.com/wiki/List_of_Shin_Megami_Tensei_IV_Demons)
- [https://aqiu384.github.io/megaten-fusion-tool/smt4/demons](https://aqiu384.github.io/megaten-fusion-tool/smt4/demons)
- [https://erikku.github.io/smt4tool/](https://erikku.github.io/smt4tool/)

However at the time of creation of this application no tool was found to explore chained fusions (instead of just direct fusions) and depending on the same player information used here.

## Demons data and images
### Demon data
The demons data (tribes, names, levels, stats, resistances, skills...) was taken from [https://erikku.github.io/smt4tool/](https://erikku.github.io/smt4tool/). It has been processed with some minor corrections (like spelling mistakes or fusion chart errors) and the application uses the following files:

- [src/assets/files/demons.json](https://github.com/fab5code/smt4assistant/blob/main/src/assets/files/demons.json) contains all demons with their stats, resistances, skill references and special fusions if any
- [src/assets/files/fusionsByDemon.json](https://github.com/fab5code/smt4assistant/blob/main/src/assets/files/fusionsByDemon.json) contains all direct fusions for each demon

### Full images
The images were taken from a fan made hd texture pack of the game [https://community.citra-emu.org/t/kasaskis-shin-megami-tensei-iv-hd-texture-pack/180130](https://community.citra-emu.org/t/kasaskis-shin-megami-tensei-iv-hd-texture-pack/180130). Each demon image from the texture pack was nameless so a lot of work (mostly using scripts) was done to identify each image.

The images in the application have a lower resolution than the ones in the texture pack for loading performance. The images are available in [src/assets/img/demons/](https://github.com/fab5code/smt4assistant/tree/main/src/assets/img/demons).

### Thumbnails
The texture pack also has a thumbnail for each demon. A thumbnail is not the whole image here but a small portion of the image that represents well the demon. The thumbnails used in the applications were created by identifying in which image belongs each texture pack thumbnail and recreating it from the hd image.

The thumbnails are available in [src/assets/img/demonThumbnails/](https://github.com/fab5code/smt4assistant/tree/main/src/assets/img/demonThumbnails).

### Fix an error in the demon data
Modify *data/resource/demons.json*.
Execute from the folder *data* the python files *processData.py* then *generateFusion.py* (no need to activate a virtual environment).
Then copy the files data/generated/demons.json and data/generated/fusionsByDemons.json to *src/assets/files*.

In case of a demon name change, the image and thumbnail need to be changed too to match the same name.

## Algorithm for chained fusions
The code to compute chained fusions is available in [src/app/fusionSearch.ts](https://github.com/fab5code/smt4assistant/blob/main/src/app/fusionSearch.ts).

Computing all possible combinations of fusions is intractable. Instead we limit the depth of the chained fusions. We call a fusion result one graph of fusions whose leaves are easy to scout or in party demons or elementals. Elementals are processed differently because of their high fusion combinations. Each fusion result is given a score depending on the leaves of the graph ie the ingredients of the chained fusion. The results are sorted from the lowest score and only the first 50 results are displayed in the application.

When they are too many fusion paths to process (like above 100000), the search is aborted. Computing the score for each fusion path can take too much time.

At the moment in party demons increase the score of a fusion result by 0.5, easy to scout demons by 1 and elementals by 2.

## Improvement ideas
- compute the search in a web worker so as not to freeze the ui, display results as they are found ; then add a way to abort the search
- add optional views for demon stats, resistances and skills
- search fusion depending on resistances or skills
- add optional weights for easy to scout and in party demons (and elementals) to personalize even more the score in fusion search
- list in party demons in the tab Player and have a way to remove each one

Of course it would be nice to have a similar tool for other SMT games. The algorithms to compute fusions between games are very similar so it should be possible to adapt this application to support more games.

## Disclaimer
This application is a completely free and non-profit tool with the aim to enhance the experience of playing the video game Shin Megami Tensei IV.
It is not affiliated with Atlus. All rights reserved to the copyright owners, especially for the images used for the characters.
