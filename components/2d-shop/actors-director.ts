/**
 * Canonical Vườn É world (1672 × 941). One simulation clock drives the employee,
 * the puppy on the pavement and the cat ON the right-hand outdoor table.
 * Images are immutable: character geometry is deformed only at render time.
 */
export const ARTBOARD = { width: 1672, height: 941 } as const;
export type Animal = "dog" | "cat";
export type PetMood = "idle" | "walk" | "turn" | "happy" | "bark" | "jump" | "groom" | "nap";
export type WorkerAction = "idle" | "wave" | "run" | "pet";
export type Vec = { x: number; y: number };
export type PetPose = Vec & {
  mood: PetMood; facing: 1 | -1; speed: number; gait: number; actionProgress: number;
};
export type WorkerPose = Vec & {
  action: WorkerAction; facing: 1 | -1; scale: number;
  stride: number; behindCounter: boolean;
};
export type WorldPose = {
  worker: WorkerPose; dog: PetPose; cat: PetPose;
  target: Animal | null; phase: "idle" | "outbound" | "petting" | "returning";
  seconds: number;
};

// Feet are anchored behind the wood countertop when greeting visitors.
// Behind the counter, only the upper body is visible. The larger portrait
// makes her face readable without magnifying the entire outdoor character.
const HOME = { x: 764, y: 694, scale: 1.08 };
const PATIO_SCALE = .895;
const smoothStep = (t: number) => { const x = clamp(t, 0, 1); return x * x * (3 - 2 * x); };
export function employeeSceneScale(position: Vec): number {
  // Ease between close-up barista and natural full-body running scale while
  // she exits the service counter. Returning applies the exact same rule.
  const distance = Math.hypot(position.x - HOME.x, position.y - HOME.y);
  return HOME.scale + (PATIO_SCALE - HOME.scale) * smoothStep(distance / 200);
}
// Verified against the pixel-space geometry of the approved 1672x941 shop:
// pavement corridor between the two foreground seating areas is x=855..1100,
// while the clear LEFT half of the right tabletop is x=1255..1375, y≈843.
// Previous x=403 put the puppy on a chair; x=1410 put the cat by the chair.
export const DOG_GROUND_Y = 918;
export const CAT_TABLE_Y = 853;
export const DOG_WALKABLE_X = [870, 1080] as const;
export const CAT_WALKABLE_X = [1308, 1353] as const;
const INIT: Record<Animal, Vec> = {
  dog: { x: 951, y: DOG_GROUND_Y }, cat: { x: 1330, y: CAT_TABLE_Y },
};
const LIMITS: Record<Animal, readonly [number, number]> = {
  dog: DOG_WALKABLE_X, cat: CAT_WALKABLE_X,
};
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const dist = (a: Vec, b: Vec) => Math.hypot(b.x - a.x, b.y - a.y);
const smooth = (t: number) => t * t * (3 - 2 * t);
const preferredSpeed = (who: Animal) => who === "dog" ? 65 : 19;
const IS_SPECIAL: ReadonlySet<PetMood> = new Set(["bark", "jump", "groom", "nap"]);

type PetState = PetPose & {
  desired: number; timer: number; specialAt: number; specialCount: number;
  actionElapsed: number; actionDuration: number;
};
type Visit = {
  target: Animal; phase: "outbound" | "petting" | "returning";
  path: Vec[]; elapsed: number; duration: number;
};

/** Travel along the route with smoothed total speed, preserving waypoints. */
export function interpolateRoute(points: Vec[], progress: number): Vec {
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1) return { ...points[0] };
  const lengths = points.slice(1).map((p, i) => dist(points[i], p));
  const total = lengths.reduce((sum, value) => sum + value, 0);
  if (total === 0) return { ...points[0] };
  let remaining = total * smooth(clamp(progress, 0, 1));
  for (let i = 0; i < lengths.length; i++) {
    const length = lengths[i];
    if (remaining <= length || i === lengths.length - 1) {
      const t = length === 0 ? 1 : clamp(remaining / length, 0, 1);
      // Cubic Hermite joins are continuous at every path waypoint; unlike
      // a hard polyline they do not snap when the employee turns a corner.
      const previous = points[Math.max(0, i - 1)];
      const a = points[i], b = points[i + 1];
      const next = points[Math.min(points.length - 1, i + 2)];
      const t2 = t * t, t3 = t2 * t;
      const h00 = 2 * t3 - 3 * t2 + 1, h10 = t3 - 2 * t2 + t;
      const h01 = -2 * t3 + 3 * t2, h11 = t3 - t2;
      const m0 = { x: (b.x - previous.x) * .36, y: (b.y - previous.y) * .36 };
      const m1 = { x: (next.x - a.x) * .36, y: (next.y - a.y) * .36 };
      return { x: a.x * h00 + m0.x * h10 + b.x * h01 + m1.x * h11,
        y: a.y * h00 + m0.y * h10 + b.y * h01 + m1.y * h11 };
    }
    remaining -= length;
  }
  return { ...points[points.length - 1] };
}

export class ActorsDirector {
  private time = 0;
  private random = 0x71e2026;
  private nextVisitAt = 19;
  private alternate: Animal = "dog";
  private queued: Animal | null = null;
  private visit: Visit | null = null;
  private worker: WorkerPose = { ...HOME, action: "wave", facing: 1, stride: 0, behindCounter: true };
  private pets: Record<Animal, PetState> = {
    dog: { ...INIT.dog, mood: "idle", facing: 1, gait: 0, speed: 0, desired: 0,
      timer: 1.3, specialAt: 7, specialCount: 0, actionElapsed: 0, actionDuration: 0, actionProgress: 0 },
    cat: { ...INIT.cat, mood: "idle", facing: -1, gait: 0, speed: 0, desired: 0,
      timer: 2.4, specialAt: 5, specialCount: 0, actionElapsed: 0, actionDuration: 0, actionProgress: 0 },
  };
  private rand() {
    this.random ^= this.random << 13;
    this.random ^= this.random >>> 17;
    this.random ^= this.random << 5;
    return (this.random >>> 0) / 4294967296;
  }
  get phase(): WorldPose["phase"] { return this.visit?.phase ?? "idle"; }
  get target(): Animal | null { return this.visit?.target ?? null; }

  request(target: Animal) {
    if (this.visit) { if (this.visit.target !== target) this.queued = target; return; }
    this.startVisit(target);
  }

  private startVisit(target: Animal) {
    const pet = this.pets[target];
    pet.desired = 0; pet.timer = 15;
    // Meet the cat from the floor NEXT to the table, not on top of it.
    const end: Vec = target === "dog"
      ? { x: clamp(pet.x + 95, 905, 1170), y: DOG_GROUND_Y }
      : { x: clamp(pet.x - 73, 1210, 1300), y: 915 };
    // Exit via the left end of the counter, then follow the foreground
    // walkway before approaching either animal. No walking through fridges.
    // The front seating remains part of the illustrated scene and characters
    // must not teleport from one side of the store to the other.
    const path: Vec[] = [
      HOME, { x: 610, y: 693 }, { x: 433, y: 700 },
      { x: 317, y: 729 }, { x: 306, y: 817 }, { x: 361, y: 916 },
      { x: 770, y: 918 },
      ...(end.x > 1090 ? [{ x: 1115, y: 918 }] : []),
      end,
    ];
    const length = path.slice(1).reduce((sum, point, i) => sum + dist(path[i], point), 0);
    this.visit = { target, phase: "outbound", path, elapsed: 0, duration: length / 230 };
    this.alternate = target === "dog" ? "cat" : "dog";
  }

  private animatePet(animal: Animal, dt: number) {
    const pet = this.pets[animal];
    if (this.visit?.target === animal) {
      pet.desired = 0;
      pet.speed += (0 - pet.speed) * Math.min(1, dt * 11);
      pet.actionProgress = 0;
      pet.mood = this.visit.phase === "petting" ? "happy" : "idle";
      return;
    }
    if (IS_SPECIAL.has(pet.mood)) {
      pet.actionElapsed += dt;
      pet.speed = 0;
      pet.actionProgress = clamp(pet.actionElapsed / pet.actionDuration, 0, 1);
      if (pet.actionProgress >= 1) {
        pet.mood = "idle";
        pet.actionElapsed = 0;
        pet.actionProgress = 0;
        pet.timer = .7 + this.rand() * 1.5;
      }
      return;
    }
    if (this.time >= pet.specialAt && Math.abs(pet.speed) < 5) {
      pet.mood = animal === "dog"
        ? (pet.specialCount % 2 === 0 ? "bark" : "jump")
        : (pet.specialCount % 2 === 0 ? "groom" : "nap");
      pet.specialCount++;
      pet.actionElapsed = 0;
      pet.actionProgress = 0;
      pet.actionDuration = pet.mood === "bark" ? .9 : pet.mood === "jump" ? 1.35
        : pet.mood === "groom" ? 3.7 : 5.6;
      pet.specialAt = this.time + (animal === "dog" ? 9 : 10) + this.rand() * 4;
      pet.speed = 0;
      pet.desired = 0;
      return;
    }
    // Stop naturally before a special action; do not snap from full speed.
    if (this.time >= pet.specialAt) pet.desired = 0;
    pet.timer -= dt;
    if (pet.timer <= 0 && this.time < pet.specialAt) {
      pet.timer = (animal === "dog" ? 1.6 : 2.8) + this.rand() * 2.3;
      const [left, right] = LIMITS[animal];
      const direction: 1 | -1 = pet.x > right - 28 ? -1 : pet.x < left + 28 ? 1 : this.rand() < .5 ? -1 : 1;
      pet.desired = this.rand() < .27 ? 0 : direction * preferredSpeed(animal);
    }
    const reversing = pet.speed * pet.desired < 0;
    const acceleration = reversing ? 155 : pet.desired === 0 ? 115 : 77;
    const change = Math.min(Math.abs(pet.desired - pet.speed), acceleration * dt);
    pet.speed += Math.sign(pet.desired - pet.speed) * change;
    if (Math.abs(pet.speed) < .02) pet.speed = 0;
    const previous = pet.x;
    const [left, right] = LIMITS[animal];
    pet.x = clamp(pet.x + pet.speed * dt, left, right);
    if (pet.x === left || pet.x === right) {
      pet.speed = 0; pet.desired = 0; pet.timer = .4;
    }
    pet.y = animal === "dog" ? DOG_GROUND_Y : CAT_TABLE_Y;
    pet.gait += Math.abs(pet.x - previous) / (animal === "dog" ? 35 : 26) * Math.PI * 2;
    if (pet.speed > 3) pet.facing = 1;
    if (pet.speed < -3) pet.facing = -1;
    pet.mood = reversing ? "turn" : Math.abs(pet.speed) > 1.7 ? "walk" : "idle";
    pet.actionProgress = 0;
  }

  step(deltaSeconds: number, reducedMotion = false): WorldPose {
    const dt = clamp(Number.isFinite(deltaSeconds) ? deltaSeconds : 0, 0, .05);
    if (reducedMotion) return {
      worker: { ...HOME, action: "idle", facing: 1, stride: 0, behindCounter: true },
      dog: { ...INIT.dog, mood: "idle", facing: 1, gait: 0, speed: 0, actionProgress: 0 },
      cat: { ...INIT.cat, mood: "nap", facing: -1, gait: 0, speed: 0, actionProgress: .5 },
      phase: "idle", target: null, seconds: this.time,
    };
    this.time += dt;
    if (!this.visit && this.time >= this.nextVisitAt) this.startVisit(this.alternate);
    this.animatePet("dog", dt);
    this.animatePet("cat", dt);

    const visit = this.visit;
    if (visit) {
      visit.elapsed += dt;
      if (visit.phase === "outbound" || visit.phase === "returning") {
        const outbound = visit.phase === "outbound";
        const progress = clamp(visit.elapsed / visit.duration, 0, 1);
        const step = outbound ? progress : 1 - progress;
        const position = interpolateRoute(visit.path, step);
        const next = interpolateRoute(visit.path, clamp(step + (outbound ? .003 : -.003), 0, 1));
        const diffX = next.x - position.x;
        this.worker = {
          ...position, scale: employeeSceneScale(position),
          action: "run", facing: Math.abs(diffX) > .1 ? (diffX < 0 ? -1 : 1) : this.worker.facing,
          stride: Math.sin(this.time * 17),
          behindCounter: position.y < 730 && position.x > 345,
        };
        if (progress >= 1) {
          visit.elapsed = 0;
          if (outbound) {
            visit.phase = "petting";
            this.worker = { ...this.worker, action: "pet", stride: 0, behindCounter: false };
            this.pets[visit.target].mood = "happy";
            this.pets[visit.target].speed = 0;
          } else {
            this.visit = null;
            this.worker = { ...HOME, action: "idle", facing: 1, stride: 0, behindCounter: true };
            this.nextVisitAt = this.time + 22 + this.rand() * 13;
            if (this.queued) {
              const target = this.queued;
              this.queued = null;
              this.startVisit(target);
            }
          }
        }
      } else {
        const stop = visit.path[visit.path.length - 1];
        this.worker = { ...stop, scale: PATIO_SCALE, action: "pet", facing: visit.target === "dog" ? -1 : 1,
          stride: Math.sin(this.time * 6), behindCounter: false };
        this.pets[visit.target].mood = "happy";
        if (visit.elapsed >= 3.2) {
          visit.phase = "returning";
          visit.elapsed = 0;
          this.pets[visit.target].mood = "idle";
          this.pets[visit.target].timer = 2;
          this.pets[visit.target].specialAt = Math.max(this.pets[visit.target].specialAt, this.time + 5);
        }
      }
    } else {
      this.worker = { ...HOME, action: this.time % 7.4 < 1.7 ? "wave" : "idle",
        facing: 1, stride: 0, behindCounter: true };
    }
    const snapshot = (animal: Animal): PetPose => {
      const { x, y, facing, gait, speed, mood, actionProgress } = this.pets[animal];
      return { x, y, facing, gait, speed, mood, actionProgress };
    };
    return { worker: { ...this.worker }, dog: snapshot("dog"), cat: snapshot("cat"),
      target: this.target, phase: this.phase, seconds: this.time };
  }
}