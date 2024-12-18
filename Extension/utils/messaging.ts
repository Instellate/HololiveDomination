import { defineExtensionMessaging } from '@webext-core/messaging';

interface ProtocolMap {
  uploadForm(data: {
    author: string;
    id: string;
    serviceType: ServiceType;
    imageLink: string;
    prefilledTags?: string;
  }): void;

  upload(data: {
    author: string;
    id: string;
    serviceType: ServiceType;
    imageLink: string;
    tags: string;
    isLewd: boolean;
  }): string | undefined;

  fetch(data: { url: string | URL | globalThis.Request; init?: RequestInit }): unknown;
}

export enum ServiceType {
  Twitter = 'Twitter',
  Pixiv = 'Pixiv',
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
