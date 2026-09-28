import { VideoPlayer } from "expo-video";
import React from "react";

export type VideoControlProps = {
  children: React.ReactNode;
  title: string;
  onBack: () => void;
  player: VideoPlayer;
  progress?: number;
  isPlaying?: boolean;
};