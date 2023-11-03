module.exports = function (api) {
  api.cache(true);
  const disableImportExportTransform = true;
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          native: {
            disableImportExportTransform,
          },
          web: {
            disableImportExportTransform,
          },
        },
      ],
    ],
  };
};