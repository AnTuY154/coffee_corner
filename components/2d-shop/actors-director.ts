/** All scene and actor coordinates reference canonical shop.webp (1672 × 941). */
export const ARTBOARD = { width: 1672, height: 941 } as const;
export type Animal = "dog" | "cat";
export type PetMood = "idle" | "walk" | "turn" | "happy";
export type WorkerAction = "idle" | "wave" | "run" | "pet";
export type Vec = { x: number; y: number };
export type PetPose = Vec & {
  mood: PetMood; facing: 1 | -1; speed: number; gait: number;
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

const HOME = { x: 764, y: 697, scale: .83 };
const INIT: Record<Animal, Vec> = {
  dog: { x: 415, y: 875 }, cat: { x: 1420, y: 879 },
};
const LIMITS: Record<Animal, readonly [number, number]> = {
  dog: [330, 650], cat: [1300, 1550],
};
const clamp = (value: number, a: number, b: number) => Math.max(a, Math.min(b, value));
const d = (a: Vec, b: Vec) => Math.hypot(b.x - a.x, b.y - a.y);
const ease = (t: number) => t * t * (3 - 2 * t);
const speedFor = (animal: Animal) => animal === "dog" ? 46 : 33;

type PetState = PetPose & { desired: number; timer: number };
type Visit = {
  target: Animal; phase: "outbound" | "petting" | "returning";
  path: Vec[]; length: number; elapsed: number; duration: number;
};

/** Smooth piecewise route; endpoints have zero velocity on departure/arrival. */
export function interpolateRoute(points: Vec[], progress: number): Vec {
  const lengths = points.slice(1).map((p, i) => d(points[i], p));
  const total = lengths.reduce((sum, value) => sum + value, 0);
  let remain = total * ease(clamp(progress, 0, 1));
  for (let i = 0; i < lengths.length; i++) {
    const len = lengths[i];
    if (remain <= len || i === lengths.length - 1) {
      const t = len === 0 ? 1 : clamp(remain / len, 0, 1);
      const x0 = points[i].x, x1 = points[i + 1].x;
      const y0 = points[i].y, y1 = points[i + 1].y;
      return { x: x0 + (x1 - x0) * t, y: y0 + (y1 - y0) * t };
    }
    remain -= len;
  }
  return points[points.length - 1];
}

export class ActorsDirector {
  private time = 0;
  private random = 0x71E2026;
  private nextVisitAt = 16;
  private alternate: Animal = "dog";
  private queued: Animal | null = null;
  private visit: Visit | null = null;
  private worker: WorkerPose = {
    ...HOME, action: "wave", facing: 1, stride: 0, behindCounter: true,
  };
  private pets: Record<Animal, PetState> = {
    dog: { ...INIT.dog, mood: "idle", facing: 1, gait: 0, speed: 0, desired: 0, timer: 2 },
    cat: { ...INIT.cat, mood: "idle", facing: -1, gait: 0, speed: 0, desired: 0, timer: 3 },
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
    pet.desired = 0;
    pet.timer = 12;
    const targetX = target === "dog"
      ? clamp(pet.x + 100, 450, 720)
      : clamp(pet.x - 104, 1160, 1420);
    // The shop has only one accessible counter exit on the right.
    const path: Vec[] = [
      HOME, { x: 905, y: 697 }, { x: 1053, y: 720 },
      { x: 1058, y: 815 },
      ...(target === "dog" ? [{ x: 820, y: 855 }] : [{ x: 1192, y: 850 }]),
      { x: targetX, y: pet.y },
    ];
    const length = path.slice(1).reduce((sum, pt, i) => sum + d(path[i], pt), 0);
    this.visit = { target, phase: "outbound", path, length, elapsed: 0, duration: length / 210 };
    this.alternate = target === "dog" ? "cat" : "dog";
  }

  step(deltaSeconds: number, reducedMotion = false): WorldPose {
    const dt = clamp(Number.isFinite(deltaSeconds) ? deltaSeconds : 0, 0, .05);
    if (reducedMotion) {
      return {
        worker: { ...HOME, action: "idle", facing: 1, stride: 0, behindCounter: true },
        dog: { ...INIT.dog, mood: "idle", facing: 1, gait: 0, speed: 0 },
        cat: { ...INIT.cat, mood: "idle", facing: -1, gait: 0, speed: 0 },
        phase: "idle", target: null, seconds: this.time,
      };
    }
    this.time += dt;
    if (!this.visit && this.time >= this.nextVisitAt) this.startVisit(this.alternate);
    for (const animal of ["dog", "cat"] as const) {
      const pet = this.pets[animal];
      if (this.visit?.target === animal) {
        pet.desired = 0;
        pet.speed += (0 - pet.speed) * Math.min(1, dt * 9);
        pet.mood = this.visit.phase === "petting" ? "happy" : "idle";
        continue;
      }
      pet.timer -= dt;
      if (pet.timer <= 0) {
        pet.timer = 2.8 + this.rand() * 3.5;
        const [left, right] = LIMITS[animal];
        const direction: 1 | -1 = pet.x >= right - 42 ? -1 : pet.x <= left + 42 ? 1 : this.rand() < .5 ? -1 : 1;
        pet.desired = this.rand() < .27 ? 0 : direction * speedFor(animal);
      }
      const desired = pet.desired;
      const opposite = pet.speed * desired < 0;
      // Decelerate before reversing direction; no instant horizontal flip.
      const accelerating = opposite ? 150 : Math.abs(desired) < .1 ? 95 : 72;
      const amount = Math.min(Math.abs(desired - pet.speed), accelerating * dt);
      pet.speed += Math.sign(desired - pet.speed) * amount;
      if (Math.abs(pet.speed) < .015) pet.speed = 0;
      const previousX = pet.x;
      const [left, right] = LIMITS[animal];
      pet.x = clamp(pet.x + pet.speed * dt, left, right);
      if (pet.x === left || pet.x === right) {
        pet.speed = 0; pet.desired = 0; pet.timer = .3;
      }
      const traveled = Math.abs(pet.x - previousX);
      // Drive gait using actual world displacement, not wall-clock time:
      // feet stop stepping whenever the character stops moving.
      pet.gait += traveled / (animal === "dog" ? 33 : 29) * Math.PI * 2;
      if (pet.speed > 4) pet.facing = 1;
      if (pet.speed < -4) pet.facing = -1;
      pet.mood = opposite ? "turn" : Math.abs(pet.speed) >= 2 ? "walk" : "idle";
    }

    const visit = this.visit;
    if (visit) {
      visit.elapsed += dt;
      if (visit.phase === "outbound" || visit.phase === "returning") {
        const outbound = visit.phase === "outbound";
        const progress = clamp(visit.elapsed / visit.duration, 0, 1);
        const position = interpolateRoute(visit.path, outbound ? progress : 1 - progress);
        const lookAhead = interpolateRoute(visit.path, outbound
          ? clamp(progress + .005, 0, 1) : clamp(1 - progress - .005, 0, 1));
        const face = Math.abs(lookAhead.x - position.x) >= 1
          ? (lookAhead.x < position.x ? -1 : 1) : this.worker.facing;
        this.worker = {
          ...position,
          scale: .83 + .08 * clamp((position.y - 697) / 175, 0, 1),
          action: "run", facing: face,
          stride: Math.sin(this.time * 15),
          behindCounter: position.x < 1025 && position.y < 730,
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
            this.nextVisitAt = this.time + 22 + this.rand() * 12;
            if (this.queued) { const target = this.queued; this.queued = null; this.startVisit(target); }
          }
        }
      } else {
        this.worker = {
          ...visit.path[visit.path.length - 1],
          scale: .9, action: "pet", facing: visit.target === "dog" ? -1 : 1,
          stride: Math.sin(this.time * 7), behindCounter: false,
        };
        this.pets[visit.target].mood = "happy";
        if (visit.elapsed >= 3.3) {
          visit.phase = "returning"; visit.elapsed = 0;
          this.pets[visit.target].mood = "idle";
          this.pets[visit.target].timer = 2;
        }
      }
    } else {
      this.worker = { ...HOME, action: this.time % 7 < 1.6 ? "wave" : "idle", facing: 1, stride: 0, behindCounter: true };
    }
    return {
      worker: { ...this.worker },
      dog: { x: this.pets.dog.x, y: this.pets.dog.y, facing: this.pets.dog.facing, mood: this.pets.dog.mood, gait: this.pets.dog.gait, speed: this.pets.dog.speed },
      cat: { x: this.pets.cat.x, y: this.pets.cat.y, facing: this.pets.cat.facing, mood: this.pets.cat.mood, gait: this.pets.cat.gait, speed: this.pets.cat.speed },
      target: this.target, phase: this.phase, seconds: this.time,
    };
  }
}