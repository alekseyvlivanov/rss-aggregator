// import axios from 'axios';
// import { object, string } from 'yup';

import { elements, initView } from './view';

// const parseUrl = (url) => {
//   console.log(url);
// };

// const schema = object().shape({
//   url: string().url(),
// });

// const validate = (fields) => {
//   schema
//     .validate(fields, { abortEarly: false })
//     .then((data) => console.log(data))
//     .catch((err) => console.log(err));
// };

const app = () => {
  const state = {
    articles: [],
    feeds: [],
    form: {
      processState: 'filling',
      processError: null,
      url: '',
      valid: true,
      errors: [],
    },
    lang: 'en',
  };

  const watched = initView(state);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    watched.form.processState = 'sending';
  });

  elements.urlInput.addEventListener('input', (e) => {
    watched.form.url = e.target.value.trim();
  });

  elements.en.addEventListener('click', (e) => {
    watched.lang = e.target.id;
  });

  elements.ru.addEventListener('click', (e) => {
    watched.lang = e.target.id;
  });
};

export default app;
