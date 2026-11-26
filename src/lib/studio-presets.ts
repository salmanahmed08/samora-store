export interface BackdropPreset {
  id: string;
  name: string;
  subtitle: string;
  gradientColors: [string, string];
  floorColor: string;
  shadowColor: string;
}

export const BACKDROP_PRESETS: BackdropPreset[] = [
  {
    id: "warm_sandstone",
    name: "Warm Sandstone Atelier",
    subtitle: "Classic soft warm cream-beige studio wall with subtle floor horizon",
    gradientColors: ["#EAE2D6", "#DDD2C2"],
    floorColor: "#D3C7B6",
    shadowColor: "rgba(44, 34, 25, 0.28)",
  },
  {
    id: "classic_travertine",
    name: "Classic Travertine Stone",
    subtitle: "Subtle architectural stone backdrop with daylight vignette",
    gradientColors: ["#E4DDD3", "#CFC5B7"],
    floorColor: "#C3B8A8",
    shadowColor: "rgba(35, 30, 25, 0.26)",
  },
  {
    id: "editorial_taupe",
    name: "Editorial Warm Taupe",
    subtitle: "Rich greige-taupe fashion studio wall for high contrast",
    gradientColors: ["#D6CFC7", "#BEB5AA"],
    floorColor: "#B2A89C",
    shadowColor: "rgba(28, 24, 22, 0.32)",
  },
  {
    id: "heritage_olive",
    name: "Muted Heritage Olive Linen",
    subtitle: "Earthy warm sage-linen backdrop harmonizing with brand olive",
    gradientColors: ["#D8DBD2", "#C2C7BA"],
    floorColor: "#B5BCAD",
    shadowColor: "rgba(24, 30, 24, 0.28)",
  },
  {
    id: "pure_transparent",
    name: "Pure Transparent Cutout",
    subtitle: "Seamless transparent cutout blending into warm alabaster",
    gradientColors: ["transparent", "transparent"],
    floorColor: "transparent",
    shadowColor: "transparent",
  },
];
