import "./index.css";
import {
  enableValidation,
  settings,
  disableButton,
} from "../scripts/validation.js";
import logoImage from "../images/Logo.svg";
import editAvatarIcon from "../images/edit-pencil-icon.svg";
import pencilIcon from "../images/pencil.svg";
import plusIcon from "../images/Plus-icon.svg";

import Api from "../utils/Api.js";
import { data } from "autoprefixer";
import { setButtonText } from "../utils/helpers.js";

document.querySelector(".header__logo").src = logoImage;
document.querySelector(".profile__edit-btn img").src = pencilIcon;
document.querySelector(".profile__add-btn img").src = plusIcon;
document.querySelector(".profile__avatar-pencil-icon").src = editAvatarIcon;

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "99c3eb49-a7d6-43c5-b24c-4768ef2993fe",
    "Content-Type": "application/json",
  },
});

api.getAppInfo().then(([cards, userInfo]) => {
  profileName.textContent = userInfo.name;
  profileDescription.textContent = userInfo.about;
  profileAvatar.src = userInfo.avatar;
  cards.forEach((card) => {
    const cardEl = getCardElement(card);
    cardList.append(cardEl);
  });
});

let cardToDelete = null;

const profileEditButton = document.querySelector(".profile__edit-btn");
const profileName = document.querySelector(".profile__name");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__avatar");
const avatarEditButton = document.querySelector(".profile__avatar-btn");
const editModal = document.querySelector("#edit-profile-modal");

const avatarModal = document.querySelector("#edit-avatar-modal");
const avatarForm = avatarModal.querySelector(".modal__form");
const avatarSubmitBtn = avatarModal.querySelector(".modal__button");
const avatarModalCloseBtn = avatarModal.querySelector(".modal__close-btn");
const avatarLinkInput = avatarModal.querySelector("#profile-avatar-input");

const editFormElement = document.forms["edit-profile"];
const editModalCloseBtn = editModal.querySelector(".modal__close-btn");
const editModalNameInput = editModal.querySelector("#profile-name-input");
const editModalDescriptionInput = editModal.querySelector(
  "#profile-description-input"
);

const deleteModal = document.querySelector("#delete-modal");
const deleteSubmitBtn = deleteModal.querySelector("#delete-confirm-btn");
const deleteForm = deleteModal.querySelector(".modal__form");
const deleteModalCloseBtn = deleteModal.querySelector(".modal__close-btn");
const deleteModalCancelBtn = deleteModal.querySelector(
  ".modal__submit-btn:not(#delete-confirm-btn)"
);

const cardModal = document.querySelector("#add-card-modal");
const cardFormElement = cardModal.querySelector(".modal__form");
const cardModalBtn = document.querySelector(".profile__add-btn");
const cardModalCloseBtn = cardModal.querySelector(".modal__close-btn");
const cardSubmitBtn = cardModal.querySelector(".modal__submit-btn");
const cardNameInput = cardModal.querySelector("#add-card-name-input");
const cardLinkInput = cardModal.querySelector("#add-card-link-input");
const previewModal = document.querySelector("#preview-modal");
const previewModalImageEl = previewModal.querySelector(".modal__image");
const previewModalCaptionEl = previewModal.querySelector(".modal__caption");
const previewModalCloseBtn = previewModal.querySelector(".modal__close-btn");

const cardTemplate = document.querySelector("#card-template");
const cardList = document.querySelector(".cards__list");

let selectedCard;
let selectedCardId;

const modalCloseBtns = [
  { btn: editModalCloseBtn, modal: editModal },
  { btn: cardModalCloseBtn, modal: cardModal },
  { btn: avatarModalCloseBtn, modal: avatarModal },
  { btn: previewModalCloseBtn, modal: previewModal },
  { btn: deleteModalCloseBtn, modal: deleteModal },
  { btn: deleteModalCancelBtn, modal: deleteModal },
];

function getCardElement(data) {
  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);

  const cardNameEl = cardElement.querySelector(".card__title");
  const cardImgEl = cardElement.querySelector(".card__image");
  const cardLikeBtn = cardElement.querySelector(".card__like-btn");
  const cardDeleteBtn = cardElement.querySelector(".card__delete-btn");

  if (data.isLiked) {
    cardLikeBtn.classList.add("card__like-btn_liked");
  }

  cardNameEl.textContent = data.name;
  cardImgEl.setAttribute("src", data.link);
  cardImgEl.setAttribute("alt", data.name);

  cardLikeBtn.addEventListener("click", () => {
    handleLikeClick(cardLikeBtn, data._id);
  });
  cardDeleteBtn.addEventListener("click", (evt) =>
    handleDeleteCard(cardElement, data._id)
  );

  cardImgEl.addEventListener("click", () => {
    openModal(previewModal);
    previewModalImageEl.src = data.link;
    previewModalImageEl.alt = data.name;
    previewModalCaptionEl.textContent = data.name;
  });

  return cardElement;
}

function openModal(modal) {
  modal.classList.add("modal_opened");
  document.addEventListener("keydown", handleEscClose);
}

function closeModal(modal) {
  modal.classList.remove("modal_opened");
  document.removeEventListener("keydown", handleEscClose);
}

function handleEditFormSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true);
  api
    .editUserInfo({
      name: editModalNameInput.value,
      about: editModalDescriptionInput.value,
    })
    .then((data) => {
      profileName.textContent = data.name;
      profileDescription.textContent = data.about;
      closeModal(editModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false);
    });
}

function handleAddCardSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true, "Save", "Saving...");
  api
    .addCard(cardNameInput.value, cardLinkInput.value)
    .then((cardData) => {
      const cardElement = getCardElement(cardData);
      cardList.prepend(cardElement);
      evt.target.reset();
      disableButton(cardSubmitBtn, settings);
      closeModal(cardModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false, "Save", "Saving...");
    });
}

function handleAvatarSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true);
  api
    .editAvatarInfo(avatarLinkInput.value)
    .then((data) => {
      profileAvatar.src = data.avatar;
      closeModal(avatarModal);
    })
    .catch((error) => {
      console.log("Detailed error:", error);
    })
    .finally(() => {
      setButtonText(submitBtn, false);
    });
}

function handleDeleteSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true, "Delete", "Deleting...");
  api
    .removeCard(selectedCardId)
    .then(() => {
      selectedCard.remove();
      closeModal(deleteModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false, "Delete", "Deleting...");
    });
}

function handleDeleteCard(cardElement, cardID) {
  selectedCard = cardElement;
  selectedCardId = cardID;
  openModal(deleteModal);
}

function handleLikeClick(likeButton, cardId) {
  const isLiked = likeButton.classList.contains("card__like-btn_liked");

  if (isLiked) {
    api
      .removeLike(cardId)
      .then((updatedCard) => {
        likeButton.classList.remove("card__like-btn_liked");
      })
      .catch((err) => {
        console.error("Error removing like:", err);
      });
  } else {
    api
      .addLike(cardId)
      .then((updatedCard) => {
        likeButton.classList.add("card__like-btn_liked");
      })
      .catch((err) => {
        console.error("Error adding like:", err);
      });
  }
}

function handleOverlayClick(evt) {
  if (evt.target.classList.contains("modal")) {
    closeModal(evt.target);
  }
}

profileEditButton.addEventListener("click", () => {
  editModalNameInput.value = profileName.textContent;
  editModalDescriptionInput.value = profileDescription.textContent;
  openModal(editModal);
});

editModalCloseBtn.addEventListener("click", () => {
  closeModal(editModal);
});

cardModalBtn.addEventListener("click", () => {
  openModal(cardModal);
});

cardModalCloseBtn.addEventListener("click", () => {
  closeModal(cardModal);
});
avatarEditButton.addEventListener("click", () => {
  openModal(avatarModal);
});

avatarModalCloseBtn.addEventListener("click", () => {
  closeModal(avatarModal);
});

previewModalCloseBtn.addEventListener("click", () => {
  closeModal(previewModal);
});

deleteModalCloseBtn.addEventListener("click", () => {
  closeModal(deleteModal);
});

deleteModalCancelBtn.addEventListener("click", () => {
  closeModal(deleteModal);
});

const modals = [editModal, cardModal, previewModal, avatarModal, deleteModal];
modals.forEach((modal) => {
  modal.addEventListener("click", handleOverlayClick);
});

modalCloseBtns.forEach(({ btn, modal }) => {
  btn.addEventListener("click", () => closeModal(modal));
});

avatarForm.addEventListener("submit", handleAvatarSubmit);
editFormElement.addEventListener("submit", handleEditFormSubmit);
cardFormElement.addEventListener("submit", handleAddCardSubmit);
deleteForm.addEventListener("submit", handleDeleteSubmit);

function handleEscClose(evt) {
  if (evt.key === "Escape") {
    const openedModal = document.querySelector(".modal_opened");
    if (openedModal) {
      closeModal(openedModal);
    }
  }
}

enableValidation(settings);
