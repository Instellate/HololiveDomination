import "./style.css";

const apiUrlElement = document.getElementById("apiUrl")! as HTMLInputElement;
const errorSpan = document.getElementById("error")!;

let apiUrl: string | undefined;
browser.storage.sync.get().then((v) => {
  apiUrlElement.value = v["api-url"] ?? "";
  apiUrl = v["api-url"];
});

const formElement = document.getElementById("form")! as HTMLFormElement;
formElement.addEventListener("submit", async (e) => {
  e.preventDefault();

  let value = apiUrlElement.value.trim();
  if (!value) {
    return;
  }

  let formattedUrl;
  if (value.endsWith("/")) {
    formattedUrl = value + "*";
  } else {
    formattedUrl = value + "/*";
  }

  if (apiUrl) {
    const _removed = await browser.permissions.remove({
      origins: [apiUrl.startsWith("/") ? apiUrl + "*" : apiUrl + "/*"],
    });
  }

  let isAdded;
  try {
    isAdded = await browser.permissions.request({
      origins: [formattedUrl],
    });
  } catch (error: unknown) {
    console.log(error);
    errorSpan.innerText = "Invalid URL";
    return;
  }

  if (isAdded) {
    errorSpan.innerText = "Added";
  } else {
    errorSpan.innerText = "Couldn't add url";
  }

  await browser.storage.sync.set({ "api-url": value });
});
