import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Pressable, Text, Animated, Dimensions } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import OrbitControlsView from 'expo-three-orbit-controls';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import { RootStackParamList } from '../navigation/RootNavigator';
import { useAuth } from '../context/AuthContext';
import CreateBubbleModal, { NewBubble } from '../components/CreateBubbleModal';
import type { BubbleData } from '../components/Bubble';

const BASE_ORBIT = 100;
const ORBIT_STEP = 80;

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Bubbles'>;

type LabelPosition = { x: number; y: number; visible: boolean };

export default function BubblesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { supabase } = useAuth();

  const glRef = useRef<any>(null);
  const rendererRef = useRef<Renderer>();
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const bubbleMeshes = useRef<Record<string, THREE.Mesh>>( {} );
  const labelPositions = useRef<Record<string, LabelPosition>>({});
  const [cameraState, setCameraState] = useState<THREE.PerspectiveCamera | null>(null);

  const [bubbles, setBubbles] = useState<BubbleData[]>([]);
  const [showModal, setShowModal] = useState(false);
  const toastAnim = useRef(new Animated.Value(0)).current;
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    Animated.sequence([
      Animated.timing(toastAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setToast(''));
  };

  useEffect(() => {
    const loadBubbles = async () => {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('bubbles')
        .select('id, name, reflectionCount, created_at')
        .gte('created_at', since)
        .order('created_at', { ascending: true });
      if (error) {
        console.error('Errore caricamento bolle:', error);
        return;
      }
      const withOrbit = (data ?? []).map((item, idx) => ({
        id: item.id as string,
        label: (item as any).name ?? (item as any).label ?? item.id,
        reflectionCount: (item as any).reflectionCount ?? 0,
        orbitRadius: BASE_ORBIT + idx * ORBIT_STEP + Math.random() * ORBIT_STEP * 0.4,
      }));
      setBubbles(withOrbit);
    };

    loadBubbles();

    const channel = supabase
      .channel('bubbles')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bubbles' },
        (payload) => {
          const item: any = payload.new;
          const since = Date.now() - 24 * 60 * 60 * 1000;
          if (new Date(item.created_at).getTime() < since) return;
          setBubbles((prev) => {
            if (prev.some((b) => b.id === item.id)) return prev;
            return [
              ...prev,
              {
                id: item.id as string,
                label: item.label ?? item.name ?? item.id,
                reflectionCount: item.reflectionCount ?? 0,
                orbitRadius: BASE_ORBIT + prev.length * ORBIT_STEP + Math.random() * ORBIT_STEP * 0.4,
              },
            ];
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    // create meshes for new bubbles
    if (!sceneRef.current) return;
    for (const bubble of bubbles) {
      if (bubbleMeshes.current[bubble.id]) continue;
      const geometry = new THREE.SphereGeometry(1, 32, 32);
      const scaleFactor = 1 + Math.min(bubble.reflectionCount, 20) / 10;
      const color = new THREE.Color(`hsl(48, 100%, ${80 - bubble.reflectionCount * 2}%)`);
      const material = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.2 });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);
      sceneRef.current.add(mesh);
      bubbleMeshes.current[bubble.id] = mesh;
      labelPositions.current[bubble.id] = { x: 0, y: 0, visible: false };
      (mesh as any).baseAngle = Math.random() * Math.PI * 2;
      (mesh as any).speed = 0.2 + Math.random() * 0.1;
      (mesh as any).orbitRadius = bubble.orbitRadius;
      (mesh as any).id = bubble.id;
    }
  }, [bubbles]);

  const animate = () => {
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const gl = glRef.current;
    if (!renderer || !scene || !camera || !gl) return;

    const time = Date.now() / 1000;
    for (const id in bubbleMeshes.current) {
      const mesh: any = bubbleMeshes.current[id];
      const t = time * mesh.speed;
      const x = mesh.orbitRadius * Math.cos(mesh.baseAngle + t);
      const z = mesh.orbitRadius * Math.sin(mesh.baseAngle + t);
      const y = Math.sin(t * 0.5) * 5;
      mesh.position.set(x, y, z);
      const vector = mesh.position.clone();
      vector.project(camera);
      const { width, height } = Dimensions.get('window');
      const px = (vector.x * 0.5 + 0.5) * width;
      const py = (-vector.y * 0.5 + 0.5) * height;
      labelPositions.current[id] = { x: px, y: py, visible: vector.z < 1 };
    }

    renderer.render(scene, camera);
    gl.endFrameEXP();
    requestAnimationFrame(animate);
  };

  const onContextCreate = async (gl: any) => {
    glRef.current = gl;
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
    const renderer = new Renderer({ gl });
    renderer.setSize(width, height);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#111');
    scene.fog = new THREE.Fog('#111', 100, 400);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 200;
    cameraRef.current = camera;
    setCameraState(camera);

    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const point = new THREE.PointLight(0xffffff, 1);
    scene.add(point);

    animate();
  };

  return (
    <View style={styles.container}>
      {cameraState ? (
        <OrbitControlsView style={{ flex: 1 }} camera={cameraState}>
          <GLView style={{ flex: 1 }} onContextCreate={onContextCreate} />
        </OrbitControlsView>
      ) : (
        <GLView style={{ flex: 1 }} onContextCreate={onContextCreate} />
      )}

      {Object.entries(labelPositions.current).map(([id, pos]) => (
        <Pressable
          key={id}
          style={[
            styles.label,
            { transform: [{ translateX: pos.x }, { translateY: pos.y }] },
          ]}
          onPress={() => navigation.navigate('Chat', { bubbleId: id })}
        >
          <Text style={styles.labelText}>{bubbles.find((b) => b.id === id)?.label}</Text>
        </Pressable>
      ))}

      <Pressable style={styles.addButton} onPress={() => setShowModal(true)}>
        <Text style={styles.addText}>+</Text>
      </Pressable>

      <CreateBubbleModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onCreated={(b: NewBubble) => {
          setBubbles((prev) => {
            if (prev.some((x) => x.id === b.id)) return prev;
            return [
              ...prev,
              {
                id: b.id,
                label: b.name,
                reflectionCount: b.reflectionCount ?? 0,
                orbitRadius: BASE_ORBIT + prev.length * ORBIT_STEP + Math.random() * ORBIT_STEP * 0.4,
              },
            ];
          });
          showToast('Bolla creata!');
        }}
      />

      {toast ? (
        <Animated.View
          style={[
            styles.toast,
            {
              opacity: toastAnim,
              transform: [
                {
                  translateY: toastAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.toastText}>{toast}</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  addButton: {
    position: 'absolute',
    bottom: 40,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffe46b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    color: '#111',
    fontSize: 32,
    lineHeight: 32,
  },
  label: {
    position: 'absolute',
  },
  labelText: {
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    fontSize: 12,
  },
  toast: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  toastText: {
    backgroundColor: '#333',
    color: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
});
