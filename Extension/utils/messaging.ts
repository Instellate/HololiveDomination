import { defineExtensionMessaging } from "@webext-core/messaging";
import { User } from "./http";

interface ProtocolMap {
  uploadForm(data: {
    author: string;
    id: string;
    serviceType: ServiceType;
    imageLink: string;
  }): string;

  upload(data: {
    author: string;
    id: string;
    serviceType: ServiceType;
    imageLink: string;
    tags: string;
    isLewd: boolean;
  }): unknown | undefined;
}

export enum ServiceType {
  Twitter = "Twitter",
  Pixiv = "Pixiv",
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
