import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: 'chrome',
  runner: {
    chromiumArgs: ['--user-data-dir=./.wxt/chrome-data'],
  },
  manifest: (env) => {
    let additionalData: object;
    if (env.browser === 'firefox') {
      additionalData = {
        optional_permissions: ['*://*/*'],
      };
    } else {
      additionalData = {
        optional_host_permissions: ['*://*/*'],
      };
    }

    return {
      permissions: ['storage'],
      host_permissions: [
        'https://localhost/*',
        'https://*.pximg.net/*',
        'https://*.pixiv.net/*',
        'https://raw.githubusercontent.com/*',
      ],
      browser_specific_settings: {
        gecko: {
          id: 'hololive-domination@instellate.xyz',
        },
      },
      description: 'A extension to quickly upload to the hololive domination API',
      ...additionalData,
    };
  },
});
