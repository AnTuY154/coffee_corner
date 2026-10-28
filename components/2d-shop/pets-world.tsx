"use client";

import { useEffect, useRef } from "react";
import { ActorsDirector, ARTBOARD, COUNTER_WAISTLINE_Y, type Animal } from "./actors-director";


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

/** One Pixi clock, three characters, immutable canonical design sources.
 * Employee actions use transparent derivatives of the approved worker. */
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
      const { Application, Assets, Container, AnimatedSprite, Graphics, Text } = await import("pixi.js");
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
        const [employeeTexture, dogTexture, catTexture, wavePose, runPose, petPose, catGroomPose] = await Promise.all([
          Assets.load(`${artBase}/canonical/employee.webp`),
          Assets.load(`${artBase}/canonical/dog.webp`),
          Assets.load(`${artBase}/canonical/cat.webp`),
          Assets.load(`${artBase}/animated/employee/wave.webp`),
          Assets.load(`${artBase}/animated/employee/run.webp`),
          Assets.load(`${artBase}/animated/employee/pet.webp`),
          Assets.load(`${artBase}/animated/cat/groom.webp`),
        ]);
        if (disposed) return;

        // Actual painted frames, no mesh deformation and no arm/leg warping.
        // An atlas can supply multiple drawings for each state; single-pose
        // fallback preserves the original approved art in older deployments.
        const [employeeAtlas, dogAtlas, catAtlas] = await Promise.all(
          (["employee", "dog", "cat"] as const).map(async name => {
            try {
              const response = await fetch(`${artBase}/animated/sprites/manifest.json`);
              if (!response.ok) return null;
              const manifest: { enabled?: boolean } = await response.json();
              if (!manifest.enabled) return null;
              return await Assets.load(`${artBase}/animated/sprites/${name}.json`);
            } catch { return null; }
          }),
        );

        type TextureFrame = typeof dogTexture;
        type Kind = "employee" | "dog" | "cat";
        function makeActor(texture: TextureFrame, kind: Kind, width: number, height: number) {
          const holder = new Container();
          const shadow = new Graphics().ellipse(0, -3, width * .35, 9)
            .fill({ color: 0x423b2a, alpha: .2 });
          const sprite = new AnimatedSprite({
            textures: [texture], autoUpdate: false, anchor: { x: .5, y: .96 },
          });
          sprite.width = width;
          sprite.height = height;
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
          holder.addChild(shadow, sprite, heart, actionLabel);
          world.addChild(holder);
          return { holder, shadow, sprite, width, height, heart, actionLabel, kind, animationKey: "" };
        }
        function frames(sheet: typeof employeeAtlas, action: string, fallback: TextureFrame) {
          const textureList = sheet?.animations?.[action] as TextureFrame[] | undefined;
          return textureList?.length ? textureList : [fallback];
        }
        // Assigning the array only when an action changes avoids resetting the
        // walk cycle each frame. Pixi's AnimatedSprite is driven explicitly by
        // the one authoritative ActorsDirector clock, including paused QA.
        function drawPose(
          actor: ReturnType<typeof makeActor>, key: string,
          textures: TextureFrame[], seconds: number, fps: number,
          actionProgress?: number,
        ) {
          if (actor.animationKey !== key) {
            actor.animationKey = key;
            actor.sprite.textures = textures;
            actor.sprite.width = actor.width;
            actor.sprite.height = actor.height;
          }
          const index = textures.length <= 1 ? 0 : actionProgress === undefined
            ? Math.floor(seconds * fps) % textures.length
            : Math.min(textures.length - 1, Math.floor(actionProgress * textures.length));
          if (actor.sprite.currentFrame !== index) actor.sprite.gotoAndStop(index);
        }

        const employee = makeActor(employeeTexture, "employee", 155, 208);
        const dog = makeActor(dogTexture, "dog", 118, 118);
        const cat = makeActor(catTexture, "cat", 86, 86);
        const employeeFrames = {
          idle: frames(employeeAtlas, "idle", employeeTexture),
          wave: frames(employeeAtlas, "wave", wavePose),
          run: frames(employeeAtlas, "run", runPose),
          pet: frames(employeeAtlas, "pet", petPose),
        };
        const dogFrames = {
          idle: frames(dogAtlas, "idle", dogTexture),
          walk: frames(dogAtlas, "walk", dogTexture),
          bark: frames(dogAtlas, "bark", dogTexture),
          jump: frames(dogAtlas, "jump", dogTexture),
          happy: frames(dogAtlas, "happy", dogTexture),
        };
        const catFrames = {
          idle: frames(catAtlas, "idle", catTexture),
          walk: frames(catAtlas, "walk", catTexture),
          groom: frames(catAtlas, "groom", catGroomPose),
          nap: frames(catAtlas, "nap", catTexture),
          happy: frames(catAtlas, "happy", catTexture),
        };
        // Pixi v8: a Graphics object ceases to be an active stencil mask when
        // its last masked actor sets `.mask = null`. At that moment it becomes
        // VISIBLE as a giant opaque rectangle. This was the white 1672x650
        // panel that covered the storefront every time the clerk left the counter.
        //
        // Keep ONE stencil mask assigned throughout the actor's lifetime;
        // only change its geometry between the counter and full artboard.
        // Pixi never paints an active mask into the color buffer.
        const counterMask = new Graphics().rect(0, 0, ARTBOARD.width, COUNTER_WAISTLINE_Y).fill(0xffffff);
        employee.holder.mask = counterMask;
        world.addChild(counterMask);
        let maskHeight = COUNTER_WAISTLINE_Y;

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
          const reviewPaused = reviewMode && host.current?.dataset.reviewHold === "true";
          let remaining = reviewPaused ? 0 : Math.min(Math.max(tick.deltaMS / 1000, 0), .2);
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
              if (goal === "off-counter" && !pose.worker.behindCounter &&
                pose.worker.x >= 944 && pose.worker.y >= 911) break;
              if (goal === "petting" && pose.phase === "petting") break;
              if (goal === "home" && startedInVisit && pose.phase === "idle") break;
              if (goal === "dog-bark" && pose.dog.mood === "bark" &&
                pose.dog.actionProgress > .3) break;
              if (goal === "dog-jump" && pose.dog.mood === "jump" &&
                pose.dog.actionProgress > .38) break;
              if (goal === "cat-groom" && pose.cat.mood === "groom" &&
                pose.cat.actionProgress > .3) break;
              if (goal === "cat-nap" && pose.cat.mood === "nap" &&
                pose.cat.actionProgress > .3) break;
              if (goal === "employee-run" && pose.worker.action === "run" &&
                !pose.worker.behindCounter &&
                pose.worker.x >= 944 && pose.worker.y >= 911) break;
            }
          }
          for (const p of [dog, cat] as const) {
            const state = pose[p.kind as Animal];
            const dogJump = p.kind === "dog" && state.mood === "jump";
            const jumpHeight = dogJump
              ? Math.sin(state.actionProgress * Math.PI) * 40 : 0;
            p.holder.position.set(state.x, state.y - jumpHeight);
            // Orientation flip only: X and Y remain identical in magnitude.
            // No scaling, warping, rotating, squashing or mesh deformation
            // during the walk, grooming, sleeping, greeting or jump actions.
            p.holder.scale.set(state.facing, 1);
            p.holder.rotation = 0;
            p.holder.zIndex = state.y;
            p.shadow.y = jumpHeight;
            p.shadow.scale.x = 1;
            p.shadow.alpha = dogJump ? .26 : 1;
            p.heart.alpha = state.mood === "happy" ? .8 : 0;
            p.actionLabel.alpha = state.mood === "bark" || state.mood === "nap" ? .8 : 0;
            p.actionLabel.y = -p.height - 24;
            if (p.kind === "dog") {
              const name = (state.mood === "walk" || state.mood === "turn") ? "walk"
                : state.mood === "bark" ? "bark"
                : state.mood === "jump" ? "jump"
                : state.mood === "happy" ? "happy" : "idle";
              drawPose(p, name, dogFrames[name], pose.seconds,
                name === "walk" ? 9 : 6,
                name === "jump" || name === "bark" ? state.actionProgress : undefined);
            } else {
              const name = (state.mood === "walk" || state.mood === "turn") ? "walk"
                : state.mood === "groom" ? "groom"
                : state.mood === "nap" ? "nap"
                : state.mood === "happy" ? "happy" : "idle";
              drawPose(p, name, catFrames[name], pose.seconds,
                name === "walk" ? 7 : 4,
                name === "nap" ? state.actionProgress : undefined);
            }
          }
          if (pose.dog.mood === "bark" && previousDogMood !== "bark") onBarkRef.current?.();
          previousDogMood = pose.dog.mood;
          const person = pose.worker;
          // Running and crouching are different PAINTED frames, not a
          // deformation of the standing employee. Feet follow world routes.
          const runningOutside = person.action === "run" && !person.behindCounter;
          const runLift = 0;
          employee.holder.position.set(person.x, person.y);
          drawPose(employee, person.action, employeeFrames[person.action],
            pose.seconds, person.action === "run" ? 10 : person.action === "pet" ? 5 : 4);
          const poseFacing = runningOutside || person.action === "pet"
            ? person.facing : 1;
          employee.holder.scale.set(person.scale * poseFacing, person.scale);
          employee.holder.zIndex = person.y + .1;
          // From the patio the clerk reaches the cat BEHIND the tabletop,
          // never stepping onto the chairs. Keep the upper body visible, but
          // let the actual painted tabletop occlude the lower legs as in life.
          const besideCatTable = pose.target === "cat" &&
            person.x >= 1175 && person.y >= 870;
          // The left exit passes beside foreground stools/planters painted
          // INTO the immutable background. Full-body rendering at world
          // y=729 made the worker look as though she ran on the chairs.
          // Gradually reveal the lower body ONLY on the descent from the
          // left passage onto the paved ground, and reverse when returning.
          const inLeftPassage = (pose.phase === "outbound" ||
            pose.phase === "returning") && person.x < 935;
          // Foreground chairs and the chalkboard are part of the approved
          // *background*. The worker passes BEHIND them: her lower silhouette
          // should not be drawn on top of a stool. Reveal upper torso near the
          // left exit, then smoothly reveal her feet on the open central tiles.
          const exitY = Math.max(0, Math.min(1, (person.y - 815) / 95));
          const exitX = Math.max(0, Math.min(1, (person.x - 825) / 110));
          const soft = exitX * exitX * (3 - 2 * exitX);
          const passageMaskHeight = Math.round(COUNTER_WAISTLINE_Y +
            (790 - COUNTER_WAISTLINE_Y) * exitY +
            (ARTBOARD.height - 790) * soft * exitY);
          const nextMaskHeight = inLeftPassage ? passageMaskHeight :
            person.behindCounter ? COUNTER_WAISTLINE_Y :
            besideCatTable ? 852 : ARTBOARD.height;
          if (nextMaskHeight !== maskHeight) {
            counterMask.clear().rect(0, 0, ARTBOARD.width, nextMaskHeight).fill(0xffffff);
            maskHeight = nextMaskHeight;
          }
          employee.holder.rotation = 0;
          lastNotification += reviewPaused
            ? .15 // Publish the held frame promptly for visual assertions.
            : Math.min(Math.max(tick.deltaMS / 1000, 0), .2);
          if (lastNotification >= .13) {
            lastNotification = 0;
            // Public read-only scene diagnostics for independent browser QA.
            // They contain only coordinates and action labels, no user data.
            if (host.current) {
              host.current.dataset.phase = pose.phase;
              host.current.dataset.employeeX = String(Math.round(person.x));
              host.current.dataset.employeeY = String(Math.round(person.y));
              host.current.dataset.employeeAction = person.action;
              host.current.dataset.employeePoseAsset = person.action;
              host.current.dataset.employeeScale = person.scale.toFixed(3);
              // Fraction of employee artboard visible above the counter:
              // target ≈ upper 42% of full illustrated texture: belly to head, no skirt.
              const portraitHeight = employee.height * person.scale;
              const portraitTop = person.y - portraitHeight * .96;
              const visibleFraction = Math.max(0, Math.min(1,
                (COUNTER_WAISTLINE_Y - portraitTop) / portraitHeight));
              host.current.dataset.employeeVisibleFraction = person.behindCounter
                ? visibleFraction.toFixed(3) : "1";
              host.current.dataset.counterMaskHeight = String(maskHeight);
              host.current.dataset.dogX = String(Math.round(pose.dog.x));
              host.current.dataset.dogY = String(Math.round(pose.dog.y));
              host.current.dataset.dogMood = pose.dog.mood;
              host.current.dataset.dogJumpHeight = String(Math.round(
                pose.dog.mood === "jump" ? Math.sin(pose.dog.actionProgress * Math.PI) * 40 : 0));
              host.current.dataset.catX = String(Math.round(pose.cat.x));
              host.current.dataset.catY = String(Math.round(pose.cat.y));
              host.current.dataset.catMood = pose.cat.mood;
              host.current.dataset.catPoseAsset = pose.cat.mood === "groom"
                ? "groom" : pose.cat.mood === "nap" ? "nap" : "canonical";
              host.current.dataset.dogFrame = String(dog.sprite.currentFrame);
              host.current.dataset.catFrame = String(cat.sprite.currentFrame);
              host.current.dataset.employeeFrame = String(employee.sprite.currentFrame);
              host.current.dataset.frameRendering = "painted-sprites";
              host.current.dataset.workerRunLift = runLift.toFixed(2);
            }
            onMoveRef.current({
              // Hotspot centers match the VISIBLE rendered sprites in the
              // same pixel artboard, not their feet or an arbitrary offset.
              dog: { x: pose.dog.x, y: pose.dog.y - 56 },
              cat: { x: pose.cat.x, y: pose.cat.y - 42 },
              clerk: { x: person.x, y: person.y - (person.behindCounter
                ? 156 * person.scale : 103 * person.scale) },
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