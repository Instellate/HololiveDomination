import { sendMessage, ServiceType } from "@/utils/messaging";
import "./styles.css";

export default defineContentScript({
  matches: ["https://twitter.com/*", "https://x.com/*"],
  main() {
    const mutationObserver = new window.MutationObserver(injectButtons);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    function injectButtons() {
      if (/\/([a-zA-Z0-9\._-]+)\/status\/([0-9]+)$/i.test(window.location.pathname)) {
        injectButtonSingle();
      } else {
        injectButtonsFeed();
      }
    }

    function injectButtonsFeed() {
      const tweets = document.querySelectorAll(
        '[data-testid="tweet"]>div>div>div:nth-of-type(2)>div:nth-of-type(2)>div:nth-of-type(4)>div>div'
      );

      for (const tweet of tweets) {
        const holoButton = tweet.querySelector("#holo-button");
        if (holoButton !== null) {
          continue;
        }

        addButtonChildFeed(tweet);
      }
    }

    function addButtonChildFeed(element: Element) {
      const anchor: HTMLAnchorElement | null =
        element.parentElement?.parentElement?.parentElement?.querySelector(
          "div:nth-of-type(3)>div>div>div>div>div>div>a"
        ) ?? null;
      if (!anchor) {
        return;
      }

      const button = document.createElement("button");
      button.id = "holo-button";
      button.appendChild(document.createElement("div"));
      button.addEventListener("click", () => {
        const imageElement: HTMLImageElement = anchor.querySelector(
          "div>div:nth-of-type(2)>div>img"
        )!;
        const imageLinkWithoutQuery = imageElement.src.split("?")[0];
        const searchParams = new URLSearchParams();
        searchParams.set("format", "png");
        const imageLink = `${imageLinkWithoutQuery}?${searchParams.toString()}`;

        const values = /https:\/\/.+\/([a-zA-Z0-9\._-]+)\/status\/([0-9]+)(?:\/.*)?/.exec(
          anchor.href
        );
        const creator = values![1];
        const id = values![2];

        sendMessage("uploadForm", {
          author: creator,
          id,
          serviceType: ServiceType.Twitter,
          imageLink,
        }).then((r) => console.log("Got response:", r));
      });
      element.appendChild(button);
    }

    function injectButtonSingle() {
      const tweet = document.querySelector(
        '[data-testid="tweet"]>div>div>div:nth-of-type(3)>div:nth-of-type(5)>div>div'
      );
      if (!tweet) {
        return;
      }

      const holoButton = tweet.querySelector("#holo-button-big");
      if (holoButton !== null) {
        return;
      }

      addButtonSingle(tweet);
    }

    function addButtonSingle(element: Element) {
      const anchor: HTMLAnchorElement | null =
        element.parentElement?.parentElement?.parentElement?.querySelector(
          "div:nth-of-type(3)>div:nth-of-type(2)>div>div>div>div>div>div>div>a" // div>div:nth-of-type(2)>div>img
        ) ?? null;

      if (!anchor) {
        return;
      }

      const elem = document.createElement("div");
      elem.id = "holo-button-big";

      const button = document.createElement("button");
      button.appendChild(document.createElement("div"));
      button.addEventListener("click", () => {
        const imageElement: HTMLImageElement = anchor.querySelector(
          "div>div:nth-of-type(2)>div>img"
        )!;
        const imageLinkWithoutQuery = imageElement.src.split("?")[0];
        const searchParams = new URLSearchParams();
        searchParams.set("format", "png");
        const imageLink = `${imageLinkWithoutQuery}?${searchParams.toString()}`;

        const values = /https:\/\/.+\/([a-zA-Z0-9\._-]+)\/status\/([0-9]+)(?:\/.*)?/.exec(
          anchor.href
        );
        const creator = values![1];
        const id = values![2];

        sendMessage("uploadForm", {
          author: creator,
          id,
          serviceType: ServiceType.Twitter,
          imageLink,
        }).then((r) => console.log("Got response:", r));
      });

      elem.appendChild(button);
      element.appendChild(elem);
    }
  },
});
