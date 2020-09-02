import axios from 'axios';
import { object, string } from 'yup';

import { elements, initView } from './view';

const parseUrl = (url) => {
  const proxy = 'https://cors-anywhere.herokuapp.com/';
  axios
    .get(`${proxy}${url}`)
    .then((response) => console.log(response))
    .catch((err) => console.log(err));
};

const langs = ['en', 'ru'];

const schema = object().shape({
  url: string().url(),
});

const validate = (fields) => schema.validate(fields, { abortEarly: false });

const app = () => {
  const savedLang = localStorage.getItem('lang');
  const lang = langs.includes(savedLang) ? savedLang : 'en';

  const state = {
    articles: [],
    feeds: [],
    form: {
      processState: 'filling',
      processError: null,
      url: '',
      error: null,
    },
    lang,
  };

  const watched = initView(state);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (watched.form.url !== '') {
      parseUrl(watched.form.url);

      watched.feeds.push(watched.form.url);
      watched.form.url = '';
      elements.form.reset();
    }
    // watched.form.processState = 'sending';
  });

  elements.url.addEventListener('input', (e) => {
    watched.form.url = e.target.value.trim();
    validate(watched.form)
      .then(() => {
        if (watched.feeds.includes(watched.form.url)) {
          watched.form.error = 'duplicateUrl';
        } else {
          watched.form.error = null;
        }
      })
      .catch(() => {
        watched.form.error = 'notValidUrl';
      });
  });

  langs.forEach((button) => {
    elements[button].addEventListener('click', (e) => {
      watched.lang = e.target.id;
      localStorage.setItem('lang', watched.lang);
      elements.url.focus();
    });
  });
};

export default app;
