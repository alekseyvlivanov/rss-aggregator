import axios from 'axios';
import _ from 'lodash';
import { object, string } from 'yup';

import { elements, initView } from './view';

const corsProxy = 'https://cors-anywhere.herokuapp.com/';
const delay = 60000;
const langs = ['en', 'ru'];
const parser = new DOMParser();

const schema = object().shape({
  url: string().url(),
});

const validateForm = (fields) => schema.validate(fields, { abortEarly: false });

const parseRSS = (doc, id, url) => {
  const titleElement = doc.querySelector('rss > channel > title');
  const descriptionElement = doc.querySelector('rss > channel > description');

  if (!titleElement && !descriptionElement) {
    return { error: 'noTitleAndDescription' };
  }

  const title = titleElement ? titleElement.textContent : url;
  const description = descriptionElement ? descriptionElement.textContent : url;
  const feed = { id, url, title, description };

  const itemElements = doc.querySelectorAll('rss > channel > item');
  const articles = Array.from(itemElements)
    .map((item) => ({
      feedId: id,
      title: item.querySelector('title').textContent,
      link: item.querySelector('link').textContent,
    }))
    .reverse();

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
      watched.feedback = { text: 'sending', type: 'info' };
      axios
        .get(`${corsProxy}${watched.url}`)
        .then((response) => parser.parseFromString(response.data, 'text/xml'))
        .then((doc) => parseRSS(doc, watched.feeds.length, watched.url))
        .then(({ error, feed, articles }) => {
          if (error) {
            watched.feedback = { text: error, type: 'danger' };
          } else {
            watched.feeds.push(feed);
            articles.forEach((article) => watched.articles.push(article));
            watched.feedback = { text: 'added', type: 'info' };
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

  setTimeout(function request() {
    Promise.all(
      watched.feeds.map((feed) => axios.get(`${corsProxy}${feed.url}`)),
    )
      .then((responses) =>
        responses.map((response) =>
          parser.parseFromString(response.data, 'text/xml'),
        ),
      )
      .then((docs) =>
        docs.map((doc, id) => parseRSS(doc, id, watched.feeds[id].url)),
      )
      .then((updates) =>
        updates.forEach(({ error, articles }) => {
          if (!error) {
            _.differenceWith(
              articles,
              watched.articles,
              _.isEqual,
            ).forEach((article) => watched.articles.push(article));
          }
        }),
      )
      .catch((error) => {
        console.log('error:', error);
      })
      .finally(() => {
        setTimeout(request, delay);
      });
  }, delay);

  elements.url.focus();
};

export default app;
