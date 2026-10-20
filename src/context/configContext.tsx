import { getConfig, saveConfig as storeConfig } from "@/services/config/config";
import { Config } from "@/types/config.types";
import { createContext, useContext, useEffect, useState } from "react";

const defaultConfig: Config = {
  subtitle: false,
};

type TConfigContext = {
  config: Config;
  saveConfig: (key: keyof Config, value: Config[keyof Config]) => void;
};

const ConfigContext = createContext<TConfigContext | null>(null);

const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [config, setConfig] = useState<Config>(defaultConfig);

  const saveConfig = (key: keyof Config, value: Config[keyof Config]) => {
    const updated = { ...config, [key]: value };
    setConfig(updated);
    storeConfig(updated).catch(console.error);
  };

  useEffect(() => {
    getConfig()
      .then((config) => {
        if (config) {
          setConfig(config);
        }
      })
      .catch((error) => {
        console.error("Error fetching config:", error);
      });
  }, []);

  return (
    <ConfigContext.Provider value={{ config, saveConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};

const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
};

export { ConfigProvider, useConfig };
