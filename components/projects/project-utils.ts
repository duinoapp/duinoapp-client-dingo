

const required = (value: string) => !!value || 'A name is required.';
const containAlpha = (value: string) => /[a-zA-Z]/.test(value) || 'Must contain some letters.';

export const projectNameRules = [required, containAlpha];

export const validateRules = (rules: ((value: string) => boolean | string)[], value: string) => {
  return rules.every((rule) => rule(value) === true);
};
