import type { SubtitleEntry } from "@/types/player.types";
import { parse } from "@plussub/srt-vtt-parser";

const subtitleParser = (raw: string): SubtitleEntry[] | null => {
  try {
    return parse(raw).entries;
  } catch (error) {
    console.error("Error occurred while parsing subtitle:", error);
    return null;
  }
};

const findSubtitle = (
  subs: SubtitleEntry[],
  currentTime: number,
  offSet = 0.2,
): string => {
  const cues = [];

  for (let i = 0; i < subs.length; i++) {
    if (cues.length >= 2) break;

    const sub = subs[i];
    const text = sub.text.trim().replaceAll("\n", " ");
    if (
      sub.from / 1000 <= currentTime &&
      currentTime < sub.to / 1000 + offSet &&
      text
    ) {
      if (text.startsWith("♫") && cues[0]?.startsWith("♫")) {
        cues.unshift(text);
      } else {
        cues.push(text);
      }
    }
  }

  if (cues.length === 0) return "";
  return cues.join("\n");
};

export { findSubtitle, subtitleParser };
