import { PhotoItem } from '../../types/models';

export const mockPhotos: PhotoItem[] = [
  {
    id: 'mock-1',
    source: require('../../../assets/mock/photo1.png'),
    label: 'Beach sunset',
  },
  {
    id: 'mock-2',
    source: require('../../../assets/mock/photo2.png'),
    label: 'City skyline',
  },
  {
    id: 'mock-3',
    source: require('../../../assets/mock/photo3.png'),
    label: 'Weekend hike',
  },
  {
    id: 'mock-4',
    source: require('../../../assets/mock/photo4.png'),
    label: 'Cafe latte',
  },
  {
    id: 'mock-5',
    source: require('../../../assets/mock/photo5.png'),
    label: 'Dog portrait',
  },
];
