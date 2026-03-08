import * as MediaLibrary from 'expo-media-library';
import { PhotoItem } from '../types/models';

export async function loadRecentPhotos(limit: number): Promise<PhotoItem[]> {
  const result = await MediaLibrary.getAssetsAsync({
    first: limit,
    mediaType: MediaLibrary.MediaType.photo,
    sortBy: [MediaLibrary.SortBy.creationTime],
  });

  return result.assets.map((asset) => ({
    id: asset.id,
    source: { uri: asset.uri },
    uri: asset.uri,
    label: asset.filename ? asset.filename.replace(/\.[^/.]+$/, '') : undefined,
  }));
}
