export type DeletionResult = {
  deletedIds: string[];
  failedIds: string[];
  mode: 'simulated';
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function deletePhotos(ids: string[]): Promise<DeletionResult> {
  await delay(400);
  return {
    deletedIds: ids,
    failedIds: [],
    mode: 'simulated',
  };
}
