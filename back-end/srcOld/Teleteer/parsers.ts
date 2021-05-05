export const telegramUrlToHttpUrl = (telegramUrl: string) => {
  const httpPosition = telegramUrl.search("http");
  const urlToParse = telegramUrl.slice(httpPosition);
  const urlParsed = urlToParse
    .replace(/%3A/g, ":")
    .replace(/%2F/g, "/")
    .replace(/%3F/g, "?")
    .replace(/%3D/g, "=")
    .replace(/%26/g, "&");

  return urlParsed;
};
