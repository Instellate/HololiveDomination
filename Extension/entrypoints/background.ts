import { onMessage } from "@/utils/messaging";

export default defineBackground(() => {
  onMessage("uploadForm", async (data) => {
    const searchParams = new URLSearchParams();
    searchParams.set("author", data.data.author);
    searchParams.set("id", data.data.id);
    searchParams.set("service", "Twitter");
    searchParams.set("imageLink", data.data.imageLink);

    browser.windows.create({
      url: `${browser.runtime.getURL("/upload.html")}?${searchParams.toString()}`,
      width: 400,
      height: 600,
    });

    return "";
  });

  onMessage("upload", async (data) => {
    const imageResp = await fetch(data.data.imageLink);
    const imageBlob = await imageResp.blob();

    const formdata = new FormData();
    formdata.set("file", imageBlob);
    formdata.set("tags", data.data.tags);
    formdata.set("author", data.data.author);
    formdata.set("id", data.data.id);
    formdata.set("isLewd", data.data.isLewd ? "true" : "false");
    formdata.set("service", data.data.serviceType);

    const response = await fetch(import.meta.env.VITE_DOMINATION_API_URL + "/api/posts", {
      method: "POST",
      body: formdata,
      credentials: 'include'
    });

    if (!response.ok) {
      return await response.json();
    }
  });
});
