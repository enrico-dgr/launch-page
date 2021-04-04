"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initScripts = exports.initConfigScripts = exports.socialMoneyConfig = void 0;
exports.socialMoneyConfig = {
    profileName: "Social Money",
    campaignMessage: "Partecipa alla Campagna",
    followMessage: "Segui il Profilo",
    likeMessage: "Like al Post",
    commentMessage: "Commento al post",
};
const initConfigScripts = ({ profileName, campaignMessage, followMessage, likeMessage, commentMessage, }) => [
    `window.keyword = "skip"`,
    `window.profileName = { 
    name: "profileName",
    value:"${profileName}"}`,
    `window.campaignMessage = {
    name: "campaignMessage",
    value:"${campaignMessage}"}`,
    `window.follow ={
      name: "follow",
      value:"${followMessage}"
    }`,
    `window.like ={
      name: "like",
    value:"${likeMessage}"
  }`,
    `window.comment ={
    name: "comment",
    value:"${commentMessage}"
  }`,
    `window.myMessageBody = {
    name: "myMessageBody",
    element: null,
  }`,
    `window.messageToDigIn={
    name: "messageToDigIn",
    element: null,
  }`,
];
exports.initConfigScripts = initConfigScripts;
exports.initScripts = [
    `window.querySelectorOnLoad = (varToStoreIn, query, callbacks) => {
      var element;
      const timer = setInterval(() => {
        element = query();
        if (element) {
          clearTimeout(timer);
          window[varToStoreIn.name] = {
            ...window[varToStoreIn.name],
            element: element,
          };
          console.log(
            fileIdentifier + "Element '" + varToStoreIn.name + "' found."
          );
          if (!!callbacks) {
  
              callbacks.forEach((callback) => callback());
          }
        }
      }, 200);
    };`,
    `window.queryMyMessageBody = (profileName, someTextInMessage) => {
      const profilesMessageBodyLinks = document.body.querySelectorAll(
        "div.im_message_body span.im_message_author_wrap a"
      );
      const profileMessages = Array.from(profilesMessageBodyLinks).filter(
        (el) => el.innerText == profileName
      );
    
      for (i = profileMessages.length - 1; i > 0; i--) {
        if (
          profileMessages[i].parentElement.parentElement
            .querySelector("div div.im_message_text")
            .innerText.search(someTextInMessage) > -1
        ) {
          return profileMessages[i].parentElement.parentElement.querySelector(
            "div"
          );
        }
      }
    };`,
    `window.setMessageToDigIn = () => {
      return window[messageToDigIn.name].element = myMessageBody.element.querySelector(
        "div.im_message_text"
      );
    };`,
    `window.findKeyword = () => {
      if (messageToDigIn.element.innerText.search(follow.value) > 0)
        return (keyword = follow.name);
      if (messageToDigIn.element.innerText.search(like.value) > 0)
        return (keyword = like.name);
      if (messageToDigIn.element.innerText.search(comment.value) > 0)
        return (keyword = comment.name);
      return (keyword = "not-found");
    };`,
    `window.findLink = () => {
      return window.link= messageToDigIn.element.querySelector("a").href;
    };`,
];
//# sourceMappingURL=initTg.js.map