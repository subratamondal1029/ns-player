import { Dialogue, fromSrt } from "@ltftf/srt-parser-2";

const srtParser = (srt: string): Dialogue[] => {
  const subs = fromSrt(srt);
  return subs;
};

const findSubtitle = (subs: Dialogue[], currentTime: number) => {
  const subtitle = subs.find(
    (sub) => sub.startSeconds <= currentTime && currentTime < sub.endSeconds,
  );
  return subtitle ? subtitle.lines.join("\n") : "";
};

export { findSubtitle, srtParser };
