import { ServiceType } from "@/utils/messaging";
import "./style.css";

const searchParams = new URLSearchParams(window.location.search);
const author = searchParams.get("author")!;
const id = searchParams.get("id")!;
const service = searchParams.get("service")!;
const imageLink = searchParams.get("imageLink")!;
const tags = searchParams.get("tags");

const tagsElement = document.getElementById("tags")! as HTMLInputElement;
const authorElement = document.getElementById("author")! as HTMLInputElement;
const idElement = document.getElementById("id")! as HTMLInputElement;
const isLewdElement = document.getElementById("is-lewd")! as HTMLInputElement;
const serviceElement = document.getElementById("service")! as HTMLInputElement;

authorElement.value = author;
idElement.value = id;
serviceElement.value = service;
tagsElement.value = tags ?? "";

const uploadForm = document.getElementById("upload-form")! as HTMLFormElement;
uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const response = await sendMessage('upload', {
    author: authorElement.value,
    id: id,
    serviceType: serviceElement.value as ServiceType,
    imageLink: imageLink,
    tags: tagsElement.value,
    isLewd: isLewdElement.checked,
  });
  if (response) {
    console.log(response);
  } else {
    window.close();
  }
});
