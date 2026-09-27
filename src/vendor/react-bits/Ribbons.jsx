import { useEffect, useRef } from 'react';
import { Renderer, Transform, Vec3, Color, Polyline } from 'ogl';

import './Ribbons.css';

const Ribbons = ({
  colors = ['#FC8EAC'],
  baseSpring = 0.03,
  baseFriction = 0.9,
  baseThickness = 30,
  offsetFactor = 0.05,
  maxAge = 500,
  pointCount = 50,
  speedMultiplier = 0.6,
  enableFade = false,
  enableShaderEffect = false,
  effectAmplitude = 2,
  backgroundColor = [0, 0, 0, 0],
  global = false,
  thicknesses = [],
  idleTimeout = 750
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement('canvas');
    const contextOptions = { alpha: true, premultipliedAlpha: true, antialias: false, depth: false };
    // A missing GPU context should leave the ordinary cursor fully usable.
    if (!canvas.getContext('webgl2', contextOptions)) return;
    const renderer = new Renderer({ canvas, dpr: 1, ...contextOptions });
    const gl = renderer.gl;
    if (Array.isArray(backgroundColor) && backgroundColor.length === 4) {
      gl.clearColor(backgroundColor[0], backgroundColor[1], backgroundColor[2], backgroundColor[3]);
    } else {
      gl.clearColor(0, 0, 0, 0);
    }

    gl.canvas.style.position = 'absolute';
    gl.canvas.style.top = '0';
    gl.canvas.style.left = '0';
    gl.canvas.style.width = '100%';
    gl.canvas.style.height = '100%';
    container.appendChild(gl.canvas);

    const scene = new Transform();
    const lines = [];

    const vertex = `
      precision highp float;

      attribute vec3 position;
      attribute vec3 next;
      attribute vec3 prev;
      attribute vec2 uv;
      attribute float side;

      uniform vec2 uResolution;
      uniform float uDPR;
      uniform float uThickness;
      uniform float uTime;
      uniform float uEnableShaderEffect;
      uniform float uEffectAmplitude;

      varying vec2 vUV;

      vec4 getPosition() {
          vec4 current = vec4(position, 1.0);
          vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
          vec2 nextScreen = next.xy * aspect;
          vec2 prevScreen = prev.xy * aspect;
          vec2 delta = nextScreen - prevScreen;
          vec2 tangent = delta / max(length(delta), 0.00001);
          vec2 normal = vec2(-tangent.y, tangent.x);
          normal /= aspect;
          normal *= mix(1.0, 0.1, pow(abs(uv.y - 0.5) * 2.0, 2.0));
          float dist = length(nextScreen - prevScreen);
          normal *= smoothstep(0.0, 0.02, dist);
          float pixelWidthRatio = 1.0 / (uResolution.y / uDPR);
          float pixelWidth = current.w * pixelWidthRatio;
          normal *= pixelWidth * uThickness;
          current.xy -= normal * side;
          if(uEnableShaderEffect > 0.5) {
            current.xy += normal * sin(uTime + current.x * 10.0) * uEffectAmplitude;
          }
          return current;
      }

      void main() {
          vUV = uv;
          gl_Position = getPosition();
      }
    `;

    const fragment = `
      precision highp float;
      uniform vec3 uColor;
      uniform float uOpacity;
      uniform float uEnableFade;
      varying vec2 vUV;
      void main() {
          float fadeFactor = 1.0;
          if(uEnableFade > 0.5) {
              fadeFactor = 1.0 - smoothstep(0.0, 1.0, vUV.y);
          }
          float opacity = uOpacity * fadeFactor;
          gl_FragColor = vec4(uColor * opacity, opacity);
      }
    `;

    function resize() {
      const width = Math.max(1, container.clientWidth);
      const height = Math.max(1, container.clientHeight);
      renderer.setSize(width, height);
      lines.forEach(line => line.polyline.resize());
    }
    window.addEventListener('resize', resize);

    const center = (colors.length - 1) / 2;
    colors.forEach((color, index) => {
      const spring = baseSpring * (1 - index * 0.12);
      const friction = baseFriction;
      const thickness = thicknesses[index] ?? baseThickness;
      const mouseOffset = new Vec3((index - center) * offsetFactor, 0, 0);

      const line = {
        spring,
        friction,
        mouseVelocity: new Vec3(),
        mouseOffset
      };

      const count = pointCount;
      const points = [];
      for (let i = 0; i < count; i++) {
        points.push(new Vec3());
      }
      line.points = points;

      line.polyline = new Polyline(gl, {
        points,
        vertex,
        fragment,
        uniforms: {
          uColor: { value: new Color(color) },
          uThickness: { value: thickness },
          uOpacity: { value: 1.0 },
          uTime: { value: 0.0 },
          uEnableShaderEffect: { value: enableShaderEffect ? 1.0 : 0.0 },
          uEffectAmplitude: { value: effectAmplitude },
          uEnableFade: { value: enableFade ? 1.0 : 0.0 }
        }
      });
      line.polyline.program.depthTest = false;
      line.polyline.program.depthWrite = false;
      line.polyline.program.cullFace = false;
      line.polyline.program.setBlendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      line.polyline.mesh.setParent(scene);
      lines.push(line);
    });

    resize();

    const mouse = new Vec3();
    let frameId = 0;
    let lastTime = 0;
    let lastMove = 0;
    const eventTarget = global ? window : container;

    function stop() {
      cancelAnimationFrame(frameId);
      frameId = 0;
      container.dataset.active = 'false';
      gl.clear(gl.COLOR_BUFFER_BIT);
    }

    function updateMouse(e) {
      if (e.pointerType !== 'mouse' || document.hidden) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (!width || !height) return;
      mouse.set((x / width) * 2 - 1, (y / height) * -2 + 1, 0);
      lastMove = performance.now();
      if (!frameId) {
        // Start at the actual pointer instead of drawing in from screen center.
        lines.forEach(line => {
          line.mouseVelocity.set(0, 0, 0);
          line.points.forEach(point => point.copy(mouse).add(line.mouseOffset));
        });
        lastTime = lastMove;
        container.dataset.active = 'true';
        frameId = requestAnimationFrame(update);
      }
    }
    function leave(e) { if (!e.relatedTarget) stop(); }
    eventTarget.addEventListener('pointermove', updateMouse, { passive: true });
    eventTarget.addEventListener('pointerout', leave);
    window.addEventListener('blur', stop);

    const tmp = new Vec3();
    function update() {
      const currentTime = performance.now();
      const age = currentTime - lastMove;
      if (document.hidden || age >= idleTimeout) { stop(); return; }
      const dt = Math.min(32, currentTime - lastTime);
      lastTime = currentTime;

      lines.forEach(line => {
        tmp.copy(mouse).add(line.mouseOffset).sub(line.points[0]).multiply(line.spring);
        line.mouseVelocity.add(tmp).multiply(line.friction);
        line.points[0].add(line.mouseVelocity);

        for (let i = 1; i < line.points.length; i++) {
          if (isFinite(maxAge) && maxAge > 0) {
            const segmentDelay = maxAge / (line.points.length - 1);
            // Avoid collapsing the entire ribbon into one point at lower frame rates.
            const alpha = 1 - Math.exp(-(dt * speedMultiplier) / segmentDelay);
            line.points[i].lerp(line.points[i - 1], alpha);
          } else {
            line.points[i].lerp(line.points[i - 1], 0.9);
          }
        }
        if (line.polyline.mesh.program.uniforms.uTime) {
          line.polyline.mesh.program.uniforms.uTime.value = currentTime * 0.001;
        }
        line.polyline.program.uniforms.uOpacity.value = Math.max(0, 1 - Math.max(0, age - idleTimeout * 0.45) / (idleTimeout * 0.55));
        line.polyline.updateGeometry();
      });

      renderer.render({ scene });
      frameId = requestAnimationFrame(update);
    }
    container.dataset.active = 'false';

    return () => {
      window.removeEventListener('resize', resize);
      eventTarget.removeEventListener('pointermove', updateMouse);
      eventTarget.removeEventListener('pointerout', leave);
      window.removeEventListener('blur', stop);
      stop();
      if (gl.canvas && gl.canvas.parentNode === container) {
        container.removeChild(gl.canvas);
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [
    colors,
    baseSpring,
    baseFriction,
    baseThickness,
    offsetFactor,
    maxAge,
    pointCount,
    speedMultiplier,
    enableFade,
    enableShaderEffect,
    effectAmplitude,
    backgroundColor,
    global,
    thicknesses,
    idleTimeout
  ]);

  return <div ref={containerRef} className="ribbons-container" />;
};

export default Ribbons;
