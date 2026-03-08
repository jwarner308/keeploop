import { ImageSourcePropType } from 'react-native';

export type PhotoItem = {
  id: string;
  source: ImageSourcePropType;
  uri?: string;
  label?: string;
};

export type SessionAction = 'keep' | 'delete';

export type SessionHistoryEntry = {
  id: string;
  action: SessionAction;
};
