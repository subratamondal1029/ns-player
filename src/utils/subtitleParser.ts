import { Dialogue, fromSrt } from "@ltftf/srt-parser-2";

const srtParser = (srt: string): Dialogue[] => {
  const subs = fromSrt(srt);
  return subs;
};

const findSubtitle = (
  subs: Dialogue[],
  currentTime: number,
  offSet = 0.2,
): string => {
  const subtitles = subs.filter(
    (sub) =>
      sub.startSeconds <= currentTime && currentTime < sub.endSeconds + offSet,
  );

  if (subtitles.length === 0) {
    return "";
  }

  return subtitles.map((sub) => sub.lines.join("\n")).join("\n");
};

export { findSubtitle, srtParser };
