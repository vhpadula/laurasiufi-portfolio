# Progresso — portfólio Figma → Next.js

## Etapa atual
**v2 do Figma (redesign com desktop e mobile) implementada** em 2026-11-23: home, About e os três
cases, cada um com o frame desktop (≥ 768px) e o frame mobile (< 768px). Aguardando revisão do
usuário. Passo 5 (favicon, OG, 404, Lighthouse) ainda não começou.

### Pendências
1. **Revisar as páginas** (desktop e mobile): http://localhost:3000/, /about, /work/tuttifree,
   /work/itau, /work/trama. No navegador, o mobile aparece abaixo de 768px de largura.
2. **Decisões de comportamento que o Figma não mostra** (ver "Decisões da v2"): carrossel do mobile,
   telas do About mobile em sequência, header só na primeira tela.
3. **Textos alternativos das imagens:** o Figma não tem; hoje todas as imagens têm `alt=""` (os links
   têm `aria-label`). Perguntar ao design quem escreve.
4. **Next.js com vulnerabilidade conhecida:** o `next dev`/`next build` avisa e recomenda
   `next upgrade --agent=security`. Perguntar ao usuário antes de atualizar.
5. Passo 5 depois da revisão.

## Ambiente
- Next.js 16.4.3 (App Router, Turbopack, Cache Components), React 19, Tailwind 4, TypeScript.
- Figma v2: exportado pelo plugin (`figma-plugin/`) em dois zips, `figma-export-web.zip` e
  `figma-export-mobile.zip`, descompactados em `.figma/v2/web` e `.figma/v2/mobile`.
- Ferramentas:
  - `scripts/gerar-v2.sh` — regenera todas as páginas (`src/content/pages/*.json`) a partir de
    `.figma/v2`. Usa `scripts/gerar-pagina.mjs <slug> <frame.json> [página] [--sem=ids]`.
  - `scripts/capturar.mjs <rota> <saida.png> [largura] [--hover=<seletor>] [--dpr=2]`.
  - `scripts/figma.mjs comparar <slug> <captura.png> [--escala=1] [--pagina=<id>]` — `.figma/<slug>.json`
    e `.png` são links para os arquivos da v2 (ver tabela abaixo). O `.ref.png` gravado é o export
    inteiro, antes do recorte por `--pagina`.
  - `scripts/medir-texto.mjs <slug> <captura>` — deslocamento vertical por família/tamanho.
- Imagens em `public/images/figma/` (nome = hash da imagem no Figma; SVGs pelo node-id).

## Páginas (v2)
| Página | Frames | Desktop (faixas sem fotos > 0,5%) | Mobile |
| --- | --- | --- | --- |
| `/` | desktop `97:172` + hovers `97:218`, `102:282`, `102:332`; mobile `77:159` + carrossel `77:160`, `77:217`, `77:263` | **0/100** (total 1,18%); hover TuttiFree 5/100 (borda da elipse) | abertura **0/18**; slides conferidos lado a lado |
| `/about` | desktop `102:1802` + hover "Work" `116:77`; mobile `77:288`, `77:304`, `77:322`, `77:339` | **1/80** (0,55%) | conferido lado a lado |
| `/work/tuttifree` | `102:1215`; mobile `67:367` | **15/301** a 2x (v1: 21/301) | 25/96 (texto pequeno ~1px acima) |
| `/work/itau` | `102:514` (página `102:515`); mobile `70:547` | 375/842 a 1x, total 2,43% | **5/259** |
| `/work/trama` | `102:1352` (página `102:1353`); mobile `76:115` | 263/827 a 1x, total 1,76% | **8/241** |

Itaú/Trama desktop: a referência veio reduzida (~0,78x, limite de 32768px de altura do export) e é
comparada a 1x; texto pequeno nessa escala conta como diferença mesmo alinhado (lado a lado, as faixas
conferidas são iguais, ~1px). Diferenças reais conhecidas:
- Itaú: setas "→" (a Geologica não tem o glifo; o Figma usa outra fonte) e um bloco com entrelinhas
  mistas (`102:678`, 48px + 64px) em que o Figma põe a linha de 64px ~8px mais abaixo.
- Cases mobile: textos pequenos (Chivo, Jura) ~1px mais altos que no Figma.

## Decisões da v2
- **Tudo gerado do Figma**: home, About e cases saem do mesmo gerador (`gerar-pagina.mjs`) e renderizador
  (`FigmaCanvas`). Por página, `src/content/pages/index.ts` só define links (por node-id), `<h1>` e hovers.
- **Links** são áreas transparentes por cima do canvas (`FigmaPage`), na caixa dos nós do Figma, com
  `aria-label`. Work → `/`, About → `/about`, nome "Laura Siufi" → `/`, cards → case, e-mail → `mailto:`,
  seta de subir → `#top`, "botão voltar" dos cases → `/`.
- **Hover da home**: os frames de hover do Figma são desenhados por cima da página e aparecem com
  `:has(:hover)` (só CSS, transição de opacidade de 300ms). Os frames de hover não estão todos na mesma
  altura da base (Itaú −39px, Trama +11px; no hover da Trama a página inteira desceu 45px), então cada
  variação é alinhada pelo título do card e só mostra do card para baixo. A área do link cresce no hover
  para cobrir o card expandido.
- **Hover do About**: só o menu ("Work" em laranja), do frame `116:77`.
- **Home mobile**: abertura (`77:159`) e os três cases num carrossel horizontal (scroll-snap, arrastável),
  com o botão "next" levando ao próximo (o da Trama volta ao TuttiFree). Sem JS. O header só aparece
  na abertura (nos slides foi omitido com `--sem`).
- **About mobile**: as quatro telas do Figma em sequência vertical; header só na primeira.
- **Desktop ≥ 768px, mobile < 768px.** Cada um escala proporcionalmente à largura (frame de 1440 ou 402).
- Telas > 1440px (aprovado pelo design): conteúdo centralizado em 1440; formas de cor sólida que
  encostam na borda do frame continuam até a borda da janela (`bleed-x/l/r`).
- Fonte "Content" do e-mail mantida (o design liberou trocar; as letras caem em Noto Sans, como no Figma).
- Texto: entrelinha "auto" do Figma por família, arredondada para px inteiros (o Figma arredonda:
  Darker Grotesque 32px → 43, 36px → 49). Cada linha usa a fonte do próprio trecho (antes herdava a
  do `\n` da linha anterior — causava ~10px de deslocamento em textos com fontes misturadas).
- Alinhamento centro/direita: a caixa ganha à direita a folga do letterSpacing final e não é deslocada
  (medido em "Thanks for scrolling", `97:269`).
- Ajustes verticais medidos: Darker Grotesque 0,5px, Notable 1px, Content 1px (por texto); Revalia
  −0,28em (por linha).
- Imagens dos frames de hover e do mobile são as mesmas da base (mesmo arquivo, mesmo cache).

## Decisões que continuam da v1
- Filhos de grupo no Figma são posicionados relativos ao frame; grupos não viram elemento.
- Quebras de linha do Figma: `\n`, `\r\n`, `\r` e U+2028. Textos que no Figma não quebram (altura =
  soma dos parágrafos) não quebram no navegador.
- Sombra de forma sem preenchimento opaco → `filter: drop-shadow`.
- Exports altos: escala vertical ≠ horizontal; `comparar` usa as duas.
- `text-rendering: geometricPrecision` (sem isso o Chrome arredonda avanços e textos crescem até 5px).
- Linhas do Figma: o traço fica de um lado só da geometria.
- `metadata.description`: "Laura Siufi — UX/UI Designer based in São Paulo. Selected works: TuttiFree,
  Itaú, TRAMA." (aprovada; não existe no Figma).
- Prettier fixado no projeto (`npm run format`).
- Testado e revertido na v1: compensar a largura das fontes com letterSpacing por família.

## Respostas do design (2026-10-28)
1. Mobile: desenhado na v2. ✔
2. Fonte do e-mail: pode mudar; mantida por ora.
3. Erros de digitação do About: corrigidos no Figma v2 (o texto agora vem direto do Figma). ✔
4. Telas > 1440px: aprovado. ✔
