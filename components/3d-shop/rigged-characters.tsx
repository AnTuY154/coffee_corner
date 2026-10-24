"use client";
import { Component, Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import * as THREE from "three";
import { START_POSITION, type ShopControls } from "./types";
import { PlayerAvatar, WalkingCustomer } from "./characters";

// Locally bundled Kenney Animated Characters: Protagonists (CC0), not remotely fetched at runtime.
// NEXT_PUBLIC_BASE_PATH is set by the repository's static GitHub Pages export script.
const prefix = process.env.NEXT_PUBLIC_BASE_PATH || "";
const PLAYER_URL = `${prefix}/models/player-skater.glb`;
const NPC_URL = `${prefix}/models/npc-sunny.glb`;

type RigProps = { url: string; moving: boolean; reducedMotion: boolean; height?: number };

function RigBody({ url, moving, reducedMotion, height = 2.25 }: RigProps) {
  const gltf = useGLTF(url, false, false);
  // Crucial: SkinnedMesh must be cloned with SkeletonUtils, not Object3D.clone.
  const rig = useMemo(() => {
    const copy = clone(gltf.scene);
    copy.traverse(obj => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.frustumCulled = false; // animated bones may leave the static bind-pose bounds
      }
    });
    return copy;
  }, [gltf.scene]);
  const fit = useMemo(() => {
    rig.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(rig, true);
    const rigHeight = Math.max(.001, box.max.y - box.min.y);
    const scale = height / rigHeight;
    return { scale, lift: -box.min.y * scale };
  }, [rig, height]);
  const { actions } = useAnimations(gltf.animations, rig);
  const current = useRef<"Idle" | "Run" | null>(null);
  useEffect(() => {
    const target = reducedMotion || !moving ? "Idle" : "Run";
    const next = actions[target];
    if (!next || current.current === target) return;
    const previous = current.current ? actions[current.current] : undefined;
    previous?.fadeOut(.18);
    next.reset().setEffectiveWeight(1).fadeIn(.18).play();
    current.current = target;
  }, [actions, moving, reducedMotion]);
  useEffect(() => () => { for (const action of Object.values(actions)) action?.stop(); }, [actions]);
  return <group position={[0, fit.lift, 0]} scale={fit.scale}><primitive object={rig}/></group>;
}

/** Native gameplay continues even if a model URL, WebGL decoder, or GPU fails. */
class CharacterBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError(): { failed: boolean } { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

/** Same movement/controller state as the former procedural avatar, now a skinned GLB. */
export function RiggedPlayer({ controls, reducedMotion }: { controls: RefObject<ShopControls>; reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  // Moving-state transitions alone trigger React renders, not every animation frame.
  const modelMoving = useRef(false);
  // Animation needs React prop updates only at movement-state transitions.
  const [walking, setWalking] = useState(false);
  useFrame((_, delta) => {
    const c = controls.current;
    if (!group.current || !c) return;
    group.current.position.set(c.x, 0, c.z);
    group.current.rotation.y = Math.PI + c.yaw;
    const moving = !c.locked && (c.autoWalk || c.keys.size > 0);
    if (moving !== modelMoving.current) {
      modelMoving.current = moving;
      setWalking(moving);
    }
  });
  return <CharacterBoundary fallback={<PlayerAvatar controls={controls} reducedMotion={reducedMotion}/>}>
    <Suspense fallback={<PlayerAvatar controls={controls} reducedMotion={reducedMotion}/>}>
      <group ref={group} position={[START_POSITION.x, 0, START_POSITION.z]}>
        <RigBody url={PLAYER_URL} moving={walking} reducedMotion={reducedMotion}/>
      </group>
    </Suspense>
  </CharacterBoundary>;
}

/** Sunny walks a loop without contaminating the player's skeleton or animation mixer. */
export function RiggedCustomer({ reducedMotion, variant = 0 }: { reducedMotion: boolean; variant?: number }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = (reducedMotion ? 0 : clock.elapsedTime * .42) + variant * Math.PI;
    const dx = .65 * Math.cos(t);
    const dz = -1.3 * Math.sin(t);
    group.current.position.set((variant ? 3.95 : -4) + Math.sin(t) * .65, 0, 3.6 + Math.cos(t) * 1.3);
    group.current.rotation.y = Math.atan2(dx, dz);
  });
  return <CharacterBoundary fallback={<WalkingCustomer reducedMotion={reducedMotion} variant={variant}/>}>
    <Suspense fallback={<WalkingCustomer reducedMotion={reducedMotion} variant={variant}/>}>
      <group ref={group} position={[variant ? 4 : -4, 0, 4]}>
        <RigBody url={NPC_URL} moving={!reducedMotion} reducedMotion={reducedMotion} height={2.1}/>
      </group>
    </Suspense>
  </CharacterBoundary>;
}
