import axios from 'axios';
import { object, string } from 'yup';

import { elements, initView } from './view';

const corsProxy = 'https://cors-anywhere.herokuapp.com/';
const langs = ['en', 'ru'];
const parser = new DOMParser();

const schema = object().shape({
  url: string().url(),
});

const validateForm = (fields) => schema.validate(fields, { abortEarly: false });

const parseRSS = (docXML, id, url) => {
  const titleElement = docXML.querySelector('rss > channel > title');
  const descriptionElement = docXML.querySelector(
    'rss > channel > description',
  );

  if (!titleElement && !descriptionElement) {
    return { error: 'noTitleAndDescription' };
  }

  const title = titleElement ? titleElement.textContent : url;
  const description = descriptionElement ? descriptionElement.textContent : url;
  const feed = { id, url, title, description };

  const itemElements = docXML.querySelectorAll('rss > channel > item');
  const articles = Array.from(itemElements).map((item) => ({
    feedId: id,
    title: item.querySelector('title').textContent,
    link: item.querySelector('link').textContent,
  }));

  return { error: null, feed, articles };
};

const app = () => {
  const savedLang = localStorage.getItem('lang');
  const lang = langs.includes(savedLang) ? savedLang : 'en';

  const state = {
    lang,
    process: 'filling',
    url: '',
    feedback: {},
    feeds: [],
    articles: [],
  };

  const watched = initView(state);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (watched.url !== '') {
      watched.process = 'sending';
      axios
        .get(`${corsProxy}${watched.url}`)
        .then((response) => parser.parseFromString(response.data, 'text/xml'))
        .then((docXML) => parseRSS(docXML, watched.feeds.length, watched.url))
        .then(({ error, feed, articles }) => {
          if (error) {
            watched.feedback = { text: error, type: 'danger' };
          } else {
            watched.feeds.push(feed);
            watched.articles = watched.articles.concat(articles);
            watched.feedback = { text: 'added', type: 'success' };
            watched.url = '';
            elements.form.reset();
          }
        })
        .catch((error) => {
          watched.feedback = { text: error, type: 'danger' };
        })
        .finally(() => {
          watched.process = 'filling';
        });
    }
  });

  elements.url.addEventListener('input', (e) => {
    watched.url = e.target.value.trim();
    validateForm(watched)
      .then(() => {
        if (watched.feeds.find((feed) => feed.url === watched.url)) {
          watched.feedback = { text: 'duplicateUrl', type: 'danger' };
        } else {
          watched.feedback = {};
        }
      })
      .catch(() => {
        watched.feedback = { text: 'notValidUrl', type: 'danger' };
      });
  });

  langs.forEach((button) => {
    elements[button].addEventListener('click', (e) => {
      watched.lang = e.target.id;
      localStorage.setItem('lang', watched.lang);
      elements.url.focus();
    });
  });

  elements.url.focus();
};

export default app;
