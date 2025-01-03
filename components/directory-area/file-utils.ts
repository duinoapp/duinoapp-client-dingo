

const required = (value: string) => !!value || 'A name is required.';
const validateFileName = (value: string) => /^[\w- .]+$/.test(value) || 'Invalid characters in file name, only letters, numbers, spaces, and - _ . are allowed.';

export const fileNameRules = [required, validateFileName];

export const validateRules = (rules: ((value: string) => boolean | string)[], value: string) => {
  return rules.every((rule) => rule(value) === true);
};
