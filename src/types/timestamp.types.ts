type position = {
  index: number;
  timestamp: number;
};

export type Timestamp = {
  playlist: string;
  previous: position;
  current: position;
};
