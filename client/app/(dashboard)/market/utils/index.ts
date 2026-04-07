export const encodeImageUrl = (url: string) => {
  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    const newParams = new URLSearchParams();
    for (const [key, value] of params) {
      newParams.set(key, decodeURIComponent(value));
    }
    urlObj.search = newParams.toString();
    return urlObj.toString();
  } catch {
    return url;
  }
};
