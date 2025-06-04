// @ts-nocheck
/// <reference types="@react-three/fiber" />
import React from 'react';
import { Canvas } from '@react-three/fiber/native';
import { OrbitControls } from '@react-three/drei/native';
import Bubble, { BubbleProps } from './Bubble';

export type ThreeDWorldProps = {
  bubbles: BubbleProps[];
};

export default function ThreeDWorld({ bubbles }: ThreeDWorldProps) {
  return (
    <Canvas style={{ flex: 1 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      {bubbles.map((b) => (
        <Bubble key={b.id} {...b} />
      ))}
      <OrbitControls makeDefault enablePan enableZoom enableRotate />
    </Canvas>
  );
}
