"use client";

import { useEffect, useRef } from "react";
import { ActorsDirector, ARTBOARD, type Animal } from "./actors-director";
import { deformVertices, type RigKind } from "./deform-rig";

export type PetPositions = {
  dog: { x: number; y: number };
  cat: { x: number; y: number };
  clerk: { x: number; y: number };
};
export type VisitRequest = { id: number; target: Animal } | null;
type Props = {
  artBase: string;
  visible: boolean;
  request?: VisitRequest;
  onReady: () => void;
  onMove: (positions: PetPositions) => void;
  onBark?: () => void;
};

/** Three meshes, one Pixi clock, three immutable canonical source textures. */
export function PetsWorld({ artBase, visible, request, onReady, onMove, onBark }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const directorRef = useRef<ActorsDirector | null>(null);
  const pending = useRef<Animal | null>(null);
  const seen = useRef(0);
  const onMoveRef = useRef(onMove);
  const onReadyRef = useRef(onReady);
  const onBarkRef = useRef(onBark);
  onBarkRef.current = onBark;
  onMoveRef.current = onMove;
  onReadyRef.current = onReady;

  useEffect(() => {
    if (!request || request.id === seen.current) return;
    seen.current = request.id;
    if (directorRef.current) directorRef.current.request(request.target);
    else pending.current = request.target;
  }, [request]);

  useEffect(() => {
    let disposed = false;
    let shutdown: (() => void) | undefined;
    const mount = host.current;
    if (!mount) return;
    async function start() {
      const { Application, Assets, Container, MeshPlane, Graphics, Text } = await import("pixi.js");
      if (!mount || disposed) return;
      const app = new Application();
      try {
        await app.init({
          resizeTo: mount, backgroundAlpha: 0, antialias: true,
          autoDensity: true, resolution: Math.min(window.devicePixelRatio || 1, 2),
          preference: "webgl",
        });
      } catch (error) {
        console.warn("Vườn É: Pixi renderer could not start", error);
        return;
      }
      if (disposed) { app.destroy(true); return; }
      mount.appendChild(app.canvas);
      const world = new Container();
      world.sortableChildren = true;
      app.stage.addChild(world);
      const onResize = () => world.scale.set(
        mount.clientWidth / ARTBOARD.width,
        mount.clientHeight / ARTBOARD.height,
      );
      const resizeObserver = new ResizeObserver(onResize);
      resizeObserver.observe(mount);
      onResize();
      const onVisibility = () => document.hidden ? app.ticker.stop() : app.ticker.start();
      document.addEventListener("visibilitychange", onVisibility);
      let removeTick: (() => void) | undefined;
      shutdown = () => {
        removeTick?.();
        document.removeEventListener("visibilitychange", onVisibility);
        resizeObserver.disconnect();
        directorRef.current = null;
        app.destroy(true, { children: true, texture: false, textureSource: false });
      };
      try {
        const [employeeTexture, dogTexture, catTexture] = await Promise.all([
          Assets.load(`${artBase}/canonical/employee.webp`),
          Assets.load(`${artBase}/canonical/dog.webp`),
          Assets.load(`${artBase}/canonical/cat.webp`),
        ]);
        if (disposed) return;

        function makeActor(texture: typeof dogTexture, kind: RigKind, width: number, height: number) {
          const holder = new Container();
          const shadow = new Graphics().ellipse(0, -3, width * .35, 9)
            .fill({ color: 0x423b2a, alpha: .2 });
          const mesh = new MeshPlane({ texture, verticesX: 17, verticesY: 17 });
          const attr = mesh.geometry.getAttribute("aPosition");
          const original = new Float32Array(attr.buffer.data);
          const vertices = attr.buffer.data as Float32Array;
          mesh.scale.set(width / texture.width, height / texture.height);
          mesh.position.set(-width / 2, -height * .96);
          // The position buffer is deformed around its unchanged source UVs.
          // Mesh deformation preserves original faces, patterns and textures.
          const heart = new Text({ text: "♡", style: { fill: 0xe57d8d, fontSize: 34, fontWeight: "bold" } });
          heart.anchor.set(.5);
          heart.position.set(12, -height - 13);
          heart.alpha = 0;
          const actionLabel = new Text({ text: kind === "dog" ? "Gâu!" : "Zzz", style: {
            fill: kind === "dog" ? 0x5c7845 : 0x71908c,
            fontSize: 25, fontFamily: "sans-serif", fontWeight: "bold",
            stroke: { color: 0xfff7e5, width: 4 },
          } });
          actionLabel.anchor.set(.5);
          actionLabel.position.set(4, -height - 24);
          actionLabel.alpha = 0;
          holder.addChild(shadow, mesh, heart, actionLabel);
          world.addChild(holder);
          return { holder, shadow, mesh, buffer: attr.buffer, vertices, original,
            width, height, heart, actionLabel, kind, texture };
        }

        const employee = makeActor(employeeTexture, "employee", 155, 208);
        const dog = makeActor(dogTexture, "dog", 126, 126);
        const cat = makeActor(catTexture, "cat", 116, 116);

        // In the service window the counter obscures her lower body.
        // Remove the clipping as soon as she reaches the exit on the right.
        const counterMask = new Graphics().rect(0, 0, ARTBOARD.width, 650).fill(0xffffff);
        world.addChild(counterMask);

        const director = new ActorsDirector();
        directorRef.current = director;
        if (pending.current) { director.request(pending.current); pending.current = null; }
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
        let lastNotification = 0;
        let stepTime = 0;
        let previousDogMood = "idle";
        const ticker = (tick: { deltaMS: number }) => {
          const dt = Math.min(tick.deltaMS / 1000, .05);
          stepTime += dt;
          const pose = director.step(dt, reduced.matches);
          for (const p of [dog, cat] as const) {
            const state = pose[p.kind as Animal];
            // Explicit world surfaces: puppy paws on the courtyard tiles,
            // cat paws ON the wooden outdoor tabletop (not on the ground).
            const dogJump = p.kind === "dog" && state.mood === "jump";
            const height = dogJump ? Math.sin(state.actionProgress * Math.PI) * 34 : 0;
            p.holder.position.set(state.x, state.y - height);
            p.holder.scale.x = state.facing;
            p.holder.zIndex = state.y;
            p.shadow.y = height;
            p.shadow.scale.x = dogJump ? 1 - height / 110 : 1;
            p.shadow.alpha = dogJump ? .16 : 1;
            p.heart.alpha = state.mood === "happy" ? .7 + Math.sin(stepTime * 7) * .25 : 0;
            p.actionLabel.alpha = state.mood === "bark" || state.mood === "nap"
              ? state.mood === "bark" ? .8 + Math.sin(stepTime * 18) * .2 : .72 : 0;
            p.actionLabel.y = -p.height - 24 - (dogJump ? 20 : Math.abs(Math.sin(stepTime * 2)) * 4);
            deformVertices(p.original, p.vertices, p.texture.width, p.texture.height,
              { gait: state.gait, speed: state.speed, seconds: pose.seconds,
                motion: state.mood, actionProgress: state.actionProgress }, p.kind);
            p.buffer.update();
          }
          if (pose.dog.mood === "bark" && previousDogMood !== "bark") onBarkRef.current?.();
          previousDogMood = pose.dog.mood;
          const person = pose.worker;
          employee.holder.position.set(person.x, person.y);
          // Never mirror the employee's apron lettering or reassign mesh scale.
          employee.holder.scale.set(person.scale);
          employee.holder.zIndex = person.y + .1;
          employee.holder.mask = person.behindCounter ? counterMask : null;
          employee.holder.rotation = person.action === "run" ? Math.sin(pose.seconds * 15) * .023 :
            person.action === "pet" ? -.04 + Math.sin(pose.seconds * 7) * .015 : 0;
          deformVertices(employee.original, employee.vertices, employee.texture.width,
            employee.texture.height,
            { gait: pose.seconds * 13, speed: person.action === "run" ? 65 : 0,
              seconds: pose.seconds, motion: person.action }, "employee");
          employee.buffer.update();
          lastNotification += dt;
          if (lastNotification >= .13) {
            lastNotification = 0;
            onMoveRef.current({
              dog: { x: pose.dog.x, y: pose.dog.y - 60 },
              cat: { x: pose.cat.x, y: pose.cat.y - 53 },
              clerk: { x: person.x, y: person.y - (person.behindCounter ? 128 : 122) },
            });
          }
        };
        app.ticker.add(ticker);
        removeTick = () => app.ticker.remove(ticker);
        onReadyRef.current();
      } catch (error) {
        console.warn("Vườn É: canonical actor textures could not load", error);
      }
    }
    void start();
    return () => { disposed = true; shutdown?.(); };
  }, [artBase]);

  return <div className="ve2d-pixi-pets" ref={host} aria-hidden="true"
    data-engine="pixijs-choreographed-actors" data-visible={visible} />;
}