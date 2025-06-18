// Helper functions for debugging
export const safeStringify = (obj: any): string => {
  try {
    return JSON.stringify(obj, (key, value) => {
      if (value === undefined) {
        return 'undefined';
      }
      if (typeof value === 'function') {
        return value.toString().slice(0, 100) + '...';
      }
      return value;
    }, 2);
  } catch (err) {
    return `[Error during JSON.stringify: ${err}]`;
  }
};

export const logDebug = (label: string, data: any): void => {
  console.log(`[DEBUG] ${label}:`, safeStringify(data));
};
