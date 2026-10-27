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
 * character using five original transparent anime-watercolour pose textures.
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
        const [dogFrames, catFrames, idlePose, wavePose, runPose, petDogPose, petCatPose] = await Promise.all([
          loadWalkFrames(`${artBase}/pets/dog-walk.png`),
          loadWalkFrames(`${artBase}/pets/cat-walk.png`),
          Assets.load(`${artBase}/actors/anime/idle.webp`) as Promise<InstanceType<typeof Texture>>,
          Assets.load(`${artBase}/actors/anime/wave.webp`) as Promise<InstanceType<typeof Texture>>,
          Assets.load(`${artBase}/actors/anime/run.webp`) as Promise<InstanceType<typeof Texture>>,
          Assets.load(`${artBase}/actors/anime/pet-dog.webp`) as Promise<InstanceType<typeof Texture>>,
          Assets.load(`${artBase}/actors/anime/pet-cat.webp`) as Promise<InstanceType<typeof Texture>>,
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

        // Real high-resolution, character-only poses rendered independently
        // of the shop artwork. Reuse a single Sprite to avoid texture flicker.
        const clerk = new Container();
        const clerkSprite = new Sprite(idlePose);
        clerkSprite.anchor.set(.5, 1);
        // Artboard 540 x 720 is scaled into the 1536 x 1024 world plane.
        // Same box size for every pose keeps the feet aligned during transitions.
        const CHARACTER_WIDTH = 177;
        const CHARACTER_HEIGHT = 236;
        clerkSprite.width = CHARACTER_WIDTH;
        clerkSprite.height = CHARACTER_HEIGHT;
        clerk.addChild(clerkSprite);
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
          const poseTexture = person.action === "pet"
            ? (pose.target === "cat" ? petCatPose : petDogPose)
            : person.action === "wave" ? wavePose
            : person.action === "run" ? runPose : idlePose;
          if (clerkSprite.texture !== poseTexture) clerkSprite.texture = poseTexture;
          // Pet poses were painted for their own target direction. Do not
          // mirror the apron lettering when crouching, greeting or idling.
          const runFacing = person.action === "run" ? person.facing : 1;
          clerk.position.set(person.x, person.y);
          clerk.scale.set(person.scale * runFacing, person.scale);
          clerk.zIndex = person.y / 10 + .1;
          clerk.mask = person.counterMask ? behindCounterMask : null;
          // Body/cloth secondary movement is restrained. The individual
          // illustrated poses communicate the actual actions.
          const running = person.action === "run";
          const petting = person.action === "pet";
          const wave = person.action === "wave";
          clerkSprite.rotation = running ? Math.sin(pose.seconds * 18) * .023
            : petting ? Math.sin(pose.seconds * 8) * .012
            : wave ? Math.sin(pose.seconds * 6) * .015 : 0;
          clerkSprite.y = running ? -Math.abs(person.stride) * 4
            : petting ? Math.sin(pose.seconds * 8) * 1.4
            : Math.sin(pose.seconds * 2) * 1;
          clerkSprite.scale.y = running ? 1 - Math.abs(person.stride) * .012 : 1;
          clerkSprite.scale.x = 1;

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
