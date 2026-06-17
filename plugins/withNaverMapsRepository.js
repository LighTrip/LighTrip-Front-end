const { withProjectBuildGradle } = require("@expo/config-plugins");

const NAVER_MAVEN_URL = "https://repository.map.naver.com/archive/maven";

module.exports = function withNaverMapsRepository(config) {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.contents.includes(NAVER_MAVEN_URL)) {
      return config;
    }

    config.modResults.contents = config.modResults.contents.replace(
      /allprojects\s*{\s*repositories\s*{/,
      `allprojects {\n  repositories {\n    maven { url '${NAVER_MAVEN_URL}' }`
    );

    return config;
  });
};
