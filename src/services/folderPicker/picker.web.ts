const pickDir = async (): Promise<FileSystemDirectoryHandle> => {
  try {
    const showDirectoryPicker = window.showDirectoryPicker;

    if (!showDirectoryPicker) {
      throw new Error("Directory picker is not supported in this environment", {
        cause: "CUSTOM",
      });
    }

    return await showDirectoryPicker();
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Directory selection cancelled", { cause: error });
    }

    if ((error as Error).cause === "CUSTOM") {
      throw error;
    } else {
      throw new Error("Failed to read directory", { cause: error });
    }
  }
};

export { pickDir };
