import React from "react";
import {Composition} from "remotion";
import {Short, ShortProps, getTotalFrames} from "./Short";

// ====== GANTI DATA DI SINI ======
const defaultProps: ShortProps = {
  hook: "Siapa hewan paling tukang tidur?",
  unit: "jam",
  max: 24,
  items: [
    {label: "Koala", emoji: "🐨", value: 20, color: "#FF6B4A"},
    {label: "Kucing", emoji: "🐱", value: 14, color: "#FFC93C"},
    {label: "Manusia", emoji: "🧑", value: 8, color: "#3DDBD9"},
    {label: "Gajah", emoji: "🐘", value: 3, color: "#B59CFF"},
  ],
  statLine: "Koala tidur hampir sepanjang hari",
  outro: "Follow untuk infografis lainnya",
};

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Short"
    component={Short}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={getTotalFrames()}
    defaultProps={defaultProps}
  />
);
