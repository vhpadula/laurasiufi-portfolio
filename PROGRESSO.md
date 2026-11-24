# Progresso — portfólio Figma → Next.js

## Etapa atual
**v2 do Figma implementada e aprovada pelo usuário** (desktop e mobile), com hover animado.
**Passo 5 feito** em 2026-11-24: favicon, imagem Open Graph, 404 e Lighthouse ≥ 90 em todas as páginas.
Next.js atualizado para 16.4.6 (correção de segurança). Falta: respostas da Laura, push e deploy
(perguntar antes).

### Pendências
1. **Mandar para a Laura** a mensagem de "Para mandar para a Laura" (abaixo) e anotar as respostas.
2. **Push e deploy:** perguntar antes. No deploy, definir o domínio em `metadataBase` (hoje a URL da
   imagem de compartilhamento sai com `localhost` fora da Vercel).

### Para mandar para a Laura
Mensagem pronta (WhatsApp):

> Oi, Laura! O portfólio novo (desktop e mobile) já está implementado. Ficaram algumas dúvidas:
>
> 1. **Textos alternativos das imagens** — para acessibilidade (leitores de tela e Google), cada imagem
>    precisa de uma descrição curta. O Figma não tem. Você me manda, ou posso escrever a partir dos
>    nomes das camadas e você revisa?
> 2. **Hover dos cards da home** — os frames de hover estão em alturas um pouco diferentes entre si (no
>    do Itaú o card subiu 39px, no da Trama a página inteira desceu 45px, no do TuttiFree a seção da
>    Trama desceu menos que a do Itaú). Fiz a animação mantendo o card no lugar e empurrando o resto
>    para baixo por igual. Dá uma olhada se ficou como você imaginou.
> 3. **Mobile** — como não tem hover no celular: na home, os três cases viraram um carrossel (arrasta
>    para o lado ou toca em "next"); no About, as quatro telas ficam uma embaixo da outra, com o menu só
>    na primeira. É isso?
> 4. **Setas do Itaú** — no título "Dados → Insights → Narrativa → Reflexão" a fonte Geologica não tem a
>    seta, e o Figma usa outra fonte para ela. No site ela sai mais fina. Quer trocar por um ícone ou
>    está ok assim?
> 5. **Favicon e imagem de compartilhamento** (a que aparece quando o link é enviado no WhatsApp/LinkedIn)
>    — não estão no Figma. Usei por enquanto a ilustração da home no ícone e o topo da home na imagem
>    de compartilhamento. Se quiser desenhar os dois, eu troco.
> 6. **Página 404** (link quebrado) — também não está no Figma; fiz uma simples no estilo do site.
>    Quer desenhar uma?
> 7. **Contraste** — no case TuttiFree, alguns textos pequenos (Chivo, Jura e Holtwood sobre o
>    creme/laranja) ficam abaixo do contraste mínimo recomendado para leitura (WCAG AA). Quer
>    escurecer essas cores, ou mantemos?

## Passo 5
- **Favicon/ícones** (`src/app/favicon.ico`, `icon.png`, `apple-icon.png`): "LS" com as letras do nome
  da home (Notable, recortadas do export do Figma). Não existe no Figma — pendente da Laura.
- **Open Graph** (`src/app/opengraph-image.png` + `.alt.txt`): topo da home recortado do export do
  Figma, 1200×630. Pendente da Laura.
- **404** (`src/app/not-found.tsx`): simples, com Notable/Contrail One/Darker Grotesque e as cores do site.
- **Lighthouse 13.6** (build de produção, `next start`, cache de imagens aquecido):

| Página | Mobile (perf · a11y · boas práticas · SEO) | Desktop |
| --- | --- | --- |
| `/` | 91 · 100 · 100 · 100 | 100 · 100 · 100 · 100 |
| `/about` | 98 · 100 · 100 · 100 | 100 · 100 · 100 · 100 |
| `/work/tuttifree` | 99 · 95 · 100 · 100 | 100 · 95 · 96 · 100 |
| `/work/itau` | 98 · 100 · 96 · 100 | 100 · 95 · 100 · 100 |
| `/work/trama` | 98 · 100 · 100 · 100 | 100 · 95 · 100 · 100 |

  Abaixo de 100: contraste de cores do próprio design (pergunta 7 para a Laura) e imagens que o
  Figma estica no recorte (CROP com escala diferente em x e y — fiel ao Figma).
  O que levou o mobile de 77–86 para 91–99: fontes dos cases só em `/work` e sem preload, AVIF,
  prioridade só para a maior imagem da primeira tela, layout escondido sem baixar imagens grandes.
- Para rodar o Lighthouse no WSL: abrir o Chromium do Playwright com `--remote-debugging-port` e
  passar `--port` ao Lighthouse (sozinho ele cria pastas `C:\Users\...` na pasta atual, que o
  Tailwind tenta ler e quebram o build — se aparecerem na raiz, apagar).

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
