type ClassValue = string | number | false | null | undefined | ClassValue[] | Record<string, boolean | null | undefined>;

function flattenClassValue(value: ClassValue): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap(flattenClassValue);
  if (typeof value === 'object') return Object.entries(value).filter(([, enabled]) => Boolean(enabled)).map(([key]) => key);
  return String(value).split(/\s+/).filter(Boolean);
}

export function cn(...inputs: ClassValue[]) {
  return inputs.flatMap(flattenClassValue).join(' ');
}

export const isIframe = typeof window !== 'undefined' && window.self !== window.top;

export const safeDecodeURIComponent = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};
