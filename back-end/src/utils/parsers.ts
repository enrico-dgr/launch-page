export const telegramUrlToHttpUrl = (telegramUrl: string) => {
  const httpsPosition = telegramUrl.search("http");
  const urlToParse = telegramUrl.slice(httpsPosition);
  const urlToParseWithDots = urlToParse.replace("%3A", ":");
  const urlParsed = urlToParseWithDots.replace(/%2F/g, "/");
  return urlParsed;
};
