type AppParamOptions = {
  defaultValue?: string;
  removeFromUrl?: boolean;
};

type StorageLike = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

const memoryStorage = new Map<string, string>();
const isNode = typeof window === 'undefined';
const windowObj = isNode ? null : window;
const storage: StorageLike = windowObj?.localStorage ?? {
  getItem: (key) => memoryStorage.get(key) ?? null,
  setItem: (key, value) => memoryStorage.set(key, value),
  removeItem: (key) => memoryStorage.delete(key)
};

const toSnakeCase = (str: string) => str.replace(/([A-Z])/g, '_$1').toLowerCase();

export const getAppParamValue = (paramName: string, { defaultValue, removeFromUrl = false }: AppParamOptions = {}) => {
  if (isNode || !windowObj) return defaultValue;

  const storageKey = `base44_${toSnakeCase(paramName)}`;
  const urlParams = new URLSearchParams(windowObj.location.search);
  const searchParam = urlParams.get(paramName);

  if (removeFromUrl) {
    urlParams.delete(paramName);
    const newUrl = `${windowObj.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ''}${windowObj.location.hash}`;
    windowObj.history.replaceState({}, document.title, newUrl);
  }

  if (searchParam) {
    storage.setItem(storageKey, searchParam);
    return searchParam;
  }

  if (defaultValue) {
    storage.setItem(storageKey, defaultValue);
    return defaultValue;
  }

  return storage.getItem(storageKey);
};

export const getAppParams = () => {
  if (getAppParamValue('clear_access_token') === 'true') {
    storage.removeItem('base44_access_token');
    storage.removeItem('token');
  }

  return {
    appId: getAppParamValue('app_id', { defaultValue: process.env.NEXT_PUBLIC_BASE44_APP_ID }),
    token: getAppParamValue('access_token', { removeFromUrl: true }),
    fromUrl: getAppParamValue('from_url', { defaultValue: windowObj?.location.href }),
    functionsVersion: getAppParamValue('functions_version', { defaultValue: process.env.NEXT_PUBLIC_BASE44_FUNCTIONS_VERSION }),
    appBaseUrl: getAppParamValue('app_base_url', { defaultValue: process.env.NEXT_PUBLIC_BASE44_APP_BASE_URL })
  };
};

export const appParams = { ...getAppParams() };
