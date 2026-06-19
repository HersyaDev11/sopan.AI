"use client";

import { useEffect, useRef } from "react";
import "./LiquidEther.css";

/**
 * LiquidEther Background - Inspired by React Bits
 * A beautiful fluid/ether animation using WebGL shaders
 * Lightweight implementation without Three.js dependency
 */
export default function LiquidEther({
  colors = ["#FF6B35", "#FF4500", "#1a1a2e"],
  speed = 1.0,
  noiseIntensity = 1.5,
  style = {},
  className = "",
}) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) {
      console.warn("WebGL not supported, falling back to CSS background");
      return;
    }

    // Vertex shader
    const vertexShaderSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Fragment shader - Liquid Ether effect
    const fragmentShaderSource = `
      precision highp float;
      
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec3 u_color1;
      uniform vec3 u_color2;
      uniform vec3 u_color3;
      uniform float u_speed;
      uniform float u_noise;

      // Simplex-ish noise functions
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

      float snoise(vec3 v) {
        const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);

        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);

        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;

        i = mod289(i);
        vec4 p = permute(permute(permute(
                  i.z + vec4(0.0, i1.z, i2.z, 1.0))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));

        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;

        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);

        vec4 x = x_ * ns.x + ns.yyyy;
        vec4 y = y_ * ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);

        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);

        vec4 s0 = floor(b0) * 2.0 + 1.0;
        vec4 s1 = floor(b1) * 2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));

        vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);

        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;

        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        float aspect = u_resolution.x / u_resolution.y;
        vec2 p = vec2(uv.x * aspect, uv.y);
        
        float t = u_time * u_speed * 0.15;
        
        // Multi-layered noise for liquid effect
        float n1 = snoise(vec3(p * 2.0, t * 0.8)) * u_noise;
        float n2 = snoise(vec3(p * 4.0 + vec2(5.2, 1.3), t * 0.6)) * u_noise * 0.5;
        float n3 = snoise(vec3(p * 8.0 + vec2(8.7, 3.1), t * 0.4)) * u_noise * 0.25;
        
        float noise = n1 + n2 + n3;
        
        // Warped UV for fluid distortion
        vec2 warpedUV = uv + vec2(
          snoise(vec3(p * 3.0, t * 0.5)) * 0.15,
          snoise(vec3(p * 3.0 + 100.0, t * 0.5)) * 0.15
        );
        
        // Color mixing with ether-like flow
        float flow1 = snoise(vec3(warpedUV * 3.0, t * 0.7));
        float flow2 = snoise(vec3(warpedUV * 2.0 + 50.0, t * 0.5));
        
        float mix1 = smoothstep(-0.5, 0.8, flow1 + noise * 0.3);
        float mix2 = smoothstep(-0.3, 0.7, flow2 + noise * 0.2);
        
        vec3 col = mix(u_color1, u_color2, mix1);
        col = mix(col, u_color3, mix2 * 0.6);
        
        // Add ethereal glow
        float glow = snoise(vec3(warpedUV * 1.5, t * 0.3));
        glow = pow(max(glow, 0.0), 2.0) * 0.4;
        col += glow * u_color1;
        
        // Vignette
        float vignette = 1.0 - length((uv - 0.5) * 1.3);
        vignette = smoothstep(0.0, 0.7, vignette);
        col *= vignette * 0.85 + 0.15;
        
        gl_FragColor = vec4(col, 1.0);
      }
    `;

    // Compile shaders
    function createShader(gl, type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Full-screen quad
    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Uniforms
    const timeLocation = gl.getUniformLocation(program, "u_time");
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const color1Location = gl.getUniformLocation(program, "u_color1");
    const color2Location = gl.getUniformLocation(program, "u_color2");
    const color3Location = gl.getUniformLocation(program, "u_color3");
    const speedLocation = gl.getUniformLocation(program, "u_speed");
    const noiseLocation = gl.getUniformLocation(program, "u_noise");

    // Parse hex colors to RGB
    function hexToRgb(hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? [
            parseInt(result[1], 16) / 255,
            parseInt(result[2], 16) / 255,
            parseInt(result[3], 16) / 255,
          ]
        : [1, 1, 1];
    }

    const c1 = hexToRgb(colors[0] || "#FF6B35");
    const c2 = hexToRgb(colors[1] || "#FF4500");
    const c3 = hexToRgb(colors[2] || "#1a1a2e");

    gl.uniform3f(color1Location, c1[0], c1[1], c1[2]);
    gl.uniform3f(color2Location, c2[0], c2[1], c2[2]);
    gl.uniform3f(color3Location, c3[0], c3[1], c3[2]);
    gl.uniform1f(speedLocation, speed);
    gl.uniform1f(noiseLocation, noiseIntensity);

    // Resize handler
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.parentElement?.getBoundingClientRect() || {
        width: window.innerWidth,
        height: window.innerHeight,
      };
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener("resize", resize);

    // Render loop
    let startTime = performance.now();

    function render() {
      const elapsed = (performance.now() - startTime) / 1000;
      gl.uniform1f(timeLocation, elapsed);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animRef.current = requestAnimationFrame(render);
    }

    render();

    return () => {
      window.removeEventListener("resize", resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(buffer);
    };
  }, [colors, speed, noiseIntensity]);

  return (
    <div
      className={`liquid-ether-container ${className}`}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}
