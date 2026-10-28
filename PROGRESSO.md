# Progresso — portfólio Figma → Next.js

## Etapa atual
Passo 4 — home aprovada; About implementado e medido, aguardando aprovação. Depois: cases.

## Ambiente
- Node v22.22.2, npm 12.0.2 · Next 16.4.3 (Turbopack, App Router, `src/`), React 19.3, Tailwind 4
- Ler `node_modules/next/dist/docs/` antes de usar API do Next (AGENTS.md). Ex.: `Image` usa
  `preload`/`fetchPriority`, não `priority`.
- Figma: arquivo `fvtDPNnt1mbHHDqjDto1hr`, página SITE `15:170`. Token em `.env.local` (o primeiro
  foi colado no chat e substituído).
- `.gitignore`: `.env*` e `/.figma/` (o create-next-app sobrescreveu o arquivo; `/.figma/` readicionado).
- **Cota da API REST (plano Starter) esgotada** em `/nodes` e `/images` (~1º/11). Caminho sem cota:
  `figma-plugin/` rodando numa **cópia do arquivo nos rascunhos do usuário** (o original é só leitura e
  plugins exigem edição; a cópia manteve os node-ids), depois
  `node scripts/figma.mjs importar <figma-export.zip>`. O zip fica na raiz e é ignorado pelo git.
- Todos os frames da página SITE já foram exportados pelo plugin v2 (com imagens em `.figma/img/`).
- Ferramentas:
  - `scripts/figma.mjs listar | baixar <id> <slug> [escala] | importar <zip> | comparar <slug> <png> [--escala=1]`
  - `scripts/capturar.mjs <rota> <saida.png> [largura] [--hover=<seletor>] [--dpr=2]`

## Páginas
| Frame | Rota | Desktop (faixas sem fotos > 0,5%) | Mobile | Status |
| --- | --- | --- | --- | --- |
| pag 1 `49:22` (1440×5934) | `/` | **0/119** · diferença total 1,12% | adaptado | **aprovada** |
| hover TuttiFree `51:107` | `/` | 0/119 · total 1,31% | — | medido |
| hover Itaú `53:166` | `/` | 0/119 · total 1,12% | — | medido |
| hover Trama `53:224` | `/` | 0/119 · total 1,15% | — | medido |
| hover About `15:171` | `/` | 0/119 · total 1,12% | — | medido |
| pag 2 `15:224` (1440×3791) | `/about` | **0/76** com o texto original do Figma · 5/76 com as correções de digitação (só nos 4 parágrafos corrigidos) · total 2,46% | adaptado | aguardando aprovação |
| hover Work `49:77` | `/about` | cor e posição do "Work" iguais ao Figma | — | medido |
| itaú `18:5` | `/work/itau` | – | – | árvore ok; PNG a 0,78x (limite de 32768px de altura) |
| trama `29:33550` | `/work/trama` | – | – | árvore ok; PNG a 0,79x (limite de 32768px de altura) |
| tuttifree `47:22` | `/work/tuttifree` | – | – | árvore + PNG 2x ok |

Estados de interação (diff de árvore entre frames):
- Página ativa e hover do menu em #A45E02 (`15:171` = hover About na home; `49:77` = hover Work no About).
- `51:107` hover TuttiFree: card ×1,08 a partir do topo, mancha mais baixa, círculo com fundo creme e
  sombra, "more about" 36→64px, Line 5/6 encurtam.
- `53:166` hover Itaú: imagem 998×1179 em (1,2833), faixa laranja 533 de altura, "more about" 48px.
- `53:224` hover Trama: celular 891×1122 em (211,4034), faixa bege 432, "more about" 40px.

### Como medir (por que "sem fotos")
Referências da home e do About vêm do plugin, a 2x de verdade (o export da API REST era reduzido a
1,981x por passar de ~32 MP). `comparar` detecta a escala real de qualquer forma; `--escala=1` leva as
duas imagens a 1x quando a referência vier reduzida (caso de Itaú e Trama, limitados a 32768px de altura). Fotos (nós com fill IMAGE) nunca batem pixel a pixel
porque Figma e Chrome reamostram com filtros diferentes (testado: desligar a otimização do
`next/image` não muda o número), então o critério de 0,5% é aplicado às faixas **sem fotos**.


## Para perguntar ao design
1. **Mobile:** não há frame no Figma. Hoje a composição escala proporcionalmente e só os textos crescem
   (< 768px); "more about" de Itaú/Trama quebra em 2 linhas. É a direção desejada ou haverá um layout
   mobile próprio?
2. **Fonte do e-mail:** "Content" (Google Fonts) só tem números e pontuação — as letras aparecem em
   Noto Sans (fallback do Figma). Era a intenção ou a fonte deveria ser outra?
3. **Erros de digitação no About (`15:224`):** corrigidos no site; confirmar as correções e ajustar no
   Figma para os dois não divergirem.
   - "a **gradueted** artist" → "a **graduated** artist" (`15:282`)
   - "My **graduetion** on Visual Arts" → "My **graduation** on Visual Arts" (`15:288`)
   - "a **criative** mind" → "a **creative** mind" (`15:288`)
   - "my sensibility and **criativity**" → "my sensibility and **creativity**" (`15:291`)
   - "on **solucions** that helps people" → "on **solutions** that **help** people" (`15:291`)
   - "transform **a experience**" → "transform **an experience**" (`16:305`)
   - "I **Like** to explore" → "I **like** to explore" (`16:305`)
4. **Telas maiores que 1440px:** o conteúdo fica centralizado em 1440 e as faixas de cor vão até a
   borda da janela. Ok?

## Placeholders pendentes
- `alt` das fotos: escritos a partir dos nomes das camadas (ex.: "pao batata doce" → "Sweet potato bread").
- Links dos cards (`/work/tuttifree`, `/work/itau`, `/work/trama`) apontam para páginas ainda não feitas.
- "Work" no menu aponta para `/`.
- About: `alt` do retrato ("Portrait of Laura Siufi") escrito por mim; as duas ilustrações são
  decorativas (`alt=""`). O nome "Laura Siufi" no topo do About leva para `/`.

## Quase-duplicatas de cor
Cinzas escuros #141414, #2c2c2c, #2b2b35, #2d3047: **mantidos como no Figma** (decisão do usuário).

## Decisões
- Erros de digitação do Figma no About são corrigidos no código (lista completa em "Para perguntar
  ao design", item 3). O texto pode mudar depois; os blocos
  corrigidos terão diferença de largura esperada no `comparar`.
- Plugin v2 (`figma-plugin/`): exporta também imageTransform (CROP), relativeTransform/size,
  arcData e os arquivos das imagens (`.figma/img/<hash>`).
- `metadata.description`: "Laura Siufi — UX/UI Designer based in São Paulo. Selected works: TuttiFree,
  Itaú, TRAMA." (aprovada pelo usuário; não existe no Figma).
- Sem frame mobile: o layout escala proporcionalmente em qualquer largura (1px Figma = largura/1440);
  abaixo de 768px só os textos crescem (`max-md:[--fs:…]`), e o "more about" de Itaú/Trama quebra em
  2 linhas. Sem rolagem horizontal de 360 a 1920.
- Itaú e Trama tratados como 1440 de largura.
- Fonte "Content" (e-mail) só tem dígitos/pontuação; as letras caem em Noto Sans, como no Figma
  (medido: largura 420 vs 422).
- `text-rendering: geometricPrecision`: sem isso o Chrome arredonda avanços e textos crescem até 5px.
- Calibração vertical por estilo de texto (`text(…, dy)`): o Chrome desenha essas fontes mais alto que o
  Figma. Medido a 2x contra o export do plugin: Contrail 0, Darker Grotesque 48px 0,75, Notable 36/64px 1,
  Notable 128px 1,5, Content 1 (px do Figma).
- `capturar.mjs` usa viewport da altura da página: com o screenshot de página inteira, o hover se perdia
  ao rolar de volta ao topo (o hover de Itaú/Trama não estava sendo capturado).
- Linhas do Figma: o traço fica de um lado só da geometria (y local negativo), não centrado.
- Fotos giradas do About: `relativeTransform` do Figma vira `matrix()` com origem no canto; recorte CROP
  via `CroppedImage` (a imagem inteira mede 1/sx × 1/sy do quadro). Elementos que saem do frame ficam
  dentro de um quadro com `overflow: hidden`, para não aparecer em telas > 1440.
- About no mobile: parágrafos crescem para 56 (não 64) e "Meanwhile…"/"I like…" sobem/alargam para caber
  na faixa de fundo (senão a última linha ficava preto no preto / creme no branco).
- Prettier fixado no projeto (`npm run format`).
- Classes de canvas em `@layer components` para que utilitários do Tailwind as sobrescrevam.
- `scripts/figma.mjs` reaproveita o `.json` salvo e aborta 429 com espera > 5 min.
