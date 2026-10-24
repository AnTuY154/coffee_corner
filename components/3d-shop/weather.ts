export type WeatherMode = "sunny" | "overcast" | "windy" | "rainy";
/** A simulated repeating game-world weather cycle, not a live weather forecast. */
export const WEATHER_SEQUENCE: readonly WeatherMode[] = ["sunny","overcast","windy","rainy"];
export const WEATHER_INTERVAL_MS = 45_000;
export const WEATHER_LABELS:Record<WeatherMode,string>={
 sunny:"Nắng ấm",overcast:"Trời râm",windy:"Có gió",rainy:"Mưa nhẹ"
};
export type WeatherProfile={sky:string;fog:string;sun:number;ambient:number;hemi:number;cloud:number;wind:number;rain:number};
export const WEATHER_PROFILE:Record<WeatherMode,WeatherProfile>={
 sunny:{sky:"#9edaf2",fog:"#d8ebd3",sun:2.35,ambient:.44,hemi:1.25,cloud:.25,wind:.16,rain:0},
 overcast:{sky:"#aabfc3",fog:"#c2d1cd",sun:.75,ambient:.73,hemi:.89,cloud:.91,wind:.28,rain:0},
 windy:{sky:"#97cddd",fog:"#ccded1",sun:1.5,ambient:.58,hemi:1.06,cloud:.67,wind:1,rain:0},
 rainy:{sky:"#748f9e",fog:"#a0b6b8",sun:.47,ambient:.7,hemi:.8,cloud:1,wind:.75,rain:1}
};
export function nextWeather(mode:WeatherMode):WeatherMode{
 return WEATHER_SEQUENCE[(WEATHER_SEQUENCE.indexOf(mode)+1)%WEATHER_SEQUENCE.length];
}
