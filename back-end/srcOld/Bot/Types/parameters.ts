import { Page } from "puppeteer";

export type BrowserOpts = { userDataDir: string; headless: boolean };
export type CommentInfo = { text?: string; pre?: string; post?: string };
export type CampaignInfo = {
  text: string[];
  button: { link: string; bottom: string; confirm: string; skip: string };
  like: string;
  follow: string;
  comment: CommentInfo;
  story: string;
};
export type InitParams = {
  browserOpts: BrowserOpts;
  botName: string;
  campaignInfo: CampaignInfo;
};
