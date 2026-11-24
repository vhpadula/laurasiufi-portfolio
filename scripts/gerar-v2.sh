#!/usr/bin/env bash
# Regenera todas as páginas da v2 a partir dos exports do plugin, descompactados em .figma/v2/{web,mobile}:
#   unzip -o figma-export-web.zip -d .figma/v2/web && unzip -o figma-export-mobile.zip -d .figma/v2/mobile
set -euo pipefail
cd "$(dirname "$0")/.."
W=.figma/v2/web
M=.figma/v2/mobile
g() { node scripts/gerar-pagina.mjs "$@"; }

# Desktop: home e as três variações de hover dos cards; About e o hover do "Work".
g home $W/97-172.json
g home-hover-tutti $W/97-218.json
g home-hover-itau $W/102-282.json
g home-hover-trama $W/102-332.json
g about $W/102-1802.json
g about-hover-work $W/116-77.json
g tuttifree $W/102-1215.json
g itau $W/102-514.json 102:515
g trama $W/102-1352.json 102:1353

# Mobile: home = abertura + carrossel dos cases; About = quatro telas em sequência. O header só fica
# na primeira tela de cada página.
g m-home $M/77-159.json
g m-home-tutti $M/77-160.json --sem=77:163,77:164
g m-home-itau $M/77-217.json --sem=77:219,77:220
g m-home-trama $M/77-263.json --sem=77:266,77:267
g m-about-1 $M/77-288.json
g m-about-2 $M/77-304.json --sem=77:306,77:307,77:308
g m-about-3 $M/77-322.json --sem=77:325,77:326,77:327
g m-about-4 $M/77-339.json --sem=77:342,77:343,77:344
g m-tuttifree $M/67-367.json
g m-itau $M/70-547.json
g m-trama $M/76-115.json
