import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { motion, AnimatePresence } from 'motion/react';

const SENTENCES = [
  "Once again",
  "Happy birthday",
  "Isra Nayzila Jamal",
  "I hope to see your smile again",
  "You're always in my prayers",
  "Every part of this, all for you <3",
];

type PhaseType = 'countdown' | 'sentences' | 'orbit';

export default function EndingScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<PhaseType>('countdown');
  const [isPolaroidExpanded, setIsPolaroidExpanded] = useState(false);

  // Three.js refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const geometryRef = useRef<THREE.BufferGeometry | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  
  const stardustPointsRef = useRef<THREE.Points | null>(null);
  const stardustGeoRef = useRef<THREE.BufferGeometry | null>(null);
  const galaxyPointsRef = useRef<THREE.Points | null>(null);
  const galaxyMatRef = useRef<THREE.PointsMaterial | null>(null);
  const cometRefs = useRef<THREE.Points[]>([]);
  const blackHoleMeshRef = useRef<THREE.Mesh | null>(null);
  const particlesMatRef = useRef<THREE.PointsMaterial | null>(null);

  // Animation state
  const targetPositionsRef = useRef<Float32Array | null>(null);
  const targetColorsRef = useRef<Float32Array | null>(null);
  const currentPositionsRef = useRef<Float32Array | null>(null);
  const currentColorsRef = useRef<Float32Array | null>(null);
  const animationFrameRef = useRef<number>(0);
  const particleCount = 45000;
  
  const phaseRef = useRef<PhaseType>('countdown');

  // --- Shape Generators ---

  const createHeartTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      const x = 32, y = 20, size = 18;
      ctx.moveTo(x, y + size / 4);
      ctx.quadraticCurveTo(x, y, x - size / 2, y);
      ctx.quadraticCurveTo(x - size, y, x - size, y + size / 2.5);
      ctx.quadraticCurveTo(x - size, y + size, x, y + size * 1.5);
      ctx.quadraticCurveTo(x + size, y + size, x + size, y + size / 2.5);
      ctx.quadraticCurveTo(x + size, y, x + size / 2, y);
      ctx.quadraticCurveTo(x, y, x, y + size / 4);
      ctx.fillStyle = 'white';
      ctx.fill();
    }
    return new THREE.CanvasTexture(canvas);
  };

  const generateText = (text: string, count: number) => {
    const canvas = document.createElement('canvas');
    const width = 1024;
    const height = 1024;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return { pos: new Float32Array(count * 3), col: new Float32Array(count * 3) };

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);

    let isMobile = false;
    if (typeof window !== 'undefined') {
      isMobile = window.innerWidth < 768;
    }
    let fontSize = isMobile ? 50 : 100;
    if (text.length === 1) fontSize = isMobile ? 150 : 400; // For countdown

    ctx.font = `bold ${fontSize}px "Quicksand", sans-serif`;
    
    let lines = [text];
    const maxWidth = isMobile ? 700 : 900;
    if (text.length > 1) {
      // Wrap text to fit within maxWidth
      const words = text.split(' ');
      lines = [];
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const textWidth = ctx.measureText(currentLine + " " + word).width;
        if (textWidth < maxWidth) {
          currentLine += " " + word;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      lines.push(currentLine);
      
      // If we have too many lines, reduce font size
      if (lines.length > 3) {
        fontSize = isMobile ? 40 : 75;
        ctx.font = `bold ${fontSize}px "Quicksand", sans-serif`;
        lines = [];
        currentLine = words[0];
        for (let i = 1; i < words.length; i++) {
          const word = words[i];
          const textWidth = ctx.measureText(currentLine + " " + word).width;
          if (textWidth < maxWidth) {
            currentLine += " " + word;
          } else {
            lines.push(currentLine);
            currentLine = word;
          }
        }
        lines.push(currentLine);
      }
    }

    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const lineHeight = fontSize * 1.3;
    const startY = height / 2 - (lines.length - 1) * lineHeight / 2;

    lines.forEach((line, i) => {
      ctx.fillText(line, width / 2, startY + i * lineHeight);
    });

    const imgData = ctx.getImageData(0, 0, width, height).data;
    const tempPos = [];
    const tempCol = [];

    const step = text.length === 1 ? 4 : 2;
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const idx = (y * width + x) * 4;
        if (imgData[idx] > 128) {
          const px = (x / width) * 2 - 1;
          const py = -(y / height) * 2 + 1;
          tempPos.push(px * 18, py * 18, (Math.random() - 0.5) * 1.5);
          
          // Uniform soft glow for text to ensure readability across the whole screen
          const r = 0.7;
          const g = 0.8;
          const b = 0.9;
          tempCol.push(r, g, b);
        }
      }
    }

    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      if (i < tempPos.length / 3) {
        pos[i * 3] = tempPos[i * 3];
        pos[i * 3 + 1] = tempPos[i * 3 + 1];
        pos[i * 3 + 2] = tempPos[i * 3 + 2];
        col[i * 3] = tempCol[i * 3];
        col[i * 3 + 1] = tempCol[i * 3 + 1];
        col[i * 3 + 2] = tempCol[i * 3 + 2];
      } else {
        pos[i * 3] = (Math.random() - 0.5) * 60;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 60;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 60;
        col[i * 3] = 0.1; col[i * 3 + 1] = 0.0; col[i * 3 + 2] = 0.0;
      }
    }
    return { pos, col };
  };

  const updateShape = (shape: string, text?: string) => {
    let data;
    switch (shape) {
      case 'text': data = generateText(text || '', particleCount); break;
      case 'fadeout': 
        data = { 
          pos: currentPositionsRef.current ? new Float32Array(currentPositionsRef.current) : new Float32Array(particleCount * 3), 
          col: new Float32Array(particleCount * 3).fill(0) 
        }; 
        break;
      default: data = generateText('', particleCount);
    }
    
    // Scatter effect before forming new shape
    if (currentPositionsRef.current && shape !== 'fadeout') {
      const cPos = currentPositionsRef.current;
      for(let i=0; i<cPos.length; i++) {
        cPos[i] += (Math.random() - 0.5) * 15;
      }
    }

    targetPositionsRef.current = data.pos;
    targetColorsRef.current = data.col;
  };

  // Sequence Logic
  useEffect(() => {
    let timeoutIds: NodeJS.Timeout[] = [];
    
    const startSequence = () => {
      // Delay start to allow falling items to show
      timeoutIds.push(setTimeout(() => {
        setPhase('countdown');
        phaseRef.current = 'countdown';
        
        // Countdown 3 to 1
        for (let i = 3; i >= 1; i--) {
          timeoutIds.push(setTimeout(() => {
            updateShape('text', i.toString());
          }, (3 - i) * 1500));
        }

        // Sentences
        const sentenceStartTime = 3 * 1500 + 500;
        timeoutIds.push(setTimeout(() => {
          setPhase('sentences');
          phaseRef.current = 'sentences';
        }, sentenceStartTime));

        SENTENCES.forEach((sentence, i) => {
          timeoutIds.push(setTimeout(() => {
            updateShape('text', sentence);
          }, sentenceStartTime + i * 3000));
        });

        // Orbit
        const orbitStartTime = sentenceStartTime + SENTENCES.length * 3000 + 1000;
        timeoutIds.push(setTimeout(() => {
          setPhase('orbit');
          phaseRef.current = 'orbit';
          updateShape('fadeout');
          if (controlsRef.current) {
            controlsRef.current.enabled = true; // Enable rotation
            controlsRef.current.autoRotate = true;
          }
        }, orbitStartTime));

      }, 4500)); // 2 seconds initial delay
    };

    startSequence();

    return () => {
      timeoutIds.forEach(clearTimeout);
    };
  }, []);

  // Initialize Three.js
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const updateCameraZ = (w: number, h: number) => {
      const aspect = w / h;
      if (cameraRef.current) {
        if (aspect < 1) {
          // Portrait mode (mobile)
          cameraRef.current.position.z = 30 / aspect * 0.7;
        } else {
          // Landscape mode
          cameraRef.current.position.z = 30;
        }
        cameraRef.current.updateProjectionMatrix();
      }
    };

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    cameraRef.current = camera;
    updateCameraZ(width, height);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 1.5, 0.4, 0.85);
    bloomPass.threshold = 0.2; // Lowered threshold so glow is always visible even when zoomed out
    bloomPass.strength = 1.5; // Slightly stronger glow
    bloomPass.radius = 0.5;

    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
    composerRef.current = composer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.minDistance = 10;
    controls.maxDistance = 120;
    controls.enabled = false; // Disabled initially
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.02; // Extremely slow rotation
    controlsRef.current = controls;

    // --- NEW GALAXY & SINGLE POLAROID ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // Background Stars
    const starsGeo = new THREE.BufferGeometry();
    const starsCount = 2500;
    const starsPos = new Float32Array(starsCount * 3);
    for(let i=0; i<starsCount*3; i+=3) {
      const r = 120 + Math.random() * 150; // Far away
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      starsPos[i] = r * Math.sin(phi) * Math.cos(theta);
      starsPos[i+1] = r * Math.sin(phi) * Math.sin(theta);
      starsPos[i+2] = r * Math.cos(phi);
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starsPos, 3));
    const starsMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.15,
      transparent: true,
      opacity: 0.4,
      depthWrite: false
    });
    const starsPoints = new THREE.Points(starsGeo, starsMat);
    scene.add(starsPoints);

    // Galaxy Generator
    const parameters = {
      count: 150000,
      size: 0.1,
      radius: 45,
      branches: 3,
      spin: 4.0,
      randomness: 0.2,
      randomnessPower: 3,
      thickness: 0.02,
      insideColor: '#ffb3d9',
      middleColor: '#e60073',
      outsideColor: '#1a0033',
      blackHoleRadius: 6.0
    };

    const galaxyGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);

    const colorInside = new THREE.Color(parameters.insideColor);
    const colorMiddle = new THREE.Color(parameters.middleColor);
    const colorOutside = new THREE.Color(parameters.outsideColor);

    for (let i = 0; i < parameters.count; i++) {
      const i3 = i * 3;
      
      // Smooth distribution, heavily weighted towards the inner edge
      const radiusDist = Math.pow(Math.random(), 2.5);
      const radius = parameters.blackHoleRadius + radiusDist * (parameters.radius - parameters.blackHoleRadius);
      
      const spinAngle = (radius / parameters.radius) * Math.PI * 2 * parameters.spin;
      const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2;

      // Tighten the disk near the black hole for a smooth ring
      const tightness = 0.01 * (1.0 - radiusDist) + parameters.randomness * radiusDist;
      
      const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * tightness * radius;
      const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.thickness * radius;
      const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * tightness * radius;

      positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
      positions[i3 + 1] = randomY;
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

      const mixedColor = new THREE.Color();
      const colorRatio = radiusDist;
      
      if (colorRatio < 0.3) {
         mixedColor.copy(colorInside).lerp(colorMiddle, colorRatio / 0.3);
      } else {
         mixedColor.copy(colorMiddle).lerp(colorOutside, (colorRatio - 0.3) / 0.7);
      }

      // Add extra glow for particles further away from the black hole
      const distanceGlow = 1.0 + (colorRatio * 2.0);

      colors[i3] = mixedColor.r * 3.0 * distanceGlow;
      colors[i3 + 1] = mixedColor.g * 3.0 * distanceGlow;
      colors[i3 + 2] = mixedColor.b * 3.0 * distanceGlow;
    }

    galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const heartTexture = createHeartTexture();

    const galaxyMaterial = new THREE.PointsMaterial({
      size: parameters.size,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      map: heartTexture
    });

    galaxyMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.time = { value: 0 };
      shader.vertexShader = `
        varying vec3 vPos;
      ` + shader.vertexShader.replace(
        `#include <begin_vertex>`,
        `#include <begin_vertex>
         vPos = position;`
      );
      shader.fragmentShader = `
        uniform float time;
        varying vec3 vPos;
      ` + shader.fragmentShader.replace(
        `vec4 diffuseColor = vec4( diffuse, opacity );`,
        `vec4 diffuseColor = vec4( diffuse, opacity );
         float dist = length(vPos);
         
         // 0. Dampen glow near the blackhole (dist 6.0 to 20.0)
         float centerDamp = smoothstep(12.0, 25.0, dist);
         
         // 1. Slow, subtle ambient wave
         float slowWave = sin(dist * 0.15 - time * 0.3) * 0.5 + 0.5;
         
         // 2. Edge boost to prevent the galaxy from fading too much at the edges
         float edgeBoost = 1.0 + smoothstep(15.0, 50.0, dist) * 2.0;
         
         // Apply base glow (significantly reduced near center)
         diffuseColor.rgb *= (1.0 + slowWave * 1.5 * centerDamp) * edgeBoost;
        `
      );
      galaxyMaterial.userData.shader = shader;
    };

    const galaxyPoints = new THREE.Points(galaxyGeometry, galaxyMaterial);
    galaxyPoints.visible = false;
    galaxyPoints.rotation.x = Math.PI / 6; // Tilt the galaxy a bit
    scene.add(galaxyPoints);
    galaxyPointsRef.current = galaxyPoints;
    galaxyMatRef.current = galaxyMaterial;

    // Simple Black Hole with Glowing Edge
    const blackHoleShader = {
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec2 vUv;

        void main() {
          vec2 p = vUv * 2.0 - 1.0;
          float r = length(p);
          float bhRadius = 0.15;
          
          // 1. Pure Black Core
          if (r < bhRadius) {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
            return;
          }
          
          // 2. Simple Glowing Edge (Photon Ring)
          // Very sharp inner edge, slightly faded outer edge
          float ring = smoothstep(bhRadius + 0.015, bhRadius, r);
          
          // Color of the ring (soft pinkish-white, bright enough to bloom)
          vec3 ringColor = vec3(1.0, 0.9, 0.95) * 2.5;
          
          gl_FragColor = vec4(ringColor * ring, ring);
        }
      `
    };

    const blackHoleGeo = new THREE.PlaneGeometry(80, 80);
    const blackHoleMat = new THREE.ShaderMaterial({
      uniforms: blackHoleShader.uniforms,
      vertexShader: blackHoleShader.vertexShader,
      fragmentShader: blackHoleShader.fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending
    });
    const blackHoleMesh = new THREE.Mesh(blackHoleGeo, blackHoleMat);
    
    // Add solid black center to properly occlude background particles
    const bhCenterGeo = new THREE.SphereGeometry(parameters.blackHoleRadius * 0.98, 64, 64);
    const bhCenterMat = new THREE.MeshBasicMaterial({ color: 0x000000, depthWrite: true });
    const bhCenterMesh = new THREE.Mesh(bhCenterGeo, bhCenterMat);
    blackHoleMesh.add(bhCenterMesh);
    
    blackHoleMesh.visible = false;
    scene.add(blackHoleMesh);
    blackHoleMeshRef.current = blackHoleMesh;

    // --- END NEW GALAXY & BLACK HOLE ---

    const geometry = new THREE.BufferGeometry();
    geometryRef.current = geometry;

    // Start particles scattered
    const currentPos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      currentPos[i] = (Math.random() - 0.5) * 100;
    }
    currentPositionsRef.current = currentPos;
    
    const currentCols = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) currentCols[i] = 1.0;
    currentColorsRef.current = currentCols;

    geometry.setAttribute('position', new THREE.BufferAttribute(currentPos, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(currentCols, 3));

    const material = new THREE.PointsMaterial({
      size: 0.22,
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
      map: heartTexture,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    particlesMatRef.current = material;

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    const animate = () => {
      if (controlsRef.current) controlsRef.current.update();

      if (currentPositionsRef.current && targetPositionsRef.current && 
          currentColorsRef.current && targetColorsRef.current && geometryRef.current) {
        
        const cPos = currentPositionsRef.current;
        const tPos = targetPositionsRef.current;
        const cCol = currentColorsRef.current;
        const tCol = targetColorsRef.current;
        
        const isOrbitPhase = phaseRef.current === 'orbit';
        const time = Date.now() * 0.001;

        if (isOrbitPhase) {
          if (particlesMatRef.current && particlesMatRef.current.opacity > 0) {
            particlesMatRef.current.opacity -= 0.01;
          }
          
          if (galaxyPointsRef.current && galaxyMatRef.current) {
            galaxyPointsRef.current.visible = true;
            if (galaxyMatRef.current.opacity < 1) {
              galaxyMatRef.current.opacity += 0.01;
            }
            galaxyPointsRef.current.rotation.y += 0.000005; // Even slower majestic rotation
            
            if (galaxyMatRef.current.userData.shader) {
              galaxyMatRef.current.userData.shader.uniforms.time.value = time;
            }
            
            // Update Comets
            if (cometRefs.current.length > 0) {
              const cycleTime = 12.0; // 12 seconds per shot (very slow and majestic)
              const travelTime = 8.0; // Takes 8 seconds to reach the edge
              
              cometRefs.current.forEach((comet, branchIndex) => {
                // Stagger the start time for each branch so they fire sequentially
                const timeOffset = branchIndex * (cycleTime / parameters.branches);
                const localTime = time + timeOffset;
                const tRaw = (localTime % cycleTime) / travelTime;
                
                const branchAngle = (branchIndex / parameters.branches) * Math.PI * 2;
                const positions = comet.geometry.attributes.position.array as Float32Array;
                
                for (let i = 0; i < 200; i++) {
                  let t = tRaw - (i * 0.003); // Very tight tail gap for a continuous line
                  
                  if (t < 0 || t > 1) {
                    positions[i * 3] = 9999;
                    positions[i * 3 + 1] = 9999;
                    positions[i * 3 + 2] = 9999;
                  } else {
                    // Ease out cubic (starts fast, slows down at edge)
                    const easeT = 1.0 - Math.pow(1.0 - t, 3.0);
                    const radius = parameters.blackHoleRadius + easeT * (parameters.radius - parameters.blackHoleRadius);
                    const spinAngle = (radius / parameters.radius) * Math.PI * 2 * parameters.spin;
                    
                    const x = Math.cos(branchAngle + spinAngle) * radius;
                    const z = Math.sin(branchAngle + spinAngle) * radius;
                    
                    positions[i * 3] = x;
                    positions[i * 3 + 1] = 0.5; // Slightly above the galaxy plane
                    positions[i * 3 + 2] = z;
                  }
                }
                comet.geometry.attributes.position.needsUpdate = true;
              });
            }
          }

          if (blackHoleMeshRef.current && cameraRef.current) {
            blackHoleMeshRef.current.visible = true;
            // Halo is attached to blackHoleMesh, so we rotate the blackHoleMesh to face the camera
            blackHoleMeshRef.current.quaternion.copy(cameraRef.current.quaternion);
            
            if (blackHoleMeshRef.current.material instanceof THREE.ShaderMaterial) {
              blackHoleMeshRef.current.material.uniforms.time.value = time;
            }
          }
        }

        for (let i = 0; i < cPos.length; i+=3) {
          let targetX = tPos[i];
          let targetY = tPos[i+1];
          let targetZ = tPos[i+2];

          // Add floating effect during countdown and text phases
          if (!isOrbitPhase) {
            const isBackground = tCol[i] < 0.2 && tCol[i+1] < 0.2 && tCol[i+2] < 0.2;
            if (isBackground) {
              // Background particles float around randomly
              targetX += Math.sin(time * 0.5 + i) * 3.0;
              targetY += Math.cos(time * 0.4 + i) * 3.0;
              targetZ += Math.sin(time * 0.6 + i) * 3.0;
            }
            // Text particles remain completely static for readability
          }

          cCol[i] += (tCol[i] - cCol[i]) * 0.1;
          cCol[i+1] += (tCol[i+1] - cCol[i+1]) * 0.1;
          cCol[i+2] += (tCol[i+2] - cCol[i+2]) * 0.1;

          cPos[i] += (targetX - cPos[i]) * 0.08;
          cPos[i+1] += (targetY - cPos[i+1]) * 0.08;
          cPos[i+2] += (targetZ - cPos[i+2]) * 0.08;
        }
        
        geometryRef.current.attributes.position.needsUpdate = true;
        geometryRef.current.attributes.color.needsUpdate = true;
      }

      if (composerRef.current) {
        composerRef.current.render();
      } else if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      updateCameraZ(w, h);
      rendererRef.current.setSize(w, h);
      if (composerRef.current) composerRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameRef.current);
      if (rendererRef.current && rendererRef.current.domElement.parentNode) {
        rendererRef.current.domElement.parentNode.removeChild(rendererRef.current.domElement);
      }
      geometry.dispose();
      material.dispose();
      controls.dispose();
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      className="absolute inset-0 z-30 bg-black overflow-hidden"
    >
      {/* Three.js Container */}
      <div 
        ref={containerRef} 
        className="absolute inset-0 cursor-grab active:cursor-grabbing" 
      />
      
      <AnimatePresence>
        {phase === 'orbit' && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 2, delay: 2 }}
            className="absolute bottom-8 md:bottom-12 left-0 right-0 mx-auto w-full px-4 flex flex-row items-center justify-center gap-3 md:gap-8 z-50 pointer-events-auto"
          >
            <div className="text-white/90 font-quicksand text-base sm:text-lg md:text-2xl font-bold tracking-wider drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] text-center md:text-left">
              i'll always love you
            </div>
            <div 
              className="bg-white p-1 pb-3 md:p-1.5 md:pb-4 shadow-[0_0_15px_rgba(255,255,255,0.15)] rotate-3 hover:rotate-0 transition-transform duration-500 cursor-pointer shrink-0"
              onClick={() => setIsPolaroidExpanded(true)}
            >
              <img 
                src="assets/naee.png" 
                alt="Us" 
                className="w-10 h-10 md:w-12 md:h-12 object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Polaroid Overlay */}
      <AnimatePresence>
        {isPolaroidExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsPolaroidExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.6, y: 50, rotate: -5 }}
              animate={{ scale: 0.75, y: 0, rotate: 0 }}
              exit={{ scale: 0.6, y: 50, rotate: 5 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="bg-white p-4 md:p-6 shadow-2xl relative max-w-[90vw] max-h-[90vh] flex flex-col items-center cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src="/public/naee.png" 
                alt="Us Expanded" 
                className="w-full h-auto max-h-[55vh] object-contain border border-gray-200"
              />
              <div className="w-full px-4 pt-3 pb-2 flex flex-col justify-between">
                {/* QUOTE (ambil space utama) */}
                <p className="font-handwriting text-gray-900 font-semibold text-center leading-tight text-[14px] md:text-[30px]">
                  Of all the ones that begged to stay, i'm still longing for you.<br/>
                  Cause maybe the greatest love of all, is who the eyes can't see.
                </p>
                {/* SIGNATURE (khusus sendiri, kecil, bawah kanan) */}
                <div className="w-full flex justify-end mt-0">
                  <p className="font-handwriting text-gray-800 text-[14px] md:text-[30px]">
                    - Zii
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
