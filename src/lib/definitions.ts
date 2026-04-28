
export interface BarcodeScannerPlugin {
  isSupported(): Promise<{ supported: boolean }>;
  startScan(options: { targetedFormats: string[] }): Promise<{ hasContent: boolean; content: string }>;
  stopScan(): Promise<void>;
  checkPermission(options: { force: boolean }): Promise<{ granted: boolean }>;
  enableTorch(): Promise<void>;
  disableTorch(): Promise<void>;
}
