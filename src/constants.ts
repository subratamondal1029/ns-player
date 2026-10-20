export const APP_NAME = "NS Player";

// web
export const SERVER_URL = `${process.env.EXPO_PUBLIC_SERVER_URI ?? ""}/api`; // current host (/) for production

// IndexDB (web)
export const DB_NAME = "ns-player";

export const DIR_STORE_NAME = "directories";
export const DIR_STORE_KEY = "dir_main";

// local storage (web)
export const APP_CONFIG_STORE_KEY = "config";

// AsyncStorage (Android)
export const ASYNC_STORAGE_DIR_KEY = "@ns-player/dir_main";
export const ASYNC_STORAGE_TIMESTAMP_KEY = "@ns-player/timestamp";
export const ASYNC_STORAGE_CONFIG_KEY = "@ns-player/config";
