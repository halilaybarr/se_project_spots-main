// utils/Api.js

export default class Api {
  constructor(options) {}

  getInitialCards() {
   return fetch("https://around-api.en.tripleten-services.com/v1/cards", {
      headers: {
        authorization: "99c3eb49-a7d6-43c5-b24c-4768ef2993fe",
      },
    }).then((res) => res.json());
  }
}


