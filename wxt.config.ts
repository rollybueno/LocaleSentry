import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'LocaleSentry',
    description:
      'Audit localization, hreflang, language metadata, and multilingual issues directly in your browser.',
    permissions: ['activeTab', 'scripting', 'storage', 'sidePanel'],
    optional_host_permissions: ['*://*/*'],
    action: {
      default_title: 'LocaleSentry',
    },
  },
  hooks: {
    'build:manifestGenerated'(_wxt, manifest) {
      delete manifest.host_permissions;
    },
  },
});
