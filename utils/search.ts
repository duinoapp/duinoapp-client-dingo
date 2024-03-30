import sanitizeHtml from 'sanitize-html';

export const searchRegex = (search = '') => new RegExp(
  `(${search.trim().replace(/[^\w\s]/g, '.').split(/\s+/g).join('.+')})`,
  'ig',
);

export const searchHighlight = (text: string, search: string) => {
  const clean = sanitizeHtml(text, { allowedTags: [] });
  if (!search.trim()) return clean;
  const regex = searchRegex(search);
  return clean.replace(regex, '<span class="highlight">$1</span>');
}