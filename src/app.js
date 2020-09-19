/* eslint no-param-reassign: ["error", { "props": false }] */

import axios from 'axios';
import i18next from 'i18next';
import { differenceWith, isEqual } from 'lodash';

import parseRSS from './parser';
import resources from './locales';
import validate from './validator';
import initView from './view';

const getFeed = (url) => {
  const corsProxy = 'https://cors-anywhere.herokuapp.com/';
  const corsProxyUrl = `${corsProxy}${url}`;

  return axios.get(corsProxyUrl).then((response) => parseRSS(response.data));
};

const addFeed = (watchedState) => {
  return getFeed(watchedState.form.url).then(({ feed, posts }) => {
    const id = watchedState.feeds.length;
    watchedState.feeds.push({ id, url: watchedState.form.url, ...feed });
    posts
      .reverse()
      .forEach((post) => watchedState.posts.push({ feedId: id, ...post }));
  });
};

const updateFeeds = (watchedState, delayForUpdate) => {
  Promise.all(watchedState.feeds.map(({ url }) => getFeed(url)))
    .then((feedsAndPosts) =>
      feedsAndPosts.forEach(({ posts }, feedId) => {
        differenceWith(
          posts.map((post) => ({ feedId, ...post })),
          watchedState.posts,
          isEqual,
        )
          .reverse()
          .forEach((post) => watchedState.posts.push(post));
      }),
    )
    .finally(() => {
      watchedState.timeoutID = setTimeout(() => {
        updateFeeds(watchedState, delayForUpdate);
      }, delayForUpdate);
    });
};

const addHandlers = (watchedState, elements, delayForUpdate, langs) => {
  elements.url.addEventListener('input', (e) => {
    watchedState.form.url = e.target.value.trim();
    const urls = watchedState.feeds.map(({ url }) => url);
    validate(watchedState.form.url, urls)
      .then(() => {
        watchedState.form.valid = watchedState.form.url !== '';
        watchedState.form.error = null;
      })
      .catch((err) => {
        watchedState.form.valid = false;
        watchedState.form.error = err.type;
      })
      .finally(() => {
        watchedState.info = null;
      });
  });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.form.status = 'loading';
    watchedState.info = 'loading';
    addFeed(watchedState)
      .then(() => {
        watchedState.form.status = 'added';
        watchedState.info = 'added';
        if (!watchedState.timeoutID) {
          watchedState.timeoutID = setTimeout(() => {
            updateFeeds(watchedState, delayForUpdate);
          }, delayForUpdate);
        }
      })
      .catch((err) => {
        console.warn(err.message);
        watchedState.info = err.message;
      })
      .finally(() => {
        watchedState.form.status = 'filling';
      });
  });

  langs.forEach((langId) => {
    elements[langId].addEventListener('click', (e) => {
      watchedState.lang = e.target.id;
      localStorage.setItem('lang', watchedState.lang);
    });
  });
};

const app = () => {
  const delayForUpdate = 30000;
  const langs = ['en', 'ru'];

  const state = {
    form: {
      error: null,
      status: 'filling',
      url: '',
      valid: false,
    },
    info: null,
    feeds: [],
    posts: [],
    lang: null,
    timeoutID: null,
  };

  const elements = {
    title: document.querySelector('.title'),
    form: document.querySelector('.add-rss'),
    fieldset: document.querySelector('.fieldset'),
    label: document.querySelector('.label'),
    url: document.querySelector('#add-link'),
    submitBtn: document.querySelector('button[type="submit"]'),
    help: document.querySelector('#link-help'),
    formFeedback: document.querySelector('.form-feedback'),
    appFeedback: document.querySelector('.app-feedback'),
    feeds: document.querySelector('.feeds'),
    en: document.querySelector('#en'),
    ru: document.querySelector('#ru'),
  };

  i18next
    .init({
      lang: state.lang,
      resources,
    })
    .then(() => {
      const savedLang = localStorage.getItem('lang');
      const lang = langs.includes(savedLang) ? savedLang : 'en';

      const watchedState = initView(state, elements);
      watchedState.lang = lang;

      addHandlers(watchedState, elements, delayForUpdate, langs);
    });
};

export default app;
