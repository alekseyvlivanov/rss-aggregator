import { string } from 'yup';

const validate = (url, list) => string().url().notOneOf(list).validate(url);

export default validate;
