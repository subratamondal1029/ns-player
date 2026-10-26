import { MediaNotificationProps } from "@/types/notification.types";
import React from "react";

/**
 * Base fallback MediaNotification component.
 * Returns null on unsupported or default platforms.
 */
const MediaNotification: React.FC<MediaNotificationProps> = () => {
  return null;
};

export default MediaNotification;
