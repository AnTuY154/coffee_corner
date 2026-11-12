/** Deterministic local-only pet movement in the 480×320 Pixel Art world. */
export type PetPoint = Readonly<{x:number;y:number}>;
export type PetPose = PetPoint & Readonly<{direction:-1|1;moving:boolean}>;
export const PET_ROUTES = {
  dog: [{x:417,y:279},{x:453,y:279},{x:454,y:300},{x:389,y:299},{x:387,y:261},{x:417,y:259}],
  ginger: [{x:104,y:286},{x:106,y:251},{x:177,y:254},{x:177,y:297},{x:83,y:298}],
  gray: [{x:355,y:252},{x:382,y:255},{x:390,y:298},{x:358,y:300},{x:352,y:252}]
} as const satisfies Record<string, readonly PetPoint[]>;
/** Constant-speed closed path; independent phases come from caller. */
export function petRouteAt(seconds:number,route:readonly PetPoint[],speed:number,phase=0):PetPose{
  if(!route.length)return {x:0,y:0,direction:1,moving:false};
  if(route.length===1||!Number.isFinite(seconds)||speed<=0)return {...route[0],direction:1,moving:false};
  const lengths=route.map((p,i)=>Math.hypot(route[(i+1)%route.length].x-p.x,route[(i+1)%route.length].y-p.y));
  const total=lengths.reduce((a,b)=>a+b,0);
  if(total<=0)return {...route[0],direction:1,moving:false};
  let distance=((seconds*speed+phase)%total+total)%total;
  for(let i=0;i<route.length;i++){
    const length=lengths[i];
    if(distance<=length||i===route.length-1){
      const start=route[i],end=route[(i+1)%route.length],t=length>0?distance/length:0;
      return {x:start.x+(end.x-start.x)*t,y:start.y+(end.y-start.y)*t,direction:end.x<start.x?-1:1,moving:true};
    }
    distance-=length;
  }
  return {...route[0],direction:1,moving:false};
}
/** Seated guests render above opaque furniture; walkers retain feet y-sorting. */
export function guestVisualDepth(footY:number,seatId:string|null):number {
  return seatId?320+Math.round(footY):Math.round(footY);
}

/**
 * Simulated depth in the front-facing 3/4 view. Characters farther up the
 * garden are subtly smaller, while their feet always stay on the ground point.
 * This is 2.5D scaling, not an actual 3D Y-axis rotation.
 */
export function depthScaleAt(footY:number):number {
  const t=Math.max(0,Math.min(1,(footY-216)/92));
  return 0.83+0.23*t;
}
