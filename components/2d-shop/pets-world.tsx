"use client";

import { useEffect, useRef } from "react";

export type PetPositions = {
  dog: { x: number; y: number };
  cat: { x: number; y: number };
};

type Props = {
  artBase: string;
  onReady: () => void;
  onMove: (positions: PetPositions) => void;
};

const FRAME_WIDTH = 240;
const FRAME_HEIGHT = 160;
const FRAMES = 8;
const SCENE_WIDTH = 1536;
const SCENE_HEIGHT = 1024;

/**
 * Characters live on the ORIGINAL 1536x1024 painting's world plane.
 * PixiJS v8 renders actual 8-frame quadruped walk cycles (with independently
 * posed front/hind legs in every frame) rather than CSS-translating a still PNG.
 * No fixed-position actors or duplicated pets in the responsive viewport.
 */
export function PetsWorld({ artBase, onReady, onMove }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const onReadyRef = useRef(onReady);
  const onMoveRef = useRef(onMove);
  onReadyRef.current = onReady;
  onMoveRef.current = onMove;

  useEffect(() => {
    let disposed = false;
    let destroy: (() => void) | undefined;
    const mount = host.current;
    if (!mount) return;

    async function start() {
      const {
        Application, Assets, AnimatedSprite, Container,
        Graphics, Texture, Rectangle,
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
        console.warn("PixiJS renderer unavailable; original animals will remain in artwork.", error);
        return;
      }
      if (disposed) { app.destroy(true); return; }
      mount.appendChild(app.canvas);

      const world = new Container();
      app.stage.addChild(world);
      const updateScale = () => {
        if (!mount) return;
        world.scale.set(mount.clientWidth / SCENE_WIDTH, mount.clientHeight / SCENE_HEIGHT);
      };
      updateScale();
      const observer = new ResizeObserver(updateScale);
      observer.observe(mount);
      const onVisibility = () => { if (document.hidden) app.ticker.stop(); else app.ticker.start(); };
      document.addEventListener("visibilitychange", onVisibility);

      const makeFrames = async (path: string) => {
        const atlas = await Assets.load(path) as InstanceType<typeof Texture>;
        return Array.from({ length: FRAMES }, (_, i) =>
          new Texture({ source: atlas.source, frame: new Rectangle(i * FRAME_WIDTH, 0, FRAME_WIDTH, FRAME_HEIGHT) })
        );
      };

      type Pet = {
        type: "dog" | "cat";
        holder: InstanceType<typeof Container>;
        sprite: InstanceType<typeof AnimatedSprite>;
        x: number;
        y: number;
        startX: number;
        endX: number;
        speed: number;
        facing: 1 | -1;
        state: "idle" | "walk" | "turn";
        seconds: number;
        scale: number;
      };
      let pets: Pet[] = [];
      let removeTick: (() => void) | undefined;

      try {
        const [dogFrames, catFrames] = await Promise.all([
          makeFrames(`${artBase}/pets/dog-walk.png`),
          makeFrames(`${artBase}/pets/cat-walk.png`),
        ]);
        if (disposed) return;

        const createPet = (
          type: "dog" | "cat", frames: InstanceType<typeof Texture>[],
          x: number, y: number, minX: number, maxX: number, scale: number, speed: number,
        ): Pet => {
          const holder = new Container();
          holder.position.set(x, y);

          const shadow = new Graphics()
            .ellipse(0, -7, 72 * scale, 9 * scale)
            .fill({ color: 0x423b2a, alpha: .17 });
          holder.addChild(shadow);

          const sprite = new AnimatedSprite({ textures: frames, animationSpeed: .15, loop: true, autoPlay: false });
          sprite.anchor.set(.5, .85);
          sprite.scale.set(scale);
          sprite.gotoAndStop(0);
          holder.addChild(sprite);
          world.addChild(holder);

          return {
            type, holder, sprite, x, y, startX: minX, endX: maxX,
            speed, facing: 1, state: "idle", seconds: type === "dog" ? 2.2 : 5.0, scale,
          };
        };

        pets = [
          createPet("dog", dogFrames, 383, 959, 312, 562, .90, 30),
          createPet("cat", catFrames, 1352, 1004, 1245, 1430, .82, 25),
        ];

        const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        let elapsedSincePositionUpdate = 0;
        const ticker = (tick: { deltaMS: number }) => {
          const dt = Math.min(tick.deltaMS / 1000, .05);
          const reduced = motionQuery.matches;
          for (const pet of pets) {
            if (reduced) {
              pet.sprite.stop();
              pet.sprite.gotoAndStop(0);
              continue;
            }
            pet.seconds -= dt;
            if (pet.state === "idle" && pet.seconds <= 0) {
              pet.facing = pet.x >= pet.endX - 30 ? -1 : pet.x <= pet.startX + 30 ? 1 : (Math.random() < .5 ? -1 : 1);
              pet.state = "turn";
              pet.seconds = .32;
              pet.sprite.stop();
            } else if (pet.state === "turn" && pet.seconds <= 0) {
              pet.state = "walk";
              pet.seconds = 2.5 + Math.random() * 3.4;
              pet.sprite.play();
            } else if (pet.state === "walk") {
              if (pet.x >= pet.endX && pet.facing === 1 || pet.x <= pet.startX && pet.facing === -1 || pet.seconds <= 0) {
                pet.state = "idle";
                pet.seconds = 2 + Math.random() * 5;
                pet.sprite.gotoAndStop(0);
              } else {
                pet.x += pet.speed * dt * pet.facing;
                pet.x = Math.max(pet.startX, Math.min(pet.endX, pet.x));
              }
            }
            pet.sprite.scale.x = pet.scale * pet.facing;
            pet.holder.x = pet.x;
          }
          elapsedSincePositionUpdate += dt;
          if (elapsedSincePositionUpdate > .1 && pets.length === 2) {
            elapsedSincePositionUpdate = 0;
            onMoveRef.current({
              dog: { x: pets[0].x, y: pets[0].y - 56 },
              cat: { x: pets[1].x, y: pets[1].y - 54 },
            });
          }
        };
        app.ticker.add(ticker);
        removeTick = () => app.ticker.remove(ticker);
        onReadyRef.current();
      } catch (error) {
        console.warn("Unable to initialise frame-animated pets; retaining approved intact painting.", error);
      }

      destroy = () => {
        removeTick?.();
        document.removeEventListener("visibilitychange", onVisibility);
        observer.disconnect();
        app.destroy(true, { children: true, texture: false, textureSource: false });
      };
    }

    void start();
    return () => { disposed = true; destroy?.(); };
  }, [artBase]);

  return <div className="ve2d-pixi-pets" ref={host} aria-hidden="true" data-engine="pixijs-animated-sprite" />;
}
