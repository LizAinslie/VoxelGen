import SimplexNoise from "simplex-noise";

export const sleep = ms => new Promise(r => setTimeout(r, ms))

export const simplex = new SimplexNoise();

export function normalizeNoise(noise) {
  return (noise + 1) * 0.5
}
