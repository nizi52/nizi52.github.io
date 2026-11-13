import { useEffect, useRef, useState } from 'react';

/**
 * Van Gogh Starry Night (dark theme) and Da Vinci Vitruvian Man (light theme) redrawn in characters.
 * Pass 1 samples the painting once per character cell (colour + brightness).
 * Pass 2 draws, per cell, the glyph whose ink density matches that brightness,
 * cross-fading between neighbouring glyphs so changes in brightness never step.
 */

const GLYPH_COUNT = 18;
const CANDIDATES = ' .,:;-~=+*<>/|()[]{}1ltxXZ0#MW&8%B@$';
const ATLAS_CELL_W = 60;
const ATLAS_CELL_H = 100;
const CELL_RATIO = ATLAS_CELL_H / ATLAS_CELL_W;

const VERT = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const PAINT_FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform vec2 uCell;
uniform float uTime;
uniform float uSince;
uniform float uDepth;
uniform float uPointer;
uniform float uWide;
uniform float uLight;
uniform sampler2D uImage;
uniform vec2 uImgSize;
out vec4 o;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float ease(float x) {
  x = clamp(x, 0.0, 1.0);
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
}

void main() {
  ivec2 id = ivec2(gl_FragCoord.xy);
  vec2 cellPx = (vec2(id) + 0.5) * uCell;
  vec2 scr = cellPx / uRes;
  float A = uRes.x / uRes.y;
  float I = uImgSize.x / uImgSize.y;
  float t = uTime;

  // screen in units of its own height, y up, centred
  vec2 c = vec2((scr.x - 0.5) * A, scr.y - 0.5);
  float d = ease(uDepth);

  // the painting covers the screen, then steps back and shrinks as the page scrolls
  // the dark theme painting covers the screen; the light theme drawing is shown whole, at the right edge, so the headline keeps the left
  float cover = mix(max(1.0, A / I), 0.86, uLight);
  float k = mix(1.0, 0.7, d);
  vec2 extent = cover * k * vec2(I, 1.0);
  c.x += uPointer * 0.02 * (1.0 - d);
  c.x -= uLight * max(0.0, A * 0.5 - extent.x * 0.5) * 0.9;
  c.y -= d * 0.06;
  vec2 uv = c / extent + 0.5;

  // slow flow so the brush strokes drift without ever jumping
  uv += 0.0035 * vec2(sin(uv.y * 14.0 + t * 0.35), cos(uv.x * 11.0 - t * 0.3));

  vec2 duv = (uCell / uRes.y) / extent;
  float texelsPerCell = uImgSize.x / (extent.x * uRes.y) * uCell.x;
  float lod = max(0.0, log2(texelsPerCell / 3.0));
  vec3 acc = vec3(0.0);
  vec3 centre = textureLod(uImage, vec2(uv.x, 1.0 - uv.y), lod).rgb;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 q = uv + vec2(float(i), float(j)) * duv * 0.33;
      acc += textureLod(uImage, vec2(q.x, 1.0 - q.y), lod).rgb;
    }
  }
  vec3 col = acc / 9.0;
  vec2 edge = min(uv, 1.0 - uv);
  // the picture fades out at its borders instead of ending in a hard rectangle once it steps back
  float inside = smoothstep(0.0, 0.08, min(edge.x, edge.y));

  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  // add back the brush-stroke detail the averaging washed out
  lum += 1.6 * (dot(centre, vec3(0.299, 0.587, 0.114)) - lum);
  float rawLum = lum;
  lum = smoothstep(0.12, 0.78, lum);
  col = mix(vec3(lum), col, 1.3) * mix(0.5, 1.3, lum);
  // every cell drifts up and down on its own slow cycle (about 25 s), so a glyph swaps now and then, never all at once
  lum += 0.13 * sin(t * 0.55 + hash(vec2(id)) * 6.2831) * step(0.08, lum);
  // light theme is ink on paper: the dark parts of the picture carry the glyphs
  // the light theme drawing is pre-processed to pen lines on white, so dark simply means dense
  float body = smoothstep(0.02, 0.3, 1.0 - rawLum);
  lum = mix(lum, body, uLight);
  lum *= inside;
  col *= inside;

  // keep the headline readable, then calm the whole picture as it recedes
  float dim = (1.0 - smoothstep(0.3, 0.78, scr.y)) * mix(1.0, 1.0 - smoothstep(0.5, 0.86, scr.x), uWide);
  // on the light theme the drawing stands on the right, so only the left side, under the headline, is calmed
  dim = mix(dim, (1.0 - smoothstep(0.3, 0.78, scr.y)) * (1.0 - smoothstep(0.4, 0.58, scr.x)), uLight * uWide);
  lum *= (1.0 - mix(0.5, 0.8, uLight) * dim * (1.0 - d)) * mix(1.0, mix(0.5, 0.62, uWide) * mix(1.0, 0.6, uLight), d);
  col *= mix(1.0, 0.68, d);

  // intro: cells ink in from the moon outwards, flickering through densities
  float P = ease(uSince / 4.4);
  float vis = clamp(P * 3.6 - length(c - vec2(0.3 * A, 0.18)) * 1.4 - hash(vec2(id) * 1.37) * 0.4, 0.0, 1.0);
  // the flicker belongs to the intro only: once it is over, nothing may keep changing a cell
  float jitter = (hash(vec2(id) + floor(t * 10.0)) - 0.5) * 1.4 * vis * (1.0 - vis) * (1.0 - step(4.6, uSince));
  lum = clamp(lum * vis + jitter * inside, 0.0, 1.0);

  o = vec4(col * 0.9, lum * 0.92);
}`;

const GLYPH_FRAG = `#version 300 es
precision highp float;
uniform sampler2D uPaint;
uniform sampler2D uAtlas;
uniform vec2 uCell;
uniform float uN;
uniform float uLight;
uniform vec3 uBg;
out vec4 o;
void main() {
  vec2 f = gl_FragCoord.xy / uCell;
  ivec2 id = ivec2(floor(f));
  vec2 lc = fract(f);
  vec4 s = texelFetch(uPaint, id, 0);
  float fi = s.a * (uN - 1.0);
  float i0 = floor(fi);
  float i1 = min(i0 + 1.0, uN - 1.0);
  // lc is continuous inside a cell, so its derivative is constant: mip level stays stable across cell borders
  vec2 dx = vec2(1.0 / (uCell.x * uN), 0.0);
  vec2 dy = vec2(0.0, -1.0 / uCell.y);
  float a0 = textureGrad(uAtlas, vec2((i0 + lc.x) / uN, 1.0 - lc.y), dx, dy).r;
  float a1 = textureGrad(uAtlas, vec2((i1 + lc.x) / uN, 1.0 - lc.y), dx, dy).r;
  float a = mix(a0, a1, fi - i0);
  vec3 dark = uBg + s.rgb * (a * 1.15);
  // keep the hue of the painting but at one fixed ink value, so the colours stay alive on paper
  vec3 hue = s.rgb / max(max(s.r, max(s.g, s.b)), 0.001);
  vec3 ink = mix(vec3(dot(hue, vec3(0.299, 0.587, 0.114))), hue, 1.8) * (0.14 + 0.46 * clamp(max(s.r, max(s.g, s.b)), 0.0, 1.0));
  vec3 paper = mix(uBg, ink, clamp(a * 1.25, 0.0, 1.0));
  o = vec4(mix(dark, paper, uLight), 1.0);
}`;

/** Glyphs sorted by how much ink they carry, so brightness maps to density. */
function buildAtlas() {
  const font = `bold ${ATLAS_CELL_H * 0.84}px ui-monospace, Consolas, "Courier New", monospace`;
  const probe = document.createElement('canvas');
  probe.width = ATLAS_CELL_W;
  probe.height = ATLAS_CELL_H;
  const pctx = probe.getContext('2d', { willReadFrequently: true })!;
  const draw = (ctx: CanvasRenderingContext2D, ch: string, x: number) => {
    ctx.fillStyle = '#fff';
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ch, x + ATLAS_CELL_W / 2, ATLAS_CELL_H / 2);
  };

  const ranked = [...CANDIDATES].map((ch) => {
    pctx.fillStyle = '#000';
    pctx.fillRect(0, 0, ATLAS_CELL_W, ATLAS_CELL_H);
    draw(pctx, ch, 0);
    const data = pctx.getImageData(0, 0, ATLAS_CELL_W, ATLAS_CELL_H).data;
    let ink = 0;
    for (let i = 0; i < data.length; i += 4) ink += data[i];
    return { ch, ink };
  }).sort((a, b) => a.ink - b.ink);

  const picked = Array.from({ length: GLYPH_COUNT }, (_, i) => ranked[Math.round((i / (GLYPH_COUNT - 1)) * (ranked.length - 1))].ch);

  const canvas = document.createElement('canvas');
  canvas.width = ATLAS_CELL_W * GLYPH_COUNT;
  canvas.height = ATLAS_CELL_H;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  picked.forEach((ch, i) => draw(ctx, ch, i * ATLAS_CELL_W));
  return canvas;
}

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader compile failed');
  return s;
}

function program(gl: WebGL2RenderingContext, frag: string) {
  const p = gl.createProgram()!;
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? 'program link failed');
  return p;
}

const NIGHT: [number, number, number] = [0.0431, 0.0627, 0.1255];
const PAPER: [number, number, number] = [0.659, 0.761, 0.871];

const damp = (from: number, to: number, lambda: number, dt: number) => from + (to - from) * (1 - Math.exp(-lambda * dt));

export default function Scene({
  scroll,
  go,
  still = false,
  light = false,
  onReady,
}: {
  scroll: React.MutableRefObject<number>;
  go: boolean;
  still?: boolean;
  light?: boolean;
  onReady: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [epoch, setEpoch] = useState(0);
  const live = useRef({ go, onReady });
  live.current = { go, onReady };

  useEffect(() => {
    const canvas = canvasRef.current!;
    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'default' });
    if (!gl || gl.isContextLost()) {
      live.current.onReady();
      return;
    }

    let paintProg: WebGLProgram;
    let glyphProg: WebGLProgram;
    try {
      paintProg = program(gl, PAINT_FRAG);
      glyphProg = program(gl, GLYPH_FRAG);
    } catch (err) {
      console.error(err);
      live.current.onReady();
      return;
    }

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const atlas = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, atlas);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, buildAtlas());
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const painting = gl.createTexture();
    const imgSize = { w: 1280, h: 1014 };

    const floatOk = !!(gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float'));
    const paintTex = gl.createTexture();
    const fbo = gl.createFramebuffer();
    let useFloat = floatOk;

    const allocPaint = (cols: number, rows: number) => {
      gl.bindTexture(gl.TEXTURE_2D, paintTex);
      const make = (float: boolean) => {
        gl.texImage2D(gl.TEXTURE_2D, 0, float ? gl.RGBA16F : gl.RGBA8, cols, rows, 0, gl.RGBA, float ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, paintTex, 0);
        return gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
      };
      if (!(useFloat && make(true))) {
        useFloat = false;
        make(false);
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };

    const loc = (p: WebGLProgram, name: string) => gl.getUniformLocation(p, name);
    const paintU = {
      res: loc(paintProg, 'uRes'),
      cell: loc(paintProg, 'uCell'),
      time: loc(paintProg, 'uTime'),
      since: loc(paintProg, 'uSince'),
      depth: loc(paintProg, 'uDepth'),
      pointer: loc(paintProg, 'uPointer'),
      wide: loc(paintProg, 'uWide'),
      light: loc(paintProg, 'uLight'),
      image: loc(paintProg, 'uImage'),
      imgSize: loc(paintProg, 'uImgSize'),
    };
    const glyphU = {
      paint: loc(glyphProg, 'uPaint'),
      atlas: loc(glyphProg, 'uAtlas'),
      cell: loc(glyphProg, 'uCell'),
      n: loc(glyphProg, 'uN'),
      light: loc(glyphProg, 'uLight'),
      bg: loc(glyphProg, 'uBg'),
    };

    const size = { w: 1, h: 1, cols: 1, rows: 1, cellW: 10, cellH: 16.7, wide: 1 };
    const state = { time: still ? 5 : 0, since: still ? 9 : 0, depth: scroll.current, pointer: 0, pointerTarget: 0 };

    const draw = () => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.viewport(0, 0, size.cols, size.rows);
      gl.useProgram(paintProg);
      gl.uniform2f(paintU.res, size.w, size.h);
      gl.uniform2f(paintU.cell, size.cellW, size.cellH);
      gl.uniform1f(paintU.time, state.time);
      gl.uniform1f(paintU.since, state.since);
      gl.uniform1f(paintU.depth, state.depth);
      gl.uniform1f(paintU.pointer, state.pointer);
      gl.uniform1f(paintU.wide, size.wide);
      gl.uniform1f(paintU.light, light ? 1 : 0);
      gl.uniform2f(paintU.imgSize, imgSize.w, imgSize.h);
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, painting);
      gl.uniform1i(paintU.image, 2);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, size.w, size.h);
      gl.useProgram(glyphProg);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, paintTex);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, atlas);
      gl.uniform1i(glyphU.paint, 0);
      gl.uniform1i(glyphU.atlas, 1);
      gl.uniform2f(glyphU.cell, size.cellW, size.cellH);
      gl.uniform1f(glyphU.n, GLYPH_COUNT);
      gl.uniform1f(glyphU.light, light ? 1 : 0);
      gl.uniform3f(glyphU.bg, ...(light ? PAPER : NIGHT));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = canvas.clientWidth || 1;
      const cssH = canvas.clientHeight || 1;
      const cw = light ? Math.min(6, Math.max(4, Math.round(cssW / 300))) : Math.min(10, Math.max(8, Math.round(cssW / 170)));
      size.w = canvas.width = Math.max(1, Math.round(cssW * dpr));
      size.h = canvas.height = Math.max(1, Math.round(cssH * dpr));
      size.cellW = cw * dpr;
      size.cellH = cw * CELL_RATIO * dpr;
      size.cols = Math.ceil(size.w / size.cellW);
      size.rows = Math.ceil(size.h / size.cellH);
      size.wide = cssW >= 900 ? 1 : 0;
      allocPaint(size.cols, size.rows);
    };

    // a GPU reset must not leave the hero empty: rebuild everything once the context is back
    const onLost = (e: Event) => e.preventDefault();
    const onRestored = () => setEpoch((n) => n + 1);
    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const onPointer = (e: PointerEvent) => {
      state.pointerTarget = (e.clientX / window.innerWidth) * 2 - 1;
    };
    if (!still) window.addEventListener('pointermove', onPointer, { passive: true });

    let raf = 0;
    let last = performance.now();
    let first = true;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      // a long frame (tab switch, loading hitch) must not make anything jump
      const dt = Math.min(Math.max((now - last) / 1000, 0), 0.05);
      last = now;
      if (!still) {
        state.time += dt;
        if (live.current.go) state.since += dt;
        state.pointer = damp(state.pointer, state.pointerTarget, 2.5, dt);
      }
      state.depth = damp(state.depth, scroll.current, 4, dt);
      draw();
      if (first) {
        first = false;
        live.current.onReady();
      }
    };

    let cancelled = false;
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      if (cancelled) return;
      imgSize.w = img.naturalWidth;
      imgSize.h = img.naturalHeight;
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, painting);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      raf = requestAnimationFrame(frame);
    };
    img.onerror = () => live.current.onReady();
    img.src = light ? '/vitruvian.jpg' : '/starry-night.jpg';

    return () => {
      cancelled = true;
      img.onload = null;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointermove', onPointer);
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
      gl.deleteTexture(atlas);
      gl.deleteTexture(painting);
      gl.deleteTexture(paintTex);
      gl.deleteFramebuffer(fbo);
      gl.deleteProgram(paintProg);
      gl.deleteProgram(glyphProg);
      gl.deleteVertexArray(vao);
    };
  }, [scroll, still, light, epoch]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />;
}
