import * as MediaLibrary from 'expo-media-library';

export type PhotoPermissionResponse = MediaLibrary.PermissionResponse & {
  accessPrivileges?: MediaLibrary.PermissionAccessPrivileges;
};

export async function getPhotoPermissions(): Promise<PhotoPermissionResponse> {
  return MediaLibrary.getPermissionsAsync();
}

export async function requestPhotoPermissions(): Promise<PhotoPermissionResponse> {
  return MediaLibrary.requestPermissionsAsync();
}
