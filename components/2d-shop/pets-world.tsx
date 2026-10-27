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
      const onResize = () => {
        // Resize the renderer and world in the SAME ResizeObserver callback.
        // With only the old scale update, Pixi could temporarily keep its
        // previous 1536px canvas size after the stage grew to 1920px, so
        // sprites and pointer hotspots appeared on different screen pixels.
        const width = mount.clientWidth, height = mount.clientHeight;
        if (width <= 0 || height <= 0) return;
        app.renderer.resize(width, height);
        world.scale.set(width / ARTBOARD.width, height / ARTBOARD.height);
      };
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
        const dog = makeActor(dogTexture, "dog", 118, 118);
        // The cat occupies the clear left section of the wooden tabletop;
        // the flower vase and right-hand chair are not a walkable surface.
        const cat = makeActor(catTexture, "cat", 86, 86);

        // Pixi v8: a Graphics object ceases to be an active stencil mask when
        // its last masked actor sets `.mask = null`. At that moment it becomes
        // VISIBLE as a giant opaque rectangle. This was the white 1672x650
        // panel that covered the storefront every time the clerk left the counter.
        //
        // Keep ONE stencil mask assigned throughout the actor's lifetime;
        // only change its geometry between the counter and full artboard.
        // Pixi never paints an active mask into the color buffer.
        const counterMask = new Graphics().rect(0, 0, ARTBOARD.width, 650).fill(0xffffff);
        employee.holder.mask = counterMask;
        world.addChild(counterMask);
        let maskHeight = 650;

        const director = new ActorsDirector();
        directorRef.current = director;
        if (pending.current) { director.request(pending.current); pending.current = null; }
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
        let lastNotification = 0;
        let stepTime = 0;
        let previousDogMood = "idle";
        // An independent scene-review job can advance the ACTUAL director
        // and render its output without relying on a CI virtual GPU's FPS.
        // Only enabled explicitly via ?scene-review=1.
        const reviewMode = new URLSearchParams(window.location.search).has("scene-review");
        const ticker = (tick: { deltaMS: number }) => {
          // Catch up in <=50ms physics substeps after a slow WebGL frame.
          // The former hard 50ms frame cap caused the whole simulation to run
          // in slow motion at low FPS (and made interaction time out in CI).
          let remaining = Math.min(Math.max(tick.deltaMS / 1000, 0), .2);
          stepTime += remaining;
          let pose = director.step(Math.min(remaining, .05), reduced.matches);
          remaining = Math.max(0, remaining - .05);
          for (let i = 0; i < 3 && remaining > .001; i++) {
            const next = Math.min(remaining, .05);
            pose = director.step(next, reduced.matches);
            remaining -= next;
          }
          if (reviewMode && host.current?.dataset.reviewAdvanceTo) {
            const goal = host.current.dataset.reviewAdvanceTo;
            delete host.current.dataset.reviewAdvanceTo;
            const startedInVisit = pose.phase !== "idle";
            // Deterministic visual QA: render exactly the requested action
            // transition, not 800 separate frames on a software GPU.
            for (let i = 0; i < 700; i++) {
              pose = director.step(.05, reduced.matches);
              if (goal === "off-counter" && !pose.worker.behindCounter) break;
              if (goal === "petting" && pose.phase === "petting") break;
              if (goal === "home" && startedInVisit && pose.phase === "idle") break;
            }
          }
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
          // From the patio the clerk reaches the cat BEHIND the tabletop,
          // never stepping onto the chairs. Keep the upper body visible, but
          // let the actual painted tabletop occlude the lower legs as in life.
          const besideCatTable = pose.target === "cat" &&
            person.x >= 1175 && person.y >= 870;
          const nextMaskHeight = person.behindCounter ? 650 :
            besideCatTable ? 852 : ARTBOARD.height;
          if (nextMaskHeight !== maskHeight) {
            counterMask.clear().rect(0, 0, ARTBOARD.width, nextMaskHeight).fill(0xffffff);
            maskHeight = nextMaskHeight;
          }
          employee.holder.rotation = person.action === "run" ? Math.sin(pose.seconds * 15) * .023 :
            person.action === "pet" ? -.04 + Math.sin(pose.seconds * 7) * .015 : 0;
          deformVertices(employee.original, employee.vertices, employee.texture.width,
            employee.texture.height,
            { gait: pose.seconds * 13, speed: person.action === "run" ? 65 : 0,
              seconds: pose.seconds, motion: person.action }, "employee");
          employee.buffer.update();
          lastNotification += Math.min(Math.max(tick.deltaMS / 1000, 0), .2);
          if (lastNotification >= .13) {
            lastNotification = 0;
            // Public read-only scene diagnostics for independent browser QA.
            // They contain only coordinates and action labels, no user data.
            if (host.current) {
              host.current.dataset.phase = pose.phase;
              host.current.dataset.employeeX = String(Math.round(person.x));
              host.current.dataset.employeeY = String(Math.round(person.y));
              host.current.dataset.employeeAction = person.action;
              host.current.dataset.counterMaskHeight = String(maskHeight);
              host.current.dataset.dogX = String(Math.round(pose.dog.x));
              host.current.dataset.dogY = String(Math.round(pose.dog.y));
              host.current.dataset.dogMood = pose.dog.mood;
              host.current.dataset.catX = String(Math.round(pose.cat.x));
              host.current.dataset.catY = String(Math.round(pose.cat.y));
              host.current.dataset.catMood = pose.cat.mood;
            }
            onMoveRef.current({
              // Hotspot centers match the VISIBLE rendered sprites in the
              // same pixel artboard, not their feet or an arbitrary offset.
              dog: { x: pose.dog.x, y: pose.dog.y - 56 },
              cat: { x: pose.cat.x, y: pose.cat.y - 42 },
              clerk: { x: person.x, y: person.y - (person.behindCounter ? 104 : 92) },
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