// @ts-nocheck
/// <reference types="@react-three/fiber" />
import React, { useRef } from 'react';
import { Mesh } from 'three';
import { useFrame } from '@react-three/fiber/native';
import { Text } from '@react-three/drei/native';
import '@react-three/fiber';

export type BubbleProps = {
  id: string;
  name: string;
  reflectionCount: number;
  onPress: (id: string) => void;
};

function colorForCount(count: number) {
  const start = { r: 255, g: 249, b: 237 };
  const end = { r: 255, g: 214, b: 0 };
  const t = Math.min(count / 5, 1);
  const r = start.r + (end.r - start.r) * t;
  const g = start.g + (end.g - start.g) * t;
  const b = start.b + (end.b - start.b) * t;
  return `rgb(${r}, ${g}, ${b})`;
}

export default function Bubble({ id, name, reflectionCount, onPress }: BubbleProps) {
  const mesh = useRef<Mesh>(null!);
  const angle = useRef(Math.random() * Math.PI * 2);
  const speed = useRef(0.4 + Math.random() * 0.2);
  const radius = useRef(3 + Math.random() * 3);

  useFrame((_, delta) => {
    angle.current += speed.current * delta;
    mesh.current.position.x = radius.current * Math.cos(angle.current);
    mesh.current.position.z = radius.current * Math.sin(angle.current);
  });

  const size = 0.5 + reflectionCount * 0.1;
  const color = colorForCount(reflectionCount);

  return (
    <mesh
      ref={mesh}
      onClick={() => onPress(id)}
      scale={[size, size, size]}
      castShadow
    >
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.3}
        color="#ffe46b"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>
    </mesh>
  );
}
