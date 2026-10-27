"use client";

import { useEffect, useRef } from "react";
import { ActorsDirector, type Animal } from "./actors-director";

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
};

const FRAME_WIDTH = 240;
const FRAME_HEIGHT = 160;
const FRAMES = 8;
const SCENE_WIDTH = 1536;
const SCENE_HEIGHT = 1024;

/**
 * A single PixiJS v8 clock renders all actors on the identical, uncropped
 * 1536×1024 artboard. The clerk is a separate three-part illustrated 2D
 * puppet with independently moving legs and hand (NOT a CSS-sliding photo).
 * Both pets animate real eight-frame walk cycles and react to the employee
 * during the same state-machine transition.
 */
export function PetsWorld({ artBase, visible, request, onReady, onMove }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const directorRef = useRef<ActorsDirector | null>(null);
  const pending = useRef<Animal | null>(null);
  const seenRequest = useRef(0);
  const onReadyRef = useRef(onReady);
  const onMoveRef = useRef(onMove);
  onReadyRef.current = onReady;
  onMoveRef.current = onMove;

  useEffect(() => {
    if (!request || request.id === seenRequest.current) return;
    seenRequest.current = request.id;
    if (directorRef.current) directorRef.current.request(request.target);
    else pending.current = request.target;
  }, [request]);

  useEffect(() => {
    let disposed = false;
    let shutdown: (() => void) | undefined;
    const mount = host.current;
    if (!mount) return;
    async function start() {
      const {
        Application, Assets, AnimatedSprite, Container, Sprite,
        Graphics, Texture, Rectangle, Text,
      } = await import("pixi.js");
      if (!mount || disposed) return;
      const app = new Application();
      try {
        await app.init({
          resizeTo: mount,
          backgroundAlpha: 0,
          antialias: true,
          autoDensity: true,
          resolution: Math.min(window.devicePixelRatio || 1, 2),
          preference: "webgl",
        });
      } catch (error) {
        console.warn("Vườn É: 2D renderer unavailable", error);
        return;
      }
      if (disposed) { app.destroy(true); return; }
      mount.appendChild(app.canvas);
      const world = new Container();
      world.sortableChildren = true;
      app.stage.addChild(world);
      const rescale = () => world.scale.set(
        mount.clientWidth / SCENE_WIDTH, mount.clientHeight / SCENE_HEIGHT
      );
      const resizeObserver = new ResizeObserver(rescale);
      resizeObserver.observe(mount);
      rescale();
      const onVisibility = () => {
        if (document.hidden) app.ticker.stop();
        else app.ticker.start();
      };
      document.addEventListener("visibilitychange", onVisibility);
      let removeTick: (() => void) | undefined;
      shutdown = () => {
        removeTick?.();
        document.removeEventListener("visibilitychange", onVisibility);
        resizeObserver.disconnect();
        directorRef.current = null;
        app.destroy(true, { children: true, texture: false, textureSource: false });
      };

      const loadWalkFrames = async (path: string) => {
        const sheet = await Assets.load(path) as InstanceType<typeof Texture>;
        return Array.from({ length: FRAMES }, (_, i) =>
          new Texture({
            source: sheet.source,
            frame: new Rectangle(i * FRAME_WIDTH, 0, FRAME_WIDTH, FRAME_HEIGHT),
          })
        );
      };
      try {
        const [dogFrames, catFrames, clerkBody, clerkLeg, clerkArm] = await Promise.all([
          loadWalkFrames(`${artBase}/pets/dog-walk.png`),
          loadWalkFrames(`${artBase}/pets/cat-walk.png`),
          Assets.load(`${artBase}/actors/clerk-body.svg`) as Promise<InstanceType<typeof Texture>>,
          Assets.load(`${artBase}/actors/clerk-leg.svg`) as Promise<InstanceType<typeof Texture>>,
          Assets.load(`${artBase}/actors/clerk-arm.svg`) as Promise<InstanceType<typeof Texture>>,
        ]);
        if (disposed) return;

        const buildPet = (type: Animal, frames: InstanceType<typeof Texture>[], scale: number) => {
          const holder = new Container();
          const shadow = new Graphics().ellipse(0, -5, 78 * scale, 9 * scale)
            .fill({ color: 0x423b2a, alpha: .18 });
          const sprite = new AnimatedSprite({
            textures: frames, loop: true, animationSpeed: .15, autoPlay: false,
          });
          sprite.anchor.set(.5, .87);
          sprite.gotoAndStop(0);
          const heart = new Text({
            text: "♡", style: { fill: "#f18493", fontSize: 40, fontWeight: "bold" },
          });
          heart.anchor.set(.5, .5);
          heart.position.set(8, -145 * scale);
          heart.alpha = 0;
          holder.addChild(shadow, sprite, heart);
          world.addChild(holder);
          return { holder, sprite, heart, scale, type };
        };
        const dog = buildPet("dog", dogFrames, .90);
        const cat = buildPet("cat", catFrames, .82);

        // Independent, transparent limb textures. No scenery pixels inside.
        const clerk = new Container();
        const rearLeg = new Sprite(clerkLeg), frontLeg = new Sprite(clerkLeg);
        for (const leg of [rearLeg, frontLeg]) leg.anchor.set(.5, .12);
        rearLeg.position.set(-23, -79);
        frontLeg.position.set(22, -79);
        const body = new Sprite(clerkBody);
        body.anchor.set(.5, 1);
        const waveArm = new Sprite(clerkArm);
        waveArm.anchor.set(.21, .78);
        waveArm.position.set(61, -109);
        clerk.addChild(rearLeg, frontLeg, body, waveArm);
        world.addChild(clerk);

        // At the counter the lower body is concealed by the wooden counter.
        // The mask is released only after the employee walks out at the side.
        const behindCounterMask = new Graphics()
          .rect(0, 0, SCENE_WIDTH, 637).fill({ color: 0xffffff });
        world.addChild(behindCounterMask);

        const director = new ActorsDirector();
        directorRef.current = director;
        if (pending.current) {
          director.request(pending.current);
          pending.current = null;
        }
        const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        let movementNotification = 0;
        const ticker = (tick: { deltaMS: number }) => {
          const pose = director.step(tick.deltaMS / 1000, motionQuery.matches);
          for (const pet of [dog, cat]) {
            const p = pose[pet.type];
            pet.holder.position.set(p.x, p.y);
            pet.holder.zIndex = p.y / 10;
            pet.sprite.scale.set(pet.scale * p.facing, pet.scale);
            if (p.mood === "walk") {
              pet.sprite.animationSpeed = pet.type === "dog" ? .19 : .15;
              if (!pet.sprite.playing) pet.sprite.play();
            } else {
              if (pet.sprite.playing) pet.sprite.stop();
              if (p.mood === "idle") pet.sprite.gotoAndStop(0);
            }
            if (p.mood === "happy") {
              // Reaction starts exactly when the employee's petting starts.
              pet.sprite.rotation = Math.sin(pose.seconds * 10) * .045;
              pet.sprite.y = -Math.abs(Math.sin(pose.seconds * 11)) * (pet.type === "dog" ? 8 : 4);
              pet.heart.alpha = .65 + .35 * Math.sin(pose.seconds * 7);
              pet.heart.y = -145 * pet.scale - Math.abs(Math.sin(pose.seconds * 4)) * 13;
            } else {
              pet.sprite.rotation = 0;
              pet.sprite.y = 0;
              pet.heart.alpha = 0;
            }
          }
          const person = pose.worker;
          clerk.position.set(person.x, person.y);
          clerk.scale.set(person.scale * person.facing, person.scale);
          clerk.zIndex = person.y / 10 + .1;
          clerk.mask = person.counterMask ? behindCounterMask : null;
          const running = person.action === "run";
          rearLeg.rotation = running ? -person.stride * .43 : 0;
          frontLeg.rotation = running ? person.stride * .43 : person.action === "pet" ? -.4 : 0;
          rearLeg.y = -79 + (running ? Math.max(0, person.stride) * 5 : 0);
          frontLeg.y = -79 + (running ? Math.max(0, -person.stride) * 5 : 0);
          body.y = person.action === "pet" ? 74 : running ? -Math.abs(person.stride) * 3 : Math.sin(pose.seconds * 2) * 1.3;
          body.scale.y = person.action === "pet" ? .69 : 1;
          body.rotation = person.action === "pet" ? -.19 : running ? Math.sin(pose.seconds * 18) * .024 : 0;
          waveArm.y = -109 + (person.action === "pet" ? 90 : 0);
          waveArm.rotation = person.action === "wave"
            ? Math.sin(pose.seconds * 9) * .24 - .12
            : person.action === "pet"
              ? -.94 + Math.sin(pose.seconds * 8) * .15
              : running ? Math.sin(pose.seconds * 18) * .48 : -.28;

          movementNotification += Math.min(tick.deltaMS / 1000, .05);
          if (movementNotification >= .12) {
            movementNotification = 0;
            onMoveRef.current({
              dog: { x: pose.dog.x, y: pose.dog.y - 55 },
              cat: { x: pose.cat.x, y: pose.cat.y - 53 },
              clerk: { x: person.x, y: person.y - (person.action === "pet" ? 95 : 130) * person.scale },
            });
          }
        };
        app.ticker.add(ticker);
        removeTick = () => app.ticker.remove(ticker);
        onReadyRef.current();
      } catch (error) {
        // Keep the intact art until all three independent characters load.
        console.warn("Vườn É: independent actor package incomplete", error);
      }
    }
    void start();
    return () => { disposed = true; shutdown?.(); };
  }, [artBase]);

  return <div
    className="ve2d-pixi-pets"
    ref={host}
    aria-hidden="true"
    data-engine="pixijs-choreographed-actors"
    data-visible={visible}
  />;
}
