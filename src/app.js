/* eslint no-param-reassign: ["error", { "props": false }] */

import axios from 'axios';
import { differenceWith, isEqual } from 'lodash';

import parseRSS from './parser';
import validate from './validator';
import initView from './view';

const getFeed = (url) => {
  const corsProxy = 'https://cors-anywhere.herokuapp.com/';
  const corsProxyUrl = `${corsProxy}${url}`;

  return axios.get(corsProxyUrl).then((response) => parseRSS(response.data));
};

const addFeed = (data, url) => {
  return getFeed(url).then(({ feed, posts }) => {
    const id = data.feeds.length;
    data.feeds.push({ id, url, ...feed });
    posts.reverse().forEach((post) => data.posts.push({ feedId: id, ...post }));
    data.urls.push(url);
  });
};

const updateFeeds = (watchedState, delayForUpdate) => {
  Promise.all(watchedState.data.urls.map((url) => getFeed(url)))
    .then((feedsAndPosts) =>
      feedsAndPosts.forEach(({ posts }, feedId) => {
        differenceWith(
          posts.map((post) => ({ feedId, ...post })),
          watchedState.data.posts,
          isEqual,
        ).forEach((post) => watchedState.data.posts.push(post));
      }),
    )
    .catch((err) => {
      console.warn(err);
    })
    .finally(() => {
      watchedState.timeoutID = setTimeout(() => {
        updateFeeds(watchedState, delayForUpdate);
      }, delayForUpdate);
    });
};

const app = () => {
  const delayForUpdate = 30000;
  const langs = ['en', 'ru'];

  const savedLang = localStorage.getItem('lang');
  const lang = langs.includes(savedLang) ? savedLang : 'en';

  const state = {
    data: {
      feeds: [],
      posts: [],
      urls: [],
    },
    form: {
      error: null,
      status: 'filling',
      url: '',
      valid: false,
    },
    info: null,
    lang,
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

  const watchedState = initView(state, elements);

  elements.url.addEventListener('input', (e) => {
    watchedState.form.url = e.target.value.trim();
    validate(watchedState.form.url, watchedState.data.urls)
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
    addFeed(watchedState.data, watchedState.form.url)
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

export default app;
