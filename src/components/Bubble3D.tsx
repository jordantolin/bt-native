import React, { useEffect, useRef } from 'react';
import { Mesh } from 'three';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';

import type { BubbleData } from './Bubble';

export type Bubble3DProps = {
  data: BubbleData;
  onPress: (id: string) => void;
};

export default function Bubble3D({ data, onPress }: Bubble3DProps) {
  const meshRef = useRef<Mesh>(null!);
  const start = useRef<number>(0);
  const baseAngle = useRef(Math.random() * Math.PI * 2);
  const speed = useRef(0.2 + Math.random() * 0.1);

  const scaleFactor = 1 + Math.min(data.reflectionCount, 20) / 10;
  const color = `hsl(48, 100%, ${80 - data.reflectionCount * 2}%)`;

  useEffect(() => {
    start.current = performance.now() / 1000;
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const elapsed = clock.getElapsedTime() - start.current;
    const t = clock.getElapsedTime() * speed.current;
    const x = data.orbitRadius * Math.cos(baseAngle.current + t);
    const z = data.orbitRadius * Math.sin(baseAngle.current + t);
    const y = Math.sin(t * 0.5) * 5;
    meshRef.current.position.set(x, y, z);

    const appear = Math.min(1, elapsed / 0.6);
    const bounce = elapsed < 0.6 ? 1 + 0.2 * Math.sin((appear * Math.PI)) : 1;
    const s = scaleFactor * appear * bounce;
    meshRef.current.scale.set(s, s, s);
  });

  return (
    <mesh ref={meshRef} onClick={() => onPress(data.id)}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
      <Text
        color="#fff"
        anchorX="center"
        anchorY="middle"
        fontSize={0.5}
        position={[0, scaleFactor + 0.5, 0]}
      >
        {data.label}
      </Text>
    </mesh>
  );
}

