"use client";

import { useEffect, useRef } from "react";
import { ActorsDirector, ARTBOARD, COUNTER_WAISTLINE_Y, employeeMaskHeight, type Animal } from "./actors-director";
import { FRAME_SEQUENCES, FRAME_FPS, animationFrameAt, framePath, petFrameAction, employeeFrameAction, type CharacterId } from "./animation-frames";

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
        // New actors use only the reviewed frame pack, never previous-generation
        // static portraits or pre-frame poses while individual cycles load.
        const [employeeTexture, dogTexture, catTexture] = await Promise.all([
          Assets.load(framePath(artBase, "employee", "wave", 0)),
          Assets.load(framePath(artBase, "dog", "idle", 0)),
          Assets.load(framePath(artBase, "cat", "idle", 0)),
        ]);
        if (disposed) return;
        type FrameTexture = typeof dogTexture;
        const frames: Record<CharacterId, Record<string, FrameTexture[]>> = {
          employee: {}, dog: {}, cat: {},
        };
        // A count alone does not certify a crop. Only sequences explicitly
        // reviewed in the manifest may replace the canonical illustrations.
        type ReviewedManifest = { approved?: Partial<Record<CharacterId, Record<string, number>>> };
        let approved: NonNullable<ReviewedManifest["approved"]> = {};
        try {
          const response = await fetch(`${artBase}/manifest.json`, { cache: "no-store" });
          if (response.ok) {
            const parsed: ReviewedManifest = await response.json();
            if (parsed?.approved && typeof parsed.approved === "object")
              approved = parsed.approved;
          }
        } catch { /* sprite pack is optional */ }
        const loading = new Set<string>();
        const failed = new Set<string>();
        function loadAction(character: CharacterId, action: string) {
          const count = (FRAME_SEQUENCES[character] as Record<string, number>)[action];
          const key = `${character}/${action}`;
          if (!count || approved[character]?.[action] !== count ||
            frames[character][action] || loading.has(key) || failed.has(key)) return;
          loading.add(key);
          // Load only the active sequence. The old eager loader requested all
          // 160 images at once and delayed the entire stage until completion.
          void Promise.all(Array.from({ length: count }, (_, i) =>
            Assets.load(framePath(artBase, character, action, i)) as Promise<FrameTexture>))
            .then(loaded => {
              if (disposed) return;
              if (loaded.every(t => t.width === loaded[0].width && t.height === loaded[0].height))
                frames[character][action] = loaded;
              else failed.add(key);
            })
            .catch(() => failed.add(key))
            .finally(() => loading.delete(key));
        }
        if (disposed) return;
        const clocks: Record<CharacterId, { action: string; elapsed: number }> = {
          employee: { action: "", elapsed: 0 }, dog: { action: "", elapsed: 0 },
          cat: { action: "", elapsed: 0 },
        };
        function frameFor(character: CharacterId, action: string,
          fallback: FrameTexture, delta: number, actionProgress = 0): FrameTexture {
          const clock = clocks[character];
          if (clock.action !== action) { clock.action = action; clock.elapsed = 0; }
          else clock.elapsed += delta;
          const sequence = frames[character][action];
          if (!sequence?.length) { loadAction(character, action); return fallback; }
          if (reduced.matches) { clock.elapsed = 0; return sequence[0]; }
          if (action === "jump")
            return sequence[animationFrameAt(actionProgress, sequence.length, sequence.length, false)];
          const fps = (FRAME_FPS[character] as Record<string, number>)[action] ?? 8;
          return sequence[animationFrameAt(clock.elapsed, fps, sequence.length, action !== "jump")];
        }

        function makeActor(texture: typeof dogTexture, kind: CharacterId, width: number, height: number) {
          const holder = new Container();
          const shadow = new Graphics().ellipse(0, -3, width * .35, 9)
            .fill({ color: 0x423b2a, alpha: .2 });
          const mesh = new MeshPlane({ texture, verticesX: 17, verticesY: 17 });
          mesh.autoResize = false;
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
        // A single frame-sourced MeshPlane per character: no duplicate poses.
        employee.mesh.autoResize = false;
        const dog = makeActor(dogTexture, "dog", 118, 118);
        // The cat occupies the clear left section of the wooden tabletop;
        // the flower vase and right-hand chair are not a walkable surface.
        const cat = makeActor(catTexture, "cat", 86, 86);
        // The cat uses the same approved frame sequence as every other action.
        cat.mesh.autoResize = false;

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
              if (goal.startsWith("frame:")) {
                const [, character, action] = goal.split(":");
                const current = character === "employee"
                  ? employeeFrameAction(pose.worker.action, pose.target)
                  : character === "dog" || character === "cat"
                    ? petFrameAction(character, pose[character].mood, pose[character].speed) : "";
                if (current === action && (action !== "jump" ||
                  (character !== "employee" && pose[character as Animal].actionProgress > .35))) break;
              }
              if (goal === "employee-left-exit" && pose.phase === "outbound" &&
                pose.worker.action === "run" && !pose.worker.behindCounter &&
                pose.worker.x <= 325 && pose.worker.y >= 775 && pose.worker.y <= 875) break;
              if (goal === "off-counter" && !pose.worker.behindCounter &&
                pose.worker.x >= 944 && pose.worker.y >= 911) break;
              if (goal === "petting" && pose.phase === "petting") break;
              if (goal === "home" && startedInVisit && pose.phase === "idle") break;
              if (goal === "dog-bark" && pose.dog.mood === "bark" &&
                pose.dog.actionProgress > .3) break;
              if (goal === "dog-jump" && pose.dog.mood === "jump" &&
                pose.dog.actionProgress > .38) break;
              if (goal === "dog-run" && pose.dog.mood === "walk" &&
                Math.abs(pose.dog.speed) >= 70) break;
              if (goal === "cat-groom" && pose.cat.mood === "groom" &&
                pose.cat.actionProgress > .3) break;
              if (goal === "cat-nap" && pose.cat.mood === "nap" &&
                pose.cat.actionProgress > .3) break;
              if (goal === "cat-jump" && pose.cat.mood === "jump" &&
                pose.cat.actionProgress > .38) break;
              if (goal === "cat-walk" && pose.cat.mood === "walk" &&
                Math.abs(pose.cat.speed) > 3) break;
              if (goal === "employee-run" && pose.worker.action === "run" &&
                !pose.worker.behindCounter &&
                pose.worker.x >= 944 && pose.worker.y >= 911) break;
              if (goal === "employee-walk" && pose.worker.action === "walk" &&
                !pose.worker.behindCounter &&
                pose.worker.x >= 944 && pose.worker.y >= 911) break;
            }
          }
          for (const p of [dog, cat] as const) {
            const state = pose[p.kind as Animal];
            const frameAction = petFrameAction(p.kind as Animal, state.mood, state.speed);
            const nextFrame = frameFor(p.kind as Animal, frameAction, p.mesh.texture,
              Math.min(Math.max(tick.deltaMS / 1000, 0), .2), state.actionProgress);
            if (p.mesh.texture !== nextFrame) p.mesh.texture = nextFrame;
            if (reviewMode && host.current) {
              host.current.dataset[`${p.kind}Action`] = frameAction;
              host.current.dataset[`${p.kind}Progress`] = String(state.actionProgress);
              host.current.dataset[`${p.kind}Frame`] = String(
                frames[p.kind as Animal][frameAction]?.indexOf(nextFrame) ?? -1);
            }
            // Explicit world surfaces: puppy paws on the courtyard tiles,
            // cat paws ON the wooden outdoor tabletop (not on the ground).
            // Visible movement must match the director's state. Previously
            // only mesh points moved (by <3px on screen), which looked like
            // sliding photos. Use foot-locked world transforms as well:
            // running bobs, a real airborne jump, a sleepy crouch and
            // different tail/head rhythms. Keep the floor shadow anchored.
            const dogJump = p.kind === "dog" && state.mood === "jump";
            const jumping = state.mood === "jump"
              ? Math.sin(state.actionProgress * Math.PI) * (p.kind === "dog" ? 40 : 22) : 0;
            const walking = state.mood === "walk" || state.mood === "turn";
            const bounce = walking ? Math.pow(Math.sin(state.gait), 2) *
              Math.min(4.2, Math.abs(state.speed) / 17) : 0;
            p.holder.position.set(state.x, state.y - jumping - bounce);
            p.holder.scale.set(state.facing, 1);
            p.holder.rotation = 0;
            p.holder.zIndex = state.y;
            p.shadow.y = jumping + bounce;
            p.shadow.scale.x = dogJump ? 1 - jumping / 110 : 1;
            p.shadow.alpha = dogJump ? .16 : 1;
            p.heart.alpha = state.mood === "happy" ? .7 + Math.sin(stepTime * 7) * .25 : 0;
            p.actionLabel.alpha = state.mood === "bark" || (state.mood === "nap" && p.kind === "cat")
              ? state.mood === "bark" ? .8 + Math.sin(stepTime * 18) * .2 : .72 : 0;
            p.actionLabel.y = -p.height - 24 - (dogJump ? 20 : Math.abs(Math.sin(stepTime * 2)) * 4);
            // Approved drawings contain their own limb motion: never warp a
            // previously generated portrait onto the new frame animation.
            p.vertices.set(p.original);
            p.buffer.update();
          }
          if (pose.dog.mood === "bark" && previousDogMood !== "bark") onBarkRef.current?.();
          previousDogMood = pose.dog.mood;
          const person = pose.worker;
          // A true running pose already has bent legs. Foot-locked strides
          // now add a vertical rise/fall; petting uses the crouching asset
          // and strokes instead of moving the whole full-body image sideways.
          const runningOutside = (person.action === "run" || person.action === "walk") && !person.behindCounter;
          const runLift = runningOutside
            ? Math.pow(Math.sin(pose.seconds * (person.action === "run" ? 8 : 6)), 2) *
              (person.action === "run" ? 4.5 : 2) : 0;
          employee.holder.position.set(person.x, person.y - runLift);
          // Switch the full illustrated pose — running is a real bent-knee
          // running drawing, petting is an actual crouch/reaching-arm drawing.
          // Deformation alone can no longer fake these body poses.
          const workerFrame = employeeFrameAction(person.action, pose.target);
          const requiredTexture = frameFor("employee", workerFrame,
            employee.mesh.texture, Math.min(Math.max(tick.deltaMS / 1000, 0), .2));
          if (employee.mesh.texture !== requiredTexture)
            employee.mesh.texture = requiredTexture;
          if (reviewMode && host.current) {
            host.current.dataset.employeeFrame = String(
              frames.employee[workerFrame]?.indexOf(requiredTexture) ?? -1);
            host.current.dataset.employeeFrameAction = workerFrame;
          }
          // The run and pet source poses reach to the right; mirror when
          // approaching the dog from its right side. At the counter, preserve
          // the original apron writing and the face's approved appearance.
          const poseFacing = person.action === "run" || person.action === "walk" || person.action === "pet"
            ? person.facing : 1;
          employee.holder.scale.set(person.scale * poseFacing, person.scale);
          employee.holder.zIndex = person.y + .1;
          // The mask follows the actual counter exit, not a huge x<935
          // rectangle that cropped the employee while she was running in
          // the courtyard. Keep the full character visible once outside.
          const nextMaskHeight = employeeMaskHeight(person, pose.phase, pose.target);
          if (nextMaskHeight !== maskHeight) {
            counterMask.clear().rect(0, 0, ARTBOARD.width, nextMaskHeight).fill(0xffffff);
            maskHeight = nextMaskHeight;
          }
          employee.holder.rotation = 0;
          employee.vertices.set(employee.original);
          employee.buffer.update();
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
              host.current.dataset.catJumpHeight = String(Math.round(
                pose.cat.mood === "jump" ? Math.sin(pose.cat.actionProgress * Math.PI) * 22 : 0));
              host.current.dataset.catPoseAsset = pose.cat.mood === "groom"
                ? "groom" : "frame";
              host.current.dataset.workerRunLift = runLift.toFixed(2);
            }
            onMoveRef.current({
              // Hotspot centers match the VISIBLE rendered sprites in the
              // same pixel artboard, not their feet or an arbitrary offset.
              dog: { x: pose.dog.x, y: dog.holder.y - 56 },
              cat: { x: pose.cat.x, y: cat.holder.y - 42 },
              clerk: { x: person.x, y: person.y - (person.behindCounter
                ? 156 * person.scale : 103 * person.scale) },
            });
          }
        };
        app.ticker.add(ticker);
        removeTick = () => app.ticker.remove(ticker);
        onReadyRef.current();
      } catch (error) {
        console.warn("Vườn É: reviewed actor frame textures could not load", error);
      }
    }
    void start();
    return () => { disposed = true; shutdown?.(); };
  }, [artBase]);

  return <div className="ve2d-pixi-pets" ref={host} aria-hidden="true"
    data-engine="pixijs-choreographed-actors" data-visible={visible} />;
}
