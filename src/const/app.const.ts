export const APP_NAME = 'SpoolmentBridge';
export const APP_USER_AGENT =
  'SpoolmentBridge/0.1.0 (+https://github.com/TheDelta/SpoolmentBridge)';

export function isEnvValueTruthy(v: unknown) {
  if (typeof v === 'string') {
    return /(1|on|y(es)|true)/.test(v);
  } else if (typeof v === 'number') {
    return v > 0;
  } else if (typeof v === 'boolean' && v) {
    return true;
  }

  return false;
}
