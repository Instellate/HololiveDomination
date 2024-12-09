import { ServiceType } from '@/utils/messaging';
import HololiveTalents from '@/hololive-talents.json';
import HololiveGens from '@/hololive-gens.json';
import './style.css'

type PixivOEmbed = {
  version: string;
  type: string;
  height: number;
  width: number;
  work_type: string;
  html: string;
  title: string;
  thumbnail_url: string;
  author_name: string;
  author_url: string;
  provider_name: string;
  provider_url: string;
}

export default defineContentScript({
  matches: ["https://*.pixiv.net/*", "https://pixiv.net/*"],
  main() {
    const mutationObserver = new window.MutationObserver(injectButton);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    function injectButton() {
      const image: null | HTMLAnchorElement = document.querySelector(".gtm-expand-full-size-illust");
      if (!image) {
        return;
      }

      const toolbar: Element | null = image
        .parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.querySelector('div:nth-of-type(5)>div>div:nth-of-type(2)>section') ?? null;
      if (!toolbar) {
        return;
      }

      if (toolbar.querySelector("#holo-button")) {
        return;
      }

      const button = document.createElement("button");
      button.id = "holo-button";
      button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#e8eaed"><path d="M440-160v-326L336-382l-56-58 200-200 200 200-56 58-104-104v326h-80ZM160-600v-120q0-33 23.5-56.5T240-800h480q33 0 56.5 23.5T800-720v120h-80v-120H240v120h-80Z"/></svg>`;
      // I don't like this inner html but it will work for now.

      button.addEventListener('click', async () => {
        const imageLink = image.href;

        const embedLink =
          (document.querySelector('[type="application/json+oembed"]') as HTMLAnchorElement | null)?.href;
        if (!embedLink) {
          return;
        }

        const embedInfo
          = await sendMessage('fetch', { url: embedLink }) as PixivOEmbed;

        const author = embedInfo.author_name;

        const unfilteredTags = document.title
          .split('/')[0]
          .trim()
          .split(', ')
          .map(s => s.trim().toLowerCase().replaceAll(' ', '_'));

        const filteredTags = [];
        for (const tag of unfilteredTags) {
          const newTag1 = HololiveTalents.find(t => tag === t);
          if (newTag1) {
            filteredTags.push(newTag1);
            continue;
          }

          const reversed = tag.split('_').reverse().join('_');
          const newTag2 = HololiveTalents.find(t => reversed === t);
          if (newTag2) {
            filteredTags.push(newTag2);
          }
        }

        for (const tag of filteredTags) {
          const gen = (HololiveGens as Record<string, string>)[tag];
          if (!gen) {
            continue;
          }

          if (!filteredTags.includes(gen)) {
            filteredTags.push(gen);
          }
        }

        const postIdExec = /\/en\/artworks\/([0-9]+)(?:.*)/i.exec(window.location.pathname);
        if (!postIdExec) {
          return;
        }
        const postId = postIdExec[1];

        await sendMessage('uploadForm', {
          author: author,
          id: postId,
          serviceType: ServiceType.Pixiv,
          imageLink,
          prefilledTags: filteredTags.join(' '),
        });
      })

      const thirdElement = toolbar.children.item(3);
      if (thirdElement) {
        toolbar.insertBefore(button, thirdElement);
      } else {
        toolbar.appendChild(button);
      }
    }
  }
})