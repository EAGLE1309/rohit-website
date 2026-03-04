"use client";

import { useEffect, useRef, useCallback } from "react";

interface CDShineEffectProps {
  isSpinning: boolean;
  size: number;
  bloomStrength?: number;
  bloomThreshold?: number;
  rainbowStrength?: number;
}

const vertexShaderSource = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
  
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_texCoord;
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  
  varying vec2 v_texCoord;
  uniform float u_time;
  uniform float u_spinning;
  uniform float u_spinPhase;
  uniform vec2 u_resolution;
  uniform float u_bloomStrength;
  uniform float u_bloomThreshold;
  uniform float u_rainbowStrength;
  
  #define PI 3.14159265359
  
  // Noise function for organic feel
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }
  
  void main() {
    vec2 uv = v_texCoord;
    vec2 center = vec2(0.5, 0.5);
    vec2 fromCenter = uv - center;
    float dist = length(fromCenter);
    float angle = atan(fromCenter.y, fromCenter.x);
    
    // Only render within the CD circle
    if (dist > 0.5 || dist < 0.16) {
      discard;
    }
    
    float spinSpeed = u_spinPhase; // matches 5s rotation
    
    // === SCANLINES (concentric rings) ===
    float ringFreq = 260.0;
    float scanPhase = (uv.x - 0.5) * ringFreq + spinSpeed * 0.35;
    float scanLines = abs(sin(scanPhase));
    float ringMask = smoothstep(0.2, 0.32, dist) * smoothstep(0.5, 0.38, dist);
    float rings = pow(scanLines, 3.0) * 0.14 * ringMask;
    
    // === RADIAL LINES (like CD tracks) ===
    float radialBase = sin((angle + spinSpeed * 0.5) * 40.0) * 0.5 + 0.5;
    float radialLines = pow(radialBase, 8.0) * 0.05 * ringMask;
    
    // === RAINBOW HOLOGRAPHIC SHINE ===
    float shineAngle = angle + spinSpeed;
    
    // Multiple light sources for complex reflection
    float shine1 = pow(max(0.0, cos(shineAngle - PI * 0.25)), 8.0);
    float shine2 = pow(max(0.0, cos(shineAngle + PI * 0.5)), 6.0);
    float shine3 = pow(max(0.0, cos(shineAngle - PI)), 10.0);
    
    // Rainbow color based on angle and distance
    vec3 rainbow;
    float hueShift = shineAngle * 0.5 + dist * 3.0 + u_time * 0.3;
    rainbow.r = sin(hueShift) * 0.5 + 0.5;
    rainbow.g = sin(hueShift + 2.094) * 0.5 + 0.5;
    rainbow.b = sin(hueShift + 4.188) * 0.5 + 0.5;
    
    // Combine shines with rainbow
    float totalShine = shine1 * 0.6 + shine2 * 0.3 + shine3 * 0.4;
    totalShine *= smoothstep(0.1, 0.3, dist) * smoothstep(0.5, 0.35, dist);
    
    // === SPECULAR HIGHLIGHTS ===
    float specular1 = pow(max(0.0, cos(shineAngle - PI * 0.3)), 32.0) * 0.5;
    float specular2 = pow(max(0.0, cos(shineAngle + PI * 0.7)), 24.0) * 0.3;
    
    // Moving highlight sweep
    float sweep = sin(u_time * 0.8) * 0.5 + 0.5;
    float sweepAngle = mix(-PI, PI, sweep);
    float sweepHighlight = pow(max(0.0, cos(shineAngle - sweepAngle)), 16.0) * 0.4;
    
    // === MICRO TEXTURE ===
    float microNoise = noise(uv * 400.0 + u_time * 0.1) * 0.03;
    
    // === COMBINE ALL EFFECTS ===
    vec3 color = vec3(0.0);
    
    // Base scanlines (subtle silver)
    color += vec3(0.7, 0.75, 0.8) * (rings + radialLines);

    float highlightIntensity = 0.25 + 0.75 * u_spinning;
    
    // Rainbow holographic
    color += rainbow * totalShine * highlightIntensity * u_rainbowStrength;
    
    // White specular highlights
    color += vec3(1.0) * (specular1 + specular2) * highlightIntensity;
    
    // Sweep highlight (cyan-ish)
    color += vec3(0.6, 0.9, 1.0) * sweepHighlight * highlightIntensity;
    
    // Micro texture
    color += vec3(microNoise);
    
    // Edge glow
    float edgeGlow = smoothstep(0.48, 0.5, dist) * 0.2;
    color += vec3(0.8, 0.85, 0.9) * edgeGlow;
    
    // Inner ring glow
    float innerGlow = smoothstep(0.22, 0.18, dist) * 0.18;
    color += vec3(0.9, 0.92, 0.95) * innerGlow;

    float brightness = max(max(color.r, color.g), color.b);
    float threshold = u_bloomThreshold;
    float bloom = pow(max(0.0, brightness - threshold), 2.0) * (1.8 + 0.8 * u_spinning) * u_bloomStrength;
    vec3 bloomColor = vec3(brightness) * bloom;
    color += bloomColor * 0.9;
    
    // Calculate alpha - more visible when spinning
    float alpha = (rings + radialLines) * 0.6;
    alpha += totalShine * 0.8 * highlightIntensity;
    alpha += (specular1 + specular2 + sweepHighlight) * highlightIntensity;
    alpha += microNoise;
    alpha += edgeGlow + innerGlow;
    alpha += bloom * 0.6;
    alpha = clamp(alpha, 0.0, 0.95);
    
    // Fade effect when not spinning
    float baseVisibility = 0.55;
    float spinVisibility = mix(baseVisibility, 1.0, u_spinning);
    alpha *= spinVisibility;
    
    gl_FragColor = vec4(color, alpha);
  }
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  return program;
}
export default function CDShineEffect({ isSpinning, size, bloomStrength = 1, bloomThreshold = 0.45, rainbowStrength = 1 }: CDShineEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());
  const spinPhaseRef = useRef<number>(0);
  const lastTimeRef = useRef<number | null>(null);
  const spinningRef = useRef<number>(0);
  const spinningTargetRef = useRef<number>(0);
  const bloomStrengthRef = useRef<number>(bloomStrength);
  const bloomThresholdRef = useRef<number>(bloomThreshold);
  const rainbowStrengthRef = useRef<number>(rainbowStrength);
  const uniformLocsRef = useRef<{
    time: WebGLUniformLocation | null;
    spinning: WebGLUniformLocation | null;
    resolution: WebGLUniformLocation | null;
    bloomStrength: WebGLUniformLocation | null;
    bloomThreshold: WebGLUniformLocation | null;
    rainbowStrength: WebGLUniformLocation | null;
    spinPhase: WebGLUniformLocation | null;
  } | null>(null);

  const initWebGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return false;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: true,
    });
    if (!gl) {
      console.error("WebGL not supported");
      return false;
    }

    glRef.current = gl;

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) return false;

    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) return false;

    programRef.current = program;

    // Set up geometry (full-screen quad)
    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);

    const texCoords = new Float32Array([0, 1, 1, 1, 0, 0, 1, 0]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

    const texCoordLocation = gl.getAttribLocation(program, "a_texCoord");
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

    gl.useProgram(program);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    uniformLocsRef.current = {
      time: gl.getUniformLocation(program, "u_time"),
      spinning: gl.getUniformLocation(program, "u_spinning"),
      resolution: gl.getUniformLocation(program, "u_resolution"),
      bloomStrength: gl.getUniformLocation(program, "u_bloomStrength"),
      bloomThreshold: gl.getUniformLocation(program, "u_bloomThreshold"),
      rainbowStrength: gl.getUniformLocation(program, "u_rainbowStrength"),
      spinPhase: gl.getUniformLocation(program, "u_spinPhase"),
    };

    return true;
  }, []);

  useEffect(() => {
    spinningTargetRef.current = isSpinning ? 1 : 0;
  }, [isSpinning]);

  useEffect(() => {
    bloomStrengthRef.current = bloomStrength;
  }, [bloomStrength]);

  useEffect(() => {
    bloomThresholdRef.current = bloomThreshold;
  }, [bloomThreshold]);

  useEffect(() => {
    rainbowStrengthRef.current = rainbowStrength;
  }, [rainbowStrength]);

  const render = useCallback(() => {
    const gl = glRef.current;
    const program = programRef.current;
    const canvas = canvasRef.current;

    const locs = uniformLocsRef.current;
    if (!gl || !program || !canvas || !locs) return;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const now = Date.now();
    const time = (now - startTimeRef.current) / 1000;

    let lastTime = lastTimeRef.current;
    if (lastTime === null) {
      lastTime = time;
    }
    const dt = time - lastTime;
    lastTimeRef.current = time;

    // Smooth transition for spinning state
    const targetSpinning = spinningTargetRef.current;
    spinningRef.current += (targetSpinning - spinningRef.current) * 0.05;

    const omega = 1.256637;
    spinPhaseRef.current += spinningRef.current * omega * dt;

    gl.uniform1f(locs.time, time);
    gl.uniform1f(locs.spinning, spinningRef.current);
    gl.uniform2f(locs.resolution, canvas.width, canvas.height);
    gl.uniform1f(locs.bloomStrength, bloomStrengthRef.current);
    gl.uniform1f(locs.bloomThreshold, bloomThresholdRef.current);
    gl.uniform1f(locs.rainbowStrength, rainbowStrengthRef.current);
    gl.uniform1f(locs.spinPhase, spinPhaseRef.current);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    animationRef.current = requestAnimationFrame(render);
  }, []);

  useEffect(() => {
    const initialized = initWebGL();
    if (initialized) {
      render();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [initWebGL, render]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
