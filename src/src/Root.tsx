import React from "react";
import {Composition} from "remotion";
import {Short, ShortProps, getTotalFrames} from "./Short";

const defaultProps: ShortProps = {
  hook: "Kamu pasti belum tahu ini",
  facts: [
    {
      emoji: "🐙",
      title: "Gurita punya tiga jantung",
      detail: "Dua memompa darah ke insang, satu ke seluruh tubuh.",
    },
    {
      emoji: "🍯",
      title: "Madu tidak pernah basi",
      detail: "Madu berusia ribuan tahun di makam Mesir masih aman dimakan.",
    },
    {
      emoji: "⚡",
      title: "Petir lebih panas dari Matahari",
      detail: "Suhunya bisa sekitar lima kali permukaan Matahari.",
    },
  ],
  outro: "Follow untuk fakta lainnya",
};

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Short"
    component={Short}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={getTotalFrames(defaultProps)}
    defaultProps={defaultProps}
    calculateMetadata={({props}) => ({
      durationInFrames: getTotalFrames(props),
    })}
  />
);
