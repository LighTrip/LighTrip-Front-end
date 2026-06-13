const { withProjectBuildGradle } = require("@expo/config-plugins");

module.exports = function withNaverMapMaven(config) {
  return withProjectBuildGradle(config, (config) => {
    const contents = config.modResults.contents;

    if (!contents.includes("repository.map.naver.com")) {
      config.modResults.contents = contents.replace(
        /allprojects\s*\{\s*repositories\s*\{/,
        (match) =>
          `${match}
    maven { url 'https://repository.map.naver.com/archive/maven' }`
      );
    }

    return config;
  });
};