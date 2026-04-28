
import { WebPlugin } from '@capacitor/core';

import type { BarcodeScannerPlugin } from './definitions';

export class BarcodeScannerWeb extends WebPlugin implements BarcodeScannerPlugin {
  async isSupported(): Promise<{ supported: boolean }> {
    return { supported: false };
  }

  async startScan(_options: { targetedFormats: string[] }): Promise<{ hasContent: boolean; content: string }> {
    throw new Error('Barcode scanner is not supported on web');
  }

  async stopScan(): Promise<void> {
    // No-op on web
  }

  async checkPermission(_options: { force: boolean }): Promise<{ granted: boolean }> {
    throw new Error('Permissions are not applicable on web');
  }

  async enableTorch(): Promise<void> {
    throw new Error('Torch is not available on web');
  }

  async disableTorch(): Promise<void> {
    throw new Error('Torch is not available on web');
  }
}
