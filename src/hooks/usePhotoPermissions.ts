import { useCallback, useEffect, useState } from 'react';
import { getPhotoPermissions, PhotoPermissionResponse, requestPhotoPermissions } from '../services/photoPermissionsService';

export function usePhotoPermissions() {
  const [permission, setPermission] = useState<PhotoPermissionResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getPhotoPermissions();
      setPermission(response);
    } finally {
      setLoading(false);
    }
  }, []);

  const request = useCallback(async () => {
    setLoading(true);
    try {
      const response = await requestPhotoPermissions();
      setPermission(response);
      return response;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    permission,
    loading,
    refresh,
    request,
  };
}
