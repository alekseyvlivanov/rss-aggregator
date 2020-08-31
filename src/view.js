import i18next from 'i18next';
import onChange from 'on-change';

import resources from './locales';

const elements = {
  title: document.querySelector('h1'),
  form: document.querySelector('.add-rss'),
  label: document.querySelector('label'),
  urlInput: document.querySelector('#add-link'),
  submitButton: document.querySelector('button[type="submit"]'),
  help: document.querySelector('#link-help'),
  feedback: document.querySelector('.feedback'),
  feeds: document.querySelector('.feeds'),
  en: document.querySelector('#en'),
  ru: document.querySelector('#ru'),
};

const renderTranslation = (lang) => {
  document.title = i18next.t('title');
  elements.title.textContent = i18next.t('title');
  elements.label.textContent = i18next.t('label');
  elements.urlInput.setAttribute('placeholder', i18next.t('placeholder'));
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

// const buildErrorElement = (error) => {
//   const el = document.createElement('div');
//   el.classList.add('invalid-feedback');
//   el.textContent = error;
//   return el;
// };

// const buildTodoElement = (todo) => {
//   const el = document.createElement('li');
//   el.textContent = todo.name;
//   return el;
// };

// const renderTodos = (todos, elements) => {
//   elements.todosBox.textContent = '';
//   const todoNodes = todos.map(buildTodoElement);
//   elements.todosBox.append(...todoNodes);
// };

// const renderForm = (form, elements) => {
//   switch (form.status) {
//     case 'filling':
//       elements.submitBtn.removeAttribute('disabled');
//       elements.input.removeAttribute('disabled');
//       elements.input.value = '';
//       break;

//     case 'failed':
//       elements.submitBtn.removeAttribute('disabled');
//       elements.input.removeAttribute('disabled');
//       elements.input.select();
//       break;

//     case 'loading':
//       elements.submitBtn.setAttribute('disabled', true);
//       elements.input.setAttribute('disabled', true);
//       break;

//     default:
//       throw Error(`Unknown form status: ${form.status}`);
//   }
// };

// const renderFormErrors = (form, elements) => {
//   const error = elements.input.nextSibling;
//   if (error) {
//     error.remove();
//   }

//   const field = form.fields.name;
//   if (field.valid) {
//     elements.input.classList.remove('is-invalid');
//   } else {
//     elements.input.classList.add('is-invalid');
//     const errorElement = buildErrorElement(field.error);
//     elements.input.after(errorElement);
//   }
// };

// const renderAppError = (error, elements) => {
//   if (!error) return;
//   const toastBody = elements.toast.querySelector('.toast-body');
//   toastBody.textContent = error;
//   $('.toast').toast('show');
// };

//   const renderErrors = (state) => {
//     console.log(state);
//   };

//   const processStateHandler = (processState) => {
//     switch (processState) {
//       case 'filling':
//         submitButton.disabled = false;
//         break;
//       case 'sending':
//         submitButton.disabled = true;
//         break;
//       case 'finished':
//         // container.innerHTML = 'User Created!';
//         break;
//       case 'failed':
//         submitButton.disabled = false;
//         // TODO render error
//         break;
//       default:
//         throw new Error(`Unknown state: ${processState}`);
//     }
//   };

const initView = (state) => {
  //     switch (path) {
  //       case 'form.processState':
  //         processStateHandler(value);
  //         break;
  //       case 'form.url':
  //         validate(watched.form);
  //         break;
  //       case 'form.valid':
  //         submitButton.disabled = !value;
  //         break;
  //       case 'form.errors':
  //         renderErrors(watched.form);
  //         break;
  //     }

  const mapping = {
    lang: (value) => {
      i18next.changeLanguage(value);
      renderTranslation(value);
    },
    // 'form.status': () => renderForm(state.form, elements),
    // 'form.fields.name': () => renderFormErrors(state.form, elements),
    // 'form.submitCount': () => elements.input.focus(),
    // error: () => renderAppError(state.error, elements),
    // todos: () => renderTodos(state.todos, elements),
  };

  const watched = onChange(state, (path, value) => {
    console.log(path, value);
    if (mapping[path]) {
      mapping[path](value);
    }
  });

  i18next
    .init({
      lng: watched.lang,
      resources,
    })
    .then(() => renderTranslation(watched.lang));

  elements.urlInput.focus();

  return watched;
};

export { elements, initView };
