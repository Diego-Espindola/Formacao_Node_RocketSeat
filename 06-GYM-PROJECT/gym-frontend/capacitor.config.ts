import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { CapacitorConfig } from '@capacitor/cli';

interface CapacitorEnv {
  appId: string;
  appName: string;
  serverUrl: string;
  allowNavigation: string[];
}

const envPath = join(__dirname, 'capacitor.env.json');
const env = JSON.parse(readFileSync(envPath, 'utf8')) as CapacitorEnv;

const config: CapacitorConfig = {
  appId: env.appId,
  appName: env.appName,
  webDir: 'dist/gym-frontend/browser',
  server: {
    url: env.serverUrl,
    cleartext: env.serverUrl.startsWith('http://'),
    androidScheme: 'https',
    allowNavigation: env.allowNavigation,
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#020617',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: '#020617',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#020617',
      overlaysWebView: false,
    },
  },
};

export default config;
