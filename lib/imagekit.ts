import "server-only";

import ImageKit from "imagekit";

function readImageKitConfig() {
  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

  if (!publicKey || !privateKey || !urlEndpoint) {
    throw new Error("ImageKit environment variables are not fully configured.");
  }

  return { publicKey, privateKey, urlEndpoint };
}

export function getImageKit() {
  return new ImageKit(readImageKitConfig());
}
