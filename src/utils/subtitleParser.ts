import type { SubtitleEntry } from "@/types/player.types";
import { parse } from "@plussub/srt-vtt-parser";

const subtitleParser = (raw: string): SubtitleEntry[] => {
  return parse(raw).entries;
};

const findSubtitle = (
  subs: SubtitleEntry[],
  currentTime: number,
  offSet = 0.2,
): string => {
  const subtitles = subs.filter(
    (sub) =>
      sub.from <= currentTime &&
      currentTime < sub.to + offSet &&
      sub.text.trim(),
  );

  if (subtitles.length === 0) {
    return "";
  }

  return subtitles.map((sub) => sub.text).join("\n");
};

export { findSubtitle, subtitleParser };
