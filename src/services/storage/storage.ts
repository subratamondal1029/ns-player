import { Platform } from "react-native";

const saveDir = async () => {
  throw new Error(`Directory saving is not supported in ${Platform.OS}`);
};

const loadDir = async () => {
  throw new Error(`Directory loading is not supported in ${Platform.OS}`);
};


export {saveDir, loadDir};