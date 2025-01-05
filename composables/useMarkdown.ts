import TurndownService from 'turndown';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

interface FromMd {
  value: string;
  allowedTags?: string[];
}


const argsToJson = (args: string) => {
  const obj: Record<string, string> = {};
  const matches = args.matchAll(/(\w+)="([^"]*)"/g);
  for (const [, key, value] of matches) {
    obj[key.trim()] = value.trim();
  }
  return JSON.stringify(obj);
};

const jsonToArgs = (json: string) => {
  let data = {} as Record<string, string>;
  try {
    data = JSON.parse(json);
    if (typeof data !== 'object' || Array.isArray(data)) {
      data = {};
    }
  } catch (e) {
    data = {};
  }
  return Object.entries(data).map(([key, value]) => `${key}="${value}"`).join(' ');
};

// custom markdown parser to handle dynamic components
// components are in the html as <dynamic-component arg1="value1" arg2="value2" ></dynamic-component>
// and is stored in the markdown as @@dynamic-component@@{"arg1":"value1","arg2":"value2"}@@

export const useMarkdown = () => {
  const toMd = (value = '') => {
    const turndownService = new TurndownService({
      headingStyle: 'atx',
    });


    const html = value.replace(
      /<(dynamic-component)((\s*\w+="[^"]*")*)\s*>[^<]*<\/dynamic-component>/g,
      (match, p1, p2) => `@@${p1}@@${argsToJson(p2)}@@`,
    );
    return turndownService.turndown(html);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fromMd = async ({ value = '', allowedTags = [] }: FromMd) => {
    marked.use({
      breaks: true,
    });

    const parsedValue = await marked.parse(value);

    return sanitizeHtml(
      parsedValue,
      (import.meta.client)
        ? { allowedTags: [...sanitizeHtml.defaults.allowedTags, ...allowedTags] }
        : undefined,
    )
      .replace(/<a([^>]*)>/g, '<a target="_blank" $1>')
      .replace(
        /<img([^>]*)>/g,
        '<div style="text-align: center;"><img style="max-width: 95%; max-height: 300px;" $1></div>',
      )
      .replace(/<p>@@(dynamic-component)@@({[^}]*})@@<\/p>/g, (match, p1, p2) => `<${p1} ${jsonToArgs(p2)}></${p1}>`);
  };

  return { toMd, fromMd };
};
