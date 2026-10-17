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

export type Fact = {emoji: string; title: string; detail: string};
export type ShortProps = {hook: string; facts: Fact[]; outro: string};

const HOOK = 90;
const FACT = 105;
const OUTRO = 80;
const WIPE = 14;

export const getTotalFrames = (p: ShortProps) => HOOK + p.facts.length * FACT + OUTRO;

const PALETTE = {
  ink: "#16124A",
  sun: "#FFD23F",
  mint: "#2EE6A6",
  pink: "#FF5C93",
  paper: "#F7F4FF",
};
const BGS = [PALETTE.ink, PALETTE.pink, PALETTE.mint, PALETTE.sun, PALETTE.ink];
const FG = [PALETTE.paper, PALETTE.ink, PALETTE.ink, PALETTE.ink, PALETTE.sun];

// Teks muncul kata per kata dengan efek "pop"
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

// Latar belakang yang "menyapu" naik dari bawah saat scene berganti
const Scene: React.FC<{bg: string; first?: boolean; children: React.ReactNode}> = ({bg, first, children}) => {
  const frame = useCurrentFrame();
  const r = first
    ? 200
    : interpolate(frame, [0, WIPE], [0, 200], {
        easing: Easing.bezier(0.7, 0, 0.2, 1),
        extrapolateRight: "clamp",
      });
  return (
    <AbsoluteFill style={{background: bg, clipPath: `circle(${r}% at 50% 100%)`}}>
      {children}
    </AbsoluteFill>
  );
};

// Bentuk dekoratif yang berputar pelan
const Blob: React.FC<{color: string; top: number; left: number; size: number; speed: number}> = ({
  color,
  top,
  left,
  size,
  speed,
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        top,
        left,
        width: size,
        height: size,
        background: color,
        opacity: 0.18,
        borderRadius: "38% 62% 55% 45% / 50% 40% 60% 50%",
        transform: `rotate(${frame * speed}deg)`,
      }}
    />
  );
};

const Center: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill
    style={{justifyContent: "center", alignItems: "center", padding: "0 90px", gap: 54}}
  >
    {children}
  </AbsoluteFill>
);

const FactScene: React.FC<{fact: Fact; fg: string}> = ({fact, fg}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame: frame - WIPE, fps, config: {damping: 8, stiffness: 120}});
  const bob = Math.sin(frame / 8) * 10;
  return (
    <Center>
      <div
        style={{
          fontSize: 240,
          transform: `translateY(${bob}px) scale(${pop}) rotate(${interpolate(pop, [0, 1], [-25, 0])}deg)`,
        }}
      >
        {fact.emoji}
      </div>
      <Words text={fact.title} size={120} delay={WIPE + 6} color={fg} />
      <div style={{opacity: interpolate(frame, [WIPE + 40, WIPE + 55], [0, 1], {extrapolateRight: "clamp", extrapolateLeft: "clamp"})}}>
        <Words text={fact.detail} size={52} weight={500} delay={WIPE + 42} color={fg} />
      </div>
    </Center>
  );
};

export const Short: React.FC<ShortProps> = (props) => {
  const frame = useCurrentFrame();
  const total = getTotalFrames(props);
  const {hook, facts, outro} = props;

  // Daftar scene berurutan
  const scenes: {from: number; dur: number; node: (fg: string) => React.ReactNode}[] = [];
  let t = 0;
  scenes.push({
    from: t,
    dur: HOOK,
    node: (fg) => (
      <Center>
        <Words text={hook} size={140} delay={4} color={fg} />
      </Center>
    ),
  });
  t += HOOK;
  facts.forEach((f) => {
    scenes.push({from: t, dur: FACT, node: (fg) => <FactScene fact={f} fg={fg} />});
    t += FACT;
  });
  scenes.push({
    from: t,
    dur: OUTRO,
    node: (fg) => (
      <Center>
        <Words text={outro} size={120} delay={WIPE} color={fg} />
      </Center>
    ),
  });

  return (
    <AbsoluteFill style={{background: PALETTE.ink}}>
      {scenes.map((s, i) => {
        const isLast = i === scenes.length - 1;
        const ci = isLast ? BGS.length - 1 : Math.min(i, BGS.length - 2);
        const bg = BGS[ci];
        const fg = FG[ci];
        return (
          <Sequence
            key={i}
            from={s.from}
            // scene lama tetap tampil sampai sapuan scene baru selesai
            durationInFrames={s.dur + (isLast ? 0 : WIPE)}
          >
            <Scene bg={bg} first={i === 0}>
              <Blob color={fg} top={-200} left={-220} size={700} speed={0.4} />
              <Blob color={fg} top={1250} left={600} size={650} speed={-0.3} />
              {s.node(fg)}
            </Scene>
          </Sequence>
        );
      })}

      {/* Progress bar ala Shorts */}
      <div
        style={{
          position: "absolute",
          top: 70,
          left: 60,
          right: 60,
          height: 10,
          borderRadius: 5,
          background: "rgba(0,0,0,0.18)",
        }}
      >
        <div
          style={{
            width: `${(frame / total) * 100}%`,
            height: "100%",
            borderRadius: 5,
            background: PALETTE.paper,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

