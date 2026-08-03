import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Floating Nodes Component
const FloatingNodes = () => {
  const group = useRef();
  
  // Create 30 random positions for our medical "nodes" (cells/data points)
  const nodes = useMemo(() => {
    return new Array(30).fill(0).map(() => ({
      position: [
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 10 - 5
      ],
      scale: Math.random() * 0.4 + 0.1,
      color: Math.random() > 0.5 ? '#3b82f6' : '#06b6d4', // Blue and Cyan
      speed: Math.random() * 0.2 + 0.1
    }));
  }, []);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y += 0.001;
      group.current.rotation.x += 0.0005;
    }
  });

  return (
    <group ref={group}>
      {nodes.map((node, i) => (
        <Float 
          key={i} 
          speed={node.speed * 5} 
          rotationIntensity={0.5} 
          floatIntensity={1}
          position={node.position}
        >
          <Sphere args={[node.scale, 32, 32]}>
            <meshStandardMaterial 
              color={node.color}
              emissive={node.color}
              emissiveIntensity={0.5}
              roughness={0.2}
              metalness={0.8}
            />
          </Sphere>
        </Float>
      ))}
    </group>
  );
};

// Abstract DNA Strand Component
const DNAStrand = () => {
  const group = useRef();
  const numPairs = 40;
  
  useFrame(() => {
    if (group.current) {
      group.current.rotation.y += 0.002;
      group.current.position.y = Math.sin(Date.now() / 2000) * 0.5;
    }
  });

  return (
    <group ref={group} position={[0, -10, -10]} rotation={[0.2, 0, 0.2]}>
      {new Array(numPairs).fill(0).map((_, i) => {
        const y = i * 0.5;
        const angle = i * 0.4;
        const radius = 2;
        const x1 = Math.cos(angle) * radius;
        const z1 = Math.sin(angle) * radius;
        const x2 = Math.cos(angle + Math.PI) * radius;
        const z2 = Math.sin(angle + Math.PI) * radius;

        return (
          <group key={i} position={[0, y, 0]}>
            <Sphere position={[x1, 0, z1]} args={[0.2, 16, 16]}>
              <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.8} />
            </Sphere>
            <Sphere position={[x2, 0, z2]} args={[0.2, 16, 16]}>
              <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.8} />
            </Sphere>
            {/* Connecting line */}
            <mesh position={[0, 0, 0]} rotation={[0, -angle, 0]}>
              <cylinderGeometry args={[0.05, 0.05, radius * 2, 8]} />
              <meshStandardMaterial color="#94a3b8" transparent opacity={0.3} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

export default function Medical3DBackground() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0ea5e9" />
        
        {/* Subtle Background Particles */}
        <Stars radius={50} depth={20} count={1000} factor={4} saturation={0} fade speed={1} />
        
        <FloatingNodes />
        <DNAStrand />
        
        {/* Optional fog for depth */}
        <fog attach="fog" args={['#ffffff', 10, 30]} />
      </Canvas>
    </div>
  );
}
