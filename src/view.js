/* eslint no-param-reassign: ["error", { "props": false }] */

import i18next from 'i18next';
import { differenceWith, isEqual } from 'lodash';
import onChange from 'on-change';

import resources from './locales';

const renderFormTranslation = (elements, lang) => {
  document.title = i18next.t('title');
  elements.title.textContent = i18next.t('title');
  elements.label.textContent = i18next.t('label');
  elements.url.setAttribute('placeholder', i18next.t('placeholder'));
  elements.submitBtn.textContent = i18next.t('button');
  elements.help.textContent = i18next.t('help');
  if (lang === 'en') {
    elements.ru.parentElement.classList.remove('active');
    elements.en.parentElement.classList.add('active');
  } else {
    elements.en.parentElement.classList.remove('active');
    elements.ru.parentElement.classList.add('active');
  }
  elements.url.focus();
};

const renderUrlValidation = (elements, { valid }) => {
  elements.submitBtn.disabled = !valid;
};

const renderFormErrors = (elements, { error }) => {
  if (error) {
    elements.url.classList.add('is-invalid');
    elements.formFeedback.classList.add('text-danger');
    elements.formFeedback.textContent = i18next.t(error);
  } else {
    elements.url.classList.remove('is-invalid');
    elements.formFeedback.classList.remove('text-danger');
    elements.formFeedback.textContent = '';
  }
};

const renderAppInformation = (elements, info) => {
  if (info) {
    elements.appFeedback.classList.add('text-info');
    elements.appFeedback.textContent = i18next.t(info);
  } else {
    elements.appFeedback.classList.remove('text-info');
    elements.appFeedback.textContent = '';
  }
};

const renderFormStatus = (elements, { status }) => {
  switch (status) {
    case 'added':
      elements.form.reset();
      break;
    case 'filling':
      elements.fieldset.disabled = false;
      elements.url.focus();
      break;
    case 'loading':
      elements.fieldset.disabled = true;
      break;
    default:
      throw new Error(`Unknown form status: '${status}'!`);
  }
};

const renderFeeds = (elements, feeds) => {
  feeds.forEach((feed) => {
    const feedGroup = document.createElement('ul');
    feedGroup.className = 'list-group my-2';
    feedGroup.dataset.id = feed.id;
    const feedLink = document.createElement('a');
    feedLink.className =
      'list-group-item list-group-item-action list-group-item-dark lead font-weight-bolder';
    feedLink.textContent = feed.title;
    feedLink.href = feed.url;
    feedLink.rel = 'noopener noreferrer';
    feedLink.target = '_blank';
    feedGroup.append(feedLink);
    elements.feeds.prepend(feedGroup);
  });
};

const renderPosts = (elements, posts) => {
  posts.forEach((post) => {
    const feedGroup = elements.feeds.querySelector(
      `ul[data-id="${post.feedId}"]`,
    );
    const postLink = document.createElement('a');
    postLink.className = 'list-group-item list-group-item-action';
    postLink.textContent = post.title;
    postLink.href = post.link;
    postLink.rel = 'noopener noreferrer';
    postLink.target = '_blank';
    feedGroup.firstChild.after(postLink);
  });
};

const initView = (state, elements) => {
  const watchedState = onChange(state, (path, value, previousValue) => {
    switch (path) {
      case 'data.feeds':
        renderFeeds(elements, differenceWith(value, previousValue, isEqual));
        break;
      case 'data.posts':
        renderPosts(elements, differenceWith(value, previousValue, isEqual));
        break;
      case 'form.error':
        renderFormErrors(elements, state.form);
        break;
      case 'form.status':
        renderFormStatus(elements, state.form);
        break;
      case 'form.url':
        break;
      case 'form.valid':
        renderUrlValidation(elements, state.form);
        break;
      case 'info':
        renderAppInformation(elements, state.info);
        break;
      case 'lang':
        i18next.changeLanguage(state.lang);
        renderFormTranslation(elements, state.lang);
        renderUrlValidation(elements, state.form);
        renderFormErrors(elements, state.form);
        renderAppInformation(elements, state.info);
        break;
      case 'timeoutID':
        break;
      default:
        throw new Error(`Unknown state property: '${path}'!`);
    }
  });

  i18next
    .init({
      lng: state.lang,
      resources,
    })
    .then(() => {
      renderFormTranslation(elements, state.lang);
      renderUrlValidation(elements, state.form);
      renderFormErrors(elements, state.form);
      renderAppInformation(elements, state.info);
    });

  return watchedState;
};

export default initView;
