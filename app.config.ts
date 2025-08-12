import 'dotenv/config';
import type { ExpoConfig } from '@expo/config-types';

export default ({ config }: { config: ExpoConfig }) => ({
  ...config,
  extra: {
    ...config.extra,
    pendoApiKey: process.env.PENDO_API_KEY,
  },
});


