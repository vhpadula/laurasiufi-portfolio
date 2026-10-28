# Progresso — portfólio Figma → Next.js

## Etapa atual
Passo 4 — home e About aprovados. Cases (TuttiFree, Itaú, Trama) implementados e medidos, aguardando
revisão. **A Laura está fazendo uma v2 do Figma, agora com mobile** (resposta de 2026-10-28). Passo 5
ainda não começou.

### Pendências
1. **Aguardar a v2 do Figma (com frames mobile).** Quando chegar: `listar`, rebaixar só os frames que
   mudaram (pelo plugin, enquanto a cota da API estiver esgotada), dizer o que mudou e remedir só essas
   páginas. Implementar os frames mobile (home, About e cases) no lugar da adaptação atual.
2. **Reexportar os 3 cases pelo plugin atualizado** (listas com marcador/recuo, espaço entre
   parágrafos e links). Pode vir junto com a v2. Depois: `importar` + `gerar-case` (eu rodo).
3. **Erros de digitação do About:** a Laura vai corrigir no Figma. Na v2, conferir se o texto bate com
   as correções que já estão no site.
4. **Fonte do e-mail:** a Laura liberou trocar a "Content" (só tem dígitos/pontuação). Escolher uma
   fonte com letras (sugestão: Noto Sans, que já é o que aparece) e remover a Content.
5. **Textos alternativos das imagens dos cases:** ainda sem resposta (hoje `alt=""`).
6. Revisar as 3 páginas de case: http://localhost:3000/work/tuttifree, /work/itau, /work/trama.

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
  - `scripts/figma.mjs listar | baixar <id> <slug> [escala] | importar <zip> | comparar <slug> <png> [--escala=1] [--pagina=<id>]`
  - `scripts/capturar.mjs <rota> <saida.png> [largura] [--hover=<seletor>] [--dpr=2]`
  - `scripts/gerar-case.mjs <slug> [frame da página]` — gera `src/content/cases/<slug>.json` e copia
    imagens/SVGs usados para `public/images/cases/<slug>/` (itau: `18:6`, trama: `29:33551`)
  - `scripts/medir-texto.mjs`, `scripts/medir-largura.mjs`, `scripts/deslocamento.mjs` — diagnóstico de
    posição/largura de texto contra o export

## Páginas
| Frame | Rota | Desktop (faixas sem fotos > 0,5%) | Mobile | Status |
| --- | --- | --- | --- | --- |
| pag 1 `49:22` (1440×5934) | `/` | **0/119** · diferença total 1,12% | adaptado | **aprovada** |
| hover TuttiFree `51:107` | `/` | 0/119 · total 1,31% | — | medido |
| hover Itaú `53:166` | `/` | 0/119 · total 1,12% | — | medido |
| hover Trama `53:224` | `/` | 0/119 · total 1,15% | — | medido |
| hover About `15:171` | `/` | 0/119 · total 1,12% | — | medido |
| pag 2 `15:224` (1440×3791) | `/about` | **0/76** com o texto original do Figma · 5/76 com as correções de digitação (só nos 4 parágrafos corrigidos) · total 2,46% | adaptado | **aprovada** |
| hover Work `49:77` | `/about` | cor e posição do "Work" iguais ao Figma | — | medido |
| tuttifree `47:22` (1440×15004) | `/work/tuttifree` | 21/301 · total 0,96% | ilegível < 768px | aguardando revisão |
| itaú `18:5` (página `18:6`, 1440×42068) | `/work/itau` | 245/842 · total 2,05% (referência a 0,78x) | ilegível < 768px | aguardando revisão |
| trama `29:33550` (página `29:33551`, 1440×41327) | `/work/trama` | 210/827 · total 1,59% (referência a 0,79x) | ilegível < 768px | aguardando revisão (listas pendentes de export) |

Cases: comparados com `--pagina=<frame de 1440>` e captura a 1x (`--dpr=1`; a 2x o Chrome não captura
páginas de 42.000px). Estruturalmente as 3 batem com o Figma de ponta a ponta (lado a lado conferido).
O que sobra, por tipo:
- **Itaú/Trama:** a referência veio reduzida (~0,78x, limite de 32768px de altura do export), e texto
  pequeno comparado nessa escala acusa diferença de rasterização mesmo alinhado (conferido no olho:
  idêntico). Esse é o piso de medição com essa referência; exportar em fatias a 2x resolveria.
- **Trama:** listas sem marcador/recuo (falta o dado; ver "Para fazer de manhã", item 1).
- **Itaú:** 8 setas "→" em Geologica 800 saem mais finas: a fonte não tem o glifo e o Figma usa o da
  Noto Sans, que o Google Fonts só serve por subset dinâmico (`text=`), recusado fora do navegador.
  Embutir a Noto Sans inteira (~580 KB) por 8 setas não compensa.
- **TuttiFree:** linhas em Jura 32px dentro de um texto de estilos mistos ficam ~4px abaixo.

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


## Respostas do design (2026-10-28)
1. **Mobile:** não era a direção — a Laura vai desenhar o mobile (v2 do Figma).
2. **Fonte do e-mail:** "pouco importa, pode mudar sem problema" → trocar a Content (pendência 4).
3. **Erros de digitação no About (`15:224`):** confirmados; ela vai corrigir no Figma. Correções já
   no site: gradueted→graduated (`15:282`); graduetion→graduation e criative→creative (`15:288`);
   criativity→creativity e "solucions that helps"→"solutions that help" (`15:291`);
   "a experience"→"an experience" e "Like"→"like" (`16:305`).
4. **Telas maiores que 1440px:** aprovado (conteúdo centralizado em 1440, faixas de cor até a borda).
5. **Mobile dos cases:** coberto pelo item 1.
6. **Textos alternativos das imagens dos cases:** ainda não perguntado/respondido.

## Placeholders pendentes
- `alt` das fotos: escritos a partir dos nomes das camadas (ex.: "pao batata doce" → "Sweet potato bread").
- Cases: imagens com `alt=""` (o Figma não tem descrição das imagens; precisam de texto alternativo
  real — pedir ao design/autora). Os títulos `<h1>` e o "botão voltar" (→ `/`) estão configurados em
  `src/content/cases/index.ts`.
- "Work" no menu aponta para `/`.
- About: `alt` do retrato ("Portrait of Laura Siufi") escrito por mim; as duas ilustrações são
  decorativas (`alt=""`). O nome "Laura Siufi" no topo do About leva para `/` (aprovado).

## Quase-duplicatas de cor
Cinzas escuros #141414, #2c2c2c, #2b2b35, #2d3047: **mantidos como no Figma** (decisão do usuário).

## Decisões
- **Cases gerados a partir do Figma**, não escritos à mão (centenas de elementos cada):
  `scripts/gerar-case.mjs` converte a árvore exportada em dados e `src/components/FigmaCanvas.tsx`
  desenha no mesmo canvas da home. Mudou o Figma → exportar, `importar`, `gerar-case`.
- Figma: filhos de grupo são posicionados relativos ao frame (conferido em 735 nós) — grupos não viram
  elemento; frames sim (com `overflow: hidden` quando cortam).
- Texto dos cases: um bloco por linha com a entrelinha do Figma (a maior entre os caracteres da linha) e
  a fonte do próprio trecho (sem "strut" do container). Quebras: `\n`, `\r\n`, `\r` e U+2028. Entrelinha
  "auto" por família (Chivo 1,446 medido no Figma; demais = "normal" do navegador, que bate com o Figma).
- Textos que quebram linha ganham na largura só a folga do letterSpacing final (o CSS conta, o Figma
  não); se a soma dos parágrafos já dá a altura do Figma, nada quebra. Uma folga de 1% foi testada e
  piorou (palavras extras subiam de linha).
- Testado e **revertido**: compensar a largura das fontes com letterSpacing por família (a razão de
  largura ia a ~1,000, mas a diferença de pixels piorou: Itaú 2,04 → 2,52%).
- Sombra de forma sem preenchimento opaco → `filter: drop-shadow` (segue o alfa, como o Figma).
- Exports altos: escala vertical ≠ horizontal; `comparar` usa as duas (Itaú 9,17% → 2,04%).
- Fontes dos cases carregadas só em `/work/*` (`src/app/work/fonts.ts`); Georama com eixo `wdth`.
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
