"use client";
import type { ImageLoaderProps } from "next/image";
export default function pagesImageLoader({src}:ImageLoaderProps):string {
  // All assets are local SVGs; Pages runs under /coffee_corner, not the domain root.
  return (process.env.NEXT_PUBLIC_BASE_PATH || "") + src;
}
