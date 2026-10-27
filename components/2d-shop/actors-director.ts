/**
 * One clock and one director for three real, independent 2D actors.
 * Coordinates are in the approved 1536×1024 artboard, never viewport pixels.
 * Pet reactions begin on the SAME frame that the employee starts petting.
 */
export type Animal = "dog" | "cat";
export type Mood = "idle" | "walk" | "happy";
export type WorkerAction = "idle" | "wave" | "run" | "pet";
export type Point = { x: number; y: number };
export type CharacterPoint = Point & { scale: number };
export type AnimalPose = Point & { facing: 1 | -1; mood: Mood };
export type WorkerPose = CharacterPoint & {
  facing: 1 | -1;
  action: WorkerAction;
  stride: number;
  counterMask: boolean;
};
export type WorldPose = {
  worker: WorkerPose;
  dog: AnimalPose;
  cat: AnimalPose;
  phase: "idle" | "outbound" | "petting" | "returning";
  target: Animal | null;
  seconds: number;
};

const HOME: CharacterPoint = { x: 690, y: 648, scale: .80 };
const DOG_HOME: Point = { x: 383, y: 963 };
const CAT_HOME: Point = { x: 1352, y: 1006 };
const PET_BOUNDS: Record<Animal, [number, number]> = {
  dog: [310, 575],
  cat: [1255, 1440],
};
const WALK_SPEED = 192;

type PetState = Point & {
  facing: 1 | -1;
  mood: Mood;
  timer: number;
  direction: 1 | -1;
};
type Visit = {
  target: Animal;
  phase: "outbound" | "petting" | "returning";
  elapsed: number;
  route: CharacterPoint[];
  length: number;
  duration: number;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const smooth = (t: number) => t * t * (3 - 2 * t);

function pathLength(route: CharacterPoint[]) {
  let length = 0;
  for (let i = 1; i < route.length; i++) length += distance(route[i - 1], route[i]);
  return length;
}

function atDistance(route: CharacterPoint[], travel: number): CharacterPoint {
  let left = travel;
  for (let i = 1; i < route.length; i++) {
    const from = route[i - 1], to = route[i];
    const segment = distance(from, to);
    if (left <= segment || i === route.length - 1) {
      const progress = segment ? clamp(left / segment, 0, 1) : 1;
      return {
        x: from.x + (to.x - from.x) * progress,
        y: from.y + (to.y - from.y) * progress,
        scale: from.scale + (to.scale - from.scale) * progress,
      };
    }
    left -= segment;
  }
  return route[route.length - 1];
}

export class ActorsDirector {
  private time = 0;
  private nextVisitAt = 14;
  private alternate: Animal = "dog";
  private queued: Animal | null = null;
  private visit: Visit | null = null;
  private worker: WorkerPose = {
    ...HOME, facing: 1, action: "wave", stride: 0, counterMask: true,
  };
  private pets: Record<Animal, PetState> = {
    dog: { ...DOG_HOME, facing: 1, direction: 1, mood: "idle", timer: 3 },
    cat: { ...CAT_HOME, facing: -1, direction: -1, mood: "idle", timer: 6 },
  };

  get phase(): WorldPose["phase"] {
    if (!this.visit) return "idle";
    return this.visit.phase === "petting" ? "petting" :
      this.visit.phase === "outbound" ? "outbound" : "returning";
  }

  get target(): Animal | null { return this.visit?.target ?? null; }

  /**
   * External user clicks take priority. If the employee is occupied, queue
   * exactly one new visit instead of interrupting the active petting action.
   */
  request(target: Animal) {
    if (this.visit) { this.queued = target; return; }
    this.begin(target);
  }

  private begin(target: Animal) {
    const pet = this.pets[target];
    pet.mood = "idle";
    pet.timer = 12;
    const meetX = target === "dog" ?
      clamp(pet.x + 130, 445, 710) : clamp(pet.x - 132, 1070, 1300);
    const destination: CharacterPoint = {
      x: meetX, y: target === "dog" ? 962 : 986, scale: .93,
    };
    // Walk behind the counter first, exit at its right end, then run across
    // the pavement. Avoid walking straight through the wood counter.
    const route: CharacterPoint[] = [
      { ...HOME },
      { x: 840, y: 654, scale: .81 },
      { x: 956, y: 729, scale: .88 },
      { x: 969, y: 851, scale: .98 },
      ...(target === "dog"
        ? [{ x: 818, y: 923, scale: .99 }]
        : [{ x: 1103, y: 929, scale: .96 }]),
      destination,
    ];
    const length = pathLength(route);
    this.visit = {
      target, route, length, duration: length / WALK_SPEED,
      phase: "outbound", elapsed: 0,
    };
    this.alternate = target === "dog" ? "cat" : "dog";
  }

  step(seconds: number, reduceMotion = false): WorldPose {
    // Offscreen/hidden tabs should not jump an entire choreographed sequence.
    const dt = clamp(Number.isFinite(seconds) ? seconds : 0, 0, .05);
    if (reduceMotion) {
      return {
        worker: { ...HOME, facing: 1, action: "idle", stride: 0, counterMask: true },
        dog: { ...DOG_HOME, facing: 1, mood: "idle" },
        cat: { ...CAT_HOME, facing: -1, mood: "idle" },
        phase: "idle", target: null, seconds: this.time,
      };
    }
    this.time += dt;
    if (!this.visit && this.time >= this.nextVisitAt) this.begin(this.alternate);
    for (const animal of ["dog", "cat"] as const) {
      const pet = this.pets[animal];
      const participating = this.visit?.target === animal;
      if (participating) {
        pet.mood = this.visit?.phase === "petting" ? "happy" : "idle";
        continue;
      }
      pet.timer -= dt;
      if (pet.mood === "idle" && pet.timer <= 0) {
        pet.mood = "walk";
        pet.timer = 2 + Math.random() * 2.5;
        const [min, max] = PET_BOUNDS[animal];
        pet.direction = pet.x > max - 28 ? -1 :
          pet.x < min + 28 ? 1 : Math.random() < .5 ? -1 : 1;
        pet.facing = pet.direction;
      } else if (pet.mood === "walk") {
        const [min, max] = PET_BOUNDS[animal];
        pet.x = clamp(pet.x + pet.direction * (animal === "dog" ? 35 : 28) * dt, min, max);
        if (pet.x === min || pet.x === max || pet.timer <= 0) {
          pet.mood = "idle";
          pet.timer = 2.5 + Math.random() * 4;
        }
      }
    }
    const visit = this.visit;
    if (visit) {
      visit.elapsed += dt;
      if (visit.phase === "outbound") {
        const lengthSoFar = Math.min(visit.length, visit.elapsed * WALK_SPEED);
        const pos = atDistance(visit.route, lengthSoFar);
        const next = atDistance(visit.route, Math.min(visit.length, lengthSoFar + 4));
        this.worker = {
          ...pos, facing: next.x < pos.x ? -1 : 1,
          action: "run", stride: Math.sin(this.time * 18),
          counterMask: lengthSoFar < 255,
        };
        if (visit.elapsed >= visit.duration) {
          // Both actors enter the interaction frame together.
          visit.phase = "petting"; visit.elapsed = 0;
        }
      } else if (visit.phase === "petting") {
        this.worker = {
          ...visit.route[visit.route.length - 1],
          facing: visit.target === "dog" ? -1 : 1,
          action: "pet", stride: Math.sin(this.time * 7),
          counterMask: false,
        };
        this.pets[visit.target].mood = "happy";
        if (visit.elapsed >= 3.4) {
          visit.phase = "returning";
          visit.elapsed = 0;
          this.pets[visit.target].mood = "idle";
          this.pets[visit.target].timer = 2.5;
        }
      } else {
        const distanceHome = Math.max(0, visit.length - visit.elapsed * WALK_SPEED);
        const pos = atDistance(visit.route, distanceHome);
        const next = atDistance(visit.route, Math.max(0, distanceHome - 4));
        this.worker = {
          ...pos, facing: next.x < pos.x ? -1 : 1,
          action: "run", stride: Math.sin(this.time * 18),
          counterMask: distanceHome < 255,
        };
        if (visit.elapsed >= visit.duration) {
          this.worker = { ...HOME, facing: 1, action: "idle", stride: 0, counterMask: true };
          this.visit = null;
          this.nextVisitAt = this.time + 24 + Math.random() * 13;
          if (this.queued) {
            const queued = this.queued;
            this.queued = null;
            this.begin(queued);
          }
        }
      }
    } else {
      this.worker = {
        ...HOME, facing: 1,
        action: this.time % 6.8 < 1.45 ? "wave" : "idle",
        stride: 0, counterMask: true,
      };
    }
    return {
      worker: { ...this.worker },
      dog: { x: this.pets.dog.x, y: this.pets.dog.y, facing: this.pets.dog.facing, mood: this.pets.dog.mood },
      cat: { x: this.pets.cat.x, y: this.pets.cat.y, facing: this.pets.cat.facing, mood: this.pets.cat.mood },
      phase: this.phase, target: this.target, seconds: this.time,
    };
  }
}
