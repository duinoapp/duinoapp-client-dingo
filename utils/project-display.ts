
export const typeToIcon = (type: string) => {
  switch (type) {
    case 'indexed-db':
      return 'mdi-google-chrome';
    case 'fsa-api':
      return 'mdi-folder-outline';
    default:
      return 'mdi-folder-question-outline';
  }
};