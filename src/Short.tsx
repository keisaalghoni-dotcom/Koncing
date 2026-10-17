import React from "react";
import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {loadFont} from "@remotion/google-fonts/BricolageGrotesque";

const {fontFamily} = loadFont("normal", {weights: ["500", "800"], subsets: ["latin"]});

export type Item = {label: string; emoji: string; value: number; color: string};
export type ShortProps = {
  hook: string;
  unit: string;
  max: number;
  items: Item[];
  statLine: string;
  outro: string;
};

const HOOK = 75;
const CHART = 190;
const STAT = 100;
const OUTRO = 60;

export const getTotalFrames = () => HOOK + CHART + STAT + OUTRO;

const INK = "#101B3B";
const SNOW = "#F4F7FF";
const SUN = "#FFC93C";

// Grid latar yang bergeser pelan
const Grid: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: INK,
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.05) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.05) 2px, transparent 2px)",
        backgroundSize: "90px 90px",
        backgroundPosition: `0px ${frame * 0.8}px`,
      }}
    />
  );
};

const FadeIn: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 8], [0, 1], {extrapolateRight: "clamp"});
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

const Center: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{justifyContent: "center", alignItems: "center", padding: "0 90px", gap: 54}}>
    {children}
  </AbsoluteFill>
);

// Teks muncul kata per kata
const Words: React.FC<{text: string; size: number; weight?: number; delay?: number; color: string}> = ({
  text,
  size,
  weight = 800,
  delay = 0,
  color,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: `0 ${size * 0.28}px`,
        fontFamily,
        fontSize: size,
        fontWeight: weight,
        lineHeight: 1.08,
        color,
        textAlign: "center",
        letterSpacing: -1,
      }}
    >
      {text.split(" ").map((w, i) => {
        const s = spring({
          frame: frame - delay - i * 4,
          fps,
          config: {damping: 11, stiffness: 160, mass: 0.7},
        });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              transform: `scale(${interpolate(s, [0, 1], [0.4, 1])}) rotate(${interpolate(s, [0, 1], [-6, 0])}deg)`,
              opacity: interpolate(s, [0, 0.4], [0, 1], {extrapolateRight: "clamp"}),
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

const fmt = (v: number, shown: number) =>
  Number.isInteger(v) ? String(Math.round(shown)) : shown.toFixed(1);

// Grafik batang yang tumbuh satu per satu
const ChartScene: React.FC<{items: Item[]; unit: string; max: number}> = ({items, unit, max}) => {
  const frame = useCurrentFrame();
  const sorted = [...items].sort((a, b) => b.value - a.value);
  return (
    <AbsoluteFill style={{justifyContent: "center", padding: "0 80px", gap: 46}}>
      {sorted.map((it, i) => {
        const start = 8 + i * 16;
        const p = interpolate(frame, [start, start + 55], [0, 1], {
          easing: Easing.out(Easing.cubic),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const w = (it.value / max) * 620 * p;
        return (
          <div key={i} style={{display: "flex", flexDirection: "column", gap: 14, fontFamily, color: SNOW}}>
            <div
              style={{
                fontSize: 54,
                fontWeight: 500,
                opacity: interpolate(p, [0, 0.2], [0, 1], {extrapolateRight: "clamp"}),
              }}
            >
              {it.emoji} {it.label}
            </div>
            <div style={{display: "flex", alignItems: "center", gap: 24}}>
              <div style={{width: w, height: 84, borderRadius: 42, background: it.color}} />
              <div style={{fontSize: 64, fontWeight: 800, color: it.color}}>
                {fmt(it.value, it.value * p)} {unit}
              </div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// Angka juara dalam lingkaran progres
const StatScene: React.FC<{top: Item; max: number; unit: string; statLine: string}> = ({
  top,
  max,
  unit,
  statLine,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = interpolate(frame, [6, 60], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const R = 330;
  const C = 2 * Math.PI * R;
  const pop = spring({frame, fps, config: {damping: 9, stiffness: 120}});
  return (
    <AbsoluteFill
      style={{justifyContent: "center", alignItems: "center", gap: 46, fontFamily, color: SNOW}}
    >
      <div style={{fontSize: 110, transform: `scale(${pop})`}}>{top.emoji}</div>
      <div style={{fontSize: 76, fontWeight: 800}}>{top.label}</div>
      <div style={{position: "relative", width: 760, height: 760}}>
        <svg width={760} height={760} viewBox="0 0 760 760" style={{transform: "rotate(-90deg)"}}>
          <circle cx={380} cy={380} r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={44} />
          <circle
            cx={380}
            cy={380}
            r={R}
            fill="none"
            stroke={top.color}
            strokeWidth={44}
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - (top.value / max) * p)}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{fontSize: 260, fontWeight: 800, lineHeight: 1, color: top.color}}>
            {fmt(top.value, top.value * p)}
          </div>
          <div style={{fontSize: 64, fontWeight: 500}}>{unit}</div>
        </div>
      </div>
      <div style={{fontSize: 56, fontWeight: 500, textAlign: "center", padding: "0 90px"}}>{statLine}</div>
    </AbsoluteFill>
  );
};

const Pulse: React.FC = () => {
  const frame = useCurrentFrame();
  const s = 1 + Math.sin(frame / 5) * 0.12;
  return (
    <div
      style={{
        width: 120,
        height: 120,
        borderRadius: 60,
        background: SUN,
        transform: `scale(${s})`,
      }}
    />
  );
};

export const Short: React.FC<ShortProps> = ({hook, unit, max, items, statLine, outro}) => {
  const frame = useCurrentFrame();
  const total = getTotalFrames();
  const top = [...items].sort((a, b) => b.value - a.value)[0];

  return (
    <AbsoluteFill>
      <Grid />

      <Sequence from={0} durationInFrames={HOOK}>
        <FadeIn>
          <Center>
            <Words text={hook} size={140} delay={4} color={SNOW} />
          </Center>
        </FadeIn>
      </Sequence>

      <Sequence from={HOOK} durationInFrames={CHART}>
        <FadeIn>
          <ChartScene items={items} unit={unit} max={max} />
        </FadeIn>
      </Sequence>

      <Sequence from={HOOK + CHART} durationInFrames={STAT}>
        <FadeIn>
          <StatScene top={top} max={max} unit={unit} statLine={statLine} />
        </FadeIn>
      </Sequence>

      <Sequence from={HOOK + CHART + STAT} durationInFrames={OUTRO}>
        <FadeIn>
          <Center>
            <Words text={outro} size={110} delay={4} color={SNOW} />
            <Pulse />
          </Center>
        </FadeIn>
      </Sequence>

      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          top: 70,
          left: 60,
          right: 60,
          height: 10,
          borderRadius: 5,
          background: "rgba(255,255,255,0.15)",
        }}
      >
        <div
          style={{
            width: `${(frame / total) * 100}%`,
            height: "100%",
            borderRadius: 5,
            background: SUN,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
