import i18next from 'i18next';
import _ from 'lodash';
import onChange from 'on-change';

import resources from './locales';

const elements = {
  title: document.querySelector('.title'),
  form: document.querySelector('.add-rss'),
  label: document.querySelector('.label'),
  url: document.querySelector('#add-link'),
  submitButton: document.querySelector('button[type="submit"]'),
  help: document.querySelector('#link-help'),
  feedback: document.querySelector('.feedback'),
  feeds: document.querySelector('.feeds'),
  en: document.querySelector('#en'),
  ru: document.querySelector('#ru'),
};

const processStateHandler = (processState) => {
  if (processState === 'filling') {
    elements.submitButton.removeAttribute('disabled');
  } else if (processState === 'sending') {
    elements.submitButton.setAttribute('disabled', '');
  }
};

const renderTranslation = (lang = 'en') => {
  document.title = i18next.t('title');
  elements.title.textContent = i18next.t('title');
  elements.label.textContent = i18next.t('label');
  elements.url.setAttribute('placeholder', i18next.t('placeholder'));
  elements.submitButton.textContent = i18next.t('button');
  elements.help.textContent = i18next.t('help');
  if (lang === 'en') {
    elements.ru.parentElement.classList.remove('active');
    elements.en.parentElement.classList.add('active');
  } else {
    elements.en.parentElement.classList.remove('active');
    elements.ru.parentElement.classList.add('active');
  }
};

const renderFeedback = ({ text, type }) => {
  switch (type) {
    case 'danger':
      elements.url.classList.add('is-invalid');
      elements.submitButton.setAttribute('disabled', '');
      elements.feedback.classList.add('text-danger');
      elements.feedback.textContent = i18next.t(text);
      break;
    case 'info':
      elements.url.classList.remove('is-invalid');
      elements.submitButton.removeAttribute('disabled');
      elements.feedback.classList.add('text-info');
      elements.feedback.textContent = i18next.t(text);
      break;
    default:
      elements.url.classList.remove('is-invalid');
      elements.submitButton.removeAttribute('disabled');
      elements.feedback.className = 'feedback';
      elements.feedback.textContent = '';
  }
};

const renderFeeds = (feeds) => {
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
    elements.feeds.append(feedGroup);
  });
};

const renderArticles = (articles) => {
  articles.forEach((article) => {
    const feedGroup = elements.feeds.querySelector(
      `ul[data-id="${article.feedId}"]`,
    );

    const articleLink = document.createElement('a');
    articleLink.className = 'list-group-item list-group-item-action';
    articleLink.textContent = article.title;
    articleLink.href = article.link;
    articleLink.rel = 'noopener noreferrer';
    articleLink.target = '_blank';

    feedGroup.append(articleLink);
  });
};

const initView = (state) => {
  const watched = onChange(state, (path, value, previousValue) => {
    console.log(path, value);
    switch (path) {
      case 'articles':
        renderArticles(_.difference(value, previousValue));
        break;
      case 'feeds':
        renderFeeds(_.difference(value, previousValue));
        break;
      case 'feedback':
        renderFeedback(value);
        break;
      case 'process':
        processStateHandler(value);
        break;
      case 'lang':
        i18next.changeLanguage(value);
        renderTranslation(value);
        renderFeedback(watched.feedback);
        break;
      default:
    }
  });

  i18next
    .init({
      lng: watched.lang,
      resources,
    })
    .then(() => {
      renderTranslation(watched.lang);
    });

  return watched;
};

export { elements, initView };
