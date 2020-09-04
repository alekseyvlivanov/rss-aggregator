import i18next from 'i18next';
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
    case 'success':
      elements.url.classList.remove('is-invalid');
      elements.submitButton.removeAttribute('disabled');
      elements.feedback.classList.add('text-success');
      elements.feedback.textContent = i18next.t(text);
      break;
    default:
      elements.url.classList.remove('is-invalid');
      elements.submitButton.removeAttribute('disabled');
      elements.feedback.className = 'feedback';
      elements.feedback.textContent = '';
  }
};

const initView = (state) => {
  const watched = onChange(state, (path, value) => {
    console.log(path, value);
    switch (path) {
      case 'articles':
        break;
      case 'feeds':
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
