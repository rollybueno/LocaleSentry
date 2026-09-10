import { OPTIONAL_HOST_PERMISSIONS } from '../messages';

export async function hasHostPermission(): Promise<boolean> {
  return browser.permissions.contains({ origins: [...OPTIONAL_HOST_PERMISSIONS] });
}

export async function requestHostPermission(): Promise<boolean> {
  return browser.permissions.request({ origins: [...OPTIONAL_HOST_PERMISSIONS] });
}

export async function revokeHostPermission(): Promise<void> {
  await browser.permissions.remove({ origins: [...OPTIONAL_HOST_PERMISSIONS] });
}
