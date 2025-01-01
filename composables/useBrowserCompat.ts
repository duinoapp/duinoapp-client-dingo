export const useBrowserCompat = () => {
  const isSerialSupported = computed(() => import.meta.server || 'serial' in navigator);
  
  const getRecommendedBrowsers = () => [
    { name: 'Chrome', version: '89+' },
    { name: 'Edge', version: '89+' },
  ];

  const getBrowserInstructions = () => {
    if (!isSerialSupported.value) {
      return {
        message: 'Your browser does not support the Web Serial API required for uploading code to microcontrollers.',
        recommendation: 'This app is currently only supported in Google Chrome and Microsoft Edge.',
      };
    }
    return null;
  };

  return {
    isSerialSupported,
    getRecommendedBrowsers,
    getBrowserInstructions,
  };
};
