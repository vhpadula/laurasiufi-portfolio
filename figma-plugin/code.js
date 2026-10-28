// Exporta os frames selecionados no mesmo formato da API REST (GET /files/:key/nodes),
// mais o PNG a 2x, SVGs dos vetores e os arquivos das imagens. Sem limite de cota: roda
// dentro do Figma (exige permissão de edição — use uma cópia do arquivo nos rascunhos).
figma.showUI(__html__, { width: 360, height: 200 });

const isMixed = (v) => v === figma.mixed;
const box = (b) =>
  b ? { x: b.x, y: b.y, width: b.width, height: b.height } : null;

function paint(p) {
  const out = {
    type: p.type,
    visible: p.visible,
    opacity: p.opacity,
    blendMode: p.blendMode,
  };
  if (p.type === "SOLID") out.color = { ...p.color, a: 1 };
  if (p.type === "IMAGE") {
    Object.assign(out, { imageRef: p.imageHash, scaleMode: p.scaleMode });
    if (p.imageTransform)
      out.imageTransform = p.imageTransform.map((row) => [...row]);
    if (p.scalingFactor) out.scalingFactor = p.scalingFactor;
    if (p.rotation) out.rotation = p.rotation;
    if (p.filters) out.filters = { ...p.filters };
  }
  if (p.type.startsWith("GRADIENT"))
    out.gradientStops = p.gradientStops.map((s) => ({
      position: s.position,
      color: { ...s.color },
    }));
  return out;
}
const paints = (list) => (isMixed(list) || !list ? [] : list.map(paint));

function lineHeight(lh, size) {
  if (lh.unit === "PIXELS")
    return { lineHeightPx: lh.value, lineHeightUnit: "PIXELS" };
  if (lh.unit === "PERCENT")
    return {
      lineHeightPx: (size * lh.value) / 100,
      lineHeightUnit: "FONT_SIZE_%",
    };
  return { lineHeightPx: undefined, lineHeightUnit: "INTRINSIC_%" };
}
const letterSpacing = (ls, size) =>
  ls.unit === "PIXELS" ? ls.value : (size * ls.value) / 100;

function textStyle(seg, node) {
  return {
    fontFamily: seg.fontName.family,
    fontStyle: seg.fontName.style,
    fontWeight: seg.fontWeight,
    italic: /italic/i.test(seg.fontName.style),
    fontSize: seg.fontSize,
    ...lineHeight(seg.lineHeight, seg.fontSize),
    letterSpacing: letterSpacing(seg.letterSpacing, seg.fontSize),
    textDecoration: seg.textDecoration,
    textCase: seg.textCase,
    textAlignHorizontal: node.textAlignHorizontal,
    textAlignVertical: node.textAlignVertical,
    textAutoResize: node.textAutoResize,
    // Listas, recuo, espaço entre parágrafos e links não fazem parte de `characters`.
    listType: seg.listOptions && seg.listOptions.type !== "NONE" ? seg.listOptions.type : undefined,
    indentation: seg.indentation || undefined,
    paragraphSpacing: seg.paragraphSpacing || undefined,
    hyperlink: seg.hyperlink && seg.hyperlink.type === "URL" ? seg.hyperlink.value : undefined,
  };
}

function collectImages(paintsList, images) {
  for (const p of paintsList)
    if (p.type === "IMAGE" && p.imageRef) images.add(p.imageRef);
}

function serialize(node, svgs, images) {
  if (node.visible === false)
    return { id: node.id, name: node.name, type: node.type, visible: false };
  const o = {
    id: node.id,
    name: node.name,
    type: node.type,
    absoluteBoundingBox: box(node.absoluteBoundingBox),
    absoluteRenderBounds: box(node.absoluteRenderBounds),
  };
  // Geometria local: necessária para nós girados (o bounding box absoluto é o do nó já girado).
  if ("relativeTransform" in node) {
    o.size = { x: node.width, y: node.height };
    o.relativeTransform = node.relativeTransform.map((row) => [...row]);
    if (node.rotation) o.rotationDeg = node.rotation;
  }
  if (node.type === "ELLIPSE" && node.arcData) o.arcData = { ...node.arcData };
  if (
    "strokeCap" in node &&
    !isMixed(node.strokeCap) &&
    node.strokeCap !== "NONE"
  )
    o.strokeCap = node.strokeCap;
  if ("opacity" in node && node.opacity < 1) o.opacity = node.opacity;
  if ("fills" in node) {
    o.fills = paints(node.fills);
    collectImages(o.fills, images);
  }
  if ("strokes" in node) {
    o.strokes = paints(node.strokes);
    o.strokeAlign = node.strokeAlign;
    o.strokeWeight = isMixed(node.strokeWeight)
      ? Math.max(
          node.strokeTopWeight,
          node.strokeRightWeight,
          node.strokeBottomWeight,
          node.strokeLeftWeight,
        )
      : node.strokeWeight;
  }
  if ("cornerRadius" in node) {
    if (isMixed(node.cornerRadius))
      o.rectangleCornerRadii = [
        node.topLeftRadius,
        node.topRightRadius,
        node.bottomRightRadius,
        node.bottomLeftRadius,
      ];
    else if (node.cornerRadius) o.cornerRadius = node.cornerRadius;
  }
  if ("effects" in node && !isMixed(node.effects))
    o.effects = node.effects.map((e) => ({
      ...e,
      color: e.color ? { ...e.color } : undefined,
      offset: e.offset ? { ...e.offset } : undefined,
    }));
  if ("clipsContent" in node) o.clipsContent = node.clipsContent;
  if ("layoutMode" in node && node.layoutMode !== "NONE") {
    Object.assign(o, {
      layoutMode: node.layoutMode,
      itemSpacing: node.itemSpacing,
      paddingTop: node.paddingTop,
      paddingRight: node.paddingRight,
      paddingBottom: node.paddingBottom,
      paddingLeft: node.paddingLeft,
      primaryAxisAlignItems: node.primaryAxisAlignItems,
      counterAxisAlignItems: node.counterAxisAlignItems,
      layoutWrap: node.layoutWrap,
    });
  }
  try {
    if (
      node.parent &&
      "layoutMode" in node.parent &&
      node.parent.layoutMode !== "NONE"
    ) {
      o.layoutSizingHorizontal = node.layoutSizingHorizontal;
      o.layoutSizingVertical = node.layoutSizingVertical;
      if (node.layoutPositioning === "ABSOLUTE")
        o.layoutPositioning = "ABSOLUTE";
    }
  } catch {}

  if (node.type === "TEXT") {
    o.characters = node.characters;
    const segs = node.getStyledTextSegments([
      "fontName",
      "fontSize",
      "fontWeight",
      "lineHeight",
      "letterSpacing",
      "textDecoration",
      "textCase",
      "fills",
      "listOptions",
      "indentation",
      "paragraphSpacing",
      "hyperlink",
    ]);
    o.style = textStyle(segs[0], node);
    o.fills = paints(segs[0].fills);
    if (segs.length > 1) {
      o.styleOverrideTable = {};
      segs.slice(1).forEach((s, i) => {
        const st = textStyle(s, node);
        o.styleOverrideTable[i + 1] = {
          ...st,
          start: s.start,
          end: s.end,
          fills: paints(s.fills),
        };
      });
    }
  }

  if (["VECTOR", "BOOLEAN_OPERATION", "STAR", "POLYGON"].includes(node.type)) {
    svgs.push(node);
    return o; // filhos de um vetor composto saem dentro do SVG
  }
  if ("children" in node)
    o.children = node.children.map((c) => serialize(c, svgs, images));
  return o;
}

async function exportPng(node) {
  for (const scale of [2, 1]) {
    try {
      return {
        scale,
        bytes: await node.exportAsync({
          format: "PNG",
          constraint: { type: "SCALE", value: scale },
        }),
      };
    } catch {
      figma.ui.postMessage({
        type: "log",
        text: `${node.name}: PNG a ${scale}x falhou, tentando menor`,
      });
    }
  }
  return null;
}

figma.ui.onmessage = async (msg) => {
  if (msg.type !== "export") return;
  const sel = figma.currentPage.selection;
  if (!sel.length)
    return figma.ui.postMessage({
      type: "log",
      text: "Selecione um ou mais frames.",
    });
  const files = [];
  const images = new Set();
  for (const node of sel) {
    const slug = node.id.replace(/:/g, "-");
    figma.ui.postMessage({
      type: "log",
      text: `Exportando ${node.name} (${node.id})…`,
    });
    const svgs = [];
    const tree = serialize(node, svgs, images);
    const png = await exportPng(node);
    if (png) tree.exportScale = png.scale;
    files.push({ path: `${slug}.json`, data: JSON.stringify(tree, null, 2) });
    if (png) files.push({ path: `${slug}.png`, bytes: png.bytes });
    for (const v of svgs) {
      try {
        files.push({
          path: `svg/${v.id.replace(/[:;]/g, "-")}.svg`,
          bytes: await v.exportAsync({ format: "SVG" }),
        });
      } catch {}
    }
  }
  figma.ui.postMessage({ type: "log", text: `Imagens: ${images.size}…` });
  for (const hash of images) {
    const img = figma.getImageByHash(hash);
    if (!img) continue;
    const bytes = await img.getBytesAsync();
    const ext =
      bytes[0] === 0x89
        ? "png"
        : bytes[0] === 0xff
          ? "jpg"
          : bytes[0] === 0x47
            ? "gif"
            : "webp";
    files.push({ path: `img/${hash}.${ext}`, bytes });
  }
  figma.ui.postMessage({ type: "zip", files });
};
