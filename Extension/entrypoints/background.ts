import { getApiUrl } from '@/utils/http';
import { onMessage } from '@/utils/messaging';

export default defineBackground(() => {
  onMessage('uploadForm', async (data) => {
    const searchParams = new URLSearchParams();
    searchParams.set('author', data.data.author);
    searchParams.set('id', data.data.id);
    searchParams.set('service', data.data.serviceType);
    searchParams.set('imageLink', data.data.imageLink);
    if (data.data.prefilledTags) {
      searchParams.set('tags', data.data.prefilledTags);
    }

    browser.windows.create({
      url: `${browser.runtime.getURL('/upload.html')}?${searchParams.toString()}`,
      width: 400,
      height: 600,
      type: 'popup',
    });
  });

  onMessage('upload', async (data) => {
    const imageResp = await fetch(data.data.imageLink, {
      headers: {
        'Add-Origin': 'https://pixiv.net/',
      },
    });
    if (!imageResp.ok) {
      return await imageResp.text();
    }

    const imageBlob = await imageResp.blob();

    const formdata = new FormData();
    formdata.set('file', imageBlob);
    formdata.set('tags', data.data.tags);
    formdata.set('author', data.data.author);
    formdata.set('id', data.data.id);
    formdata.set('isLewd', data.data.isLewd ? 'true' : 'false');
    formdata.set('service', data.data.serviceType);

    const response = await fetch((await getApiUrl()) + '/api/posts', {
      method: 'POST',
      body: formdata,
      credentials: 'include',
    });

    if (!response.ok) {
      return await response.text();
    }
  });

  onMessage('fetch', async (data) => {
    const { url, init } = data.data;
    return await fetch(url, init).then((r) => r.json());
  });

  browser.declarativeNetRequest
    .updateSessionRules({
      removeRuleIds: [1],
      addRules: [
        {
          id: 1,
          priority: 1,
          condition: { requestDomains: ['i.pximg.net'] },
          action: {
            type: 'modifyHeaders' as chrome.declarativeNetRequest.RuleActionType,
            requestHeaders: [
              {
                header: 'Referer',
                operation: 'set' as chrome.declarativeNetRequest.HeaderOperation,
                value: 'https://www.pixiv.net/',
              },
            ],
          },
        },
      ],
    })
    .then(() => console.log('Added rules'));
});
