import * as MediaLibrary from 'expo-media-library';
import { PhotoItem } from '../types/models';

export async function loadRecentPhotos(limit: number): Promise<PhotoItem[]> {
  const result = await MediaLibrary.getAssetsAsync({
    first: limit,
    mediaType: MediaLibrary.MediaType.photo,
    sortBy: [MediaLibrary.SortBy.creationTime],
  });

  const resolved = await Promise.all(
    result.assets.map(async (asset) => {
      try {
        const info = await MediaLibrary.getAssetInfoAsync(asset);
        const resolvedUri = info.localUri ?? asset.uri;
        return {
          id: asset.id,
          source: { uri: resolvedUri },
          uri: resolvedUri,
          label: asset.filename ? asset.filename.replace(/\.[^/.]+$/, '') : undefined,
        } as PhotoItem;
      } catch (err) {
        return {
          id: asset.id,
          source: { uri: asset.uri },
          uri: asset.uri,
          label: asset.filename ? asset.filename.replace(/\.[^/.]+$/, '') : undefined,
        } as PhotoItem;
      }
    })
  );

  return resolved;
}
