const { withDangerousMod, withXcodeProject, IOSConfig } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const DATABASE_FILE = 'food.db';

module.exports = function withDatabaseAsset(config) {
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const assetsPath = path.join(
        config.modRequest.platformProjectRoot,
        'app/src/main/assets/custom'
      );

      if (!fs.existsSync(assetsPath)) {
        fs.mkdirSync(assetsPath, { recursive: true });
      }

      const sourcePath = path.join(config.modRequest.projectRoot, 'assets', DATABASE_FILE);
      const destPath = path.join(assetsPath, DATABASE_FILE);

      fs.copyFileSync(sourcePath, destPath);
      console.log(`[withDatabaseAsset] Copied ${DATABASE_FILE} to Android assets/custom`);

      return config;
    },
  ]);

  config = withDangerousMod(config, [
    'ios',
    async (config) => {
      const projectName = config.modRequest.projectName;
      const iosProjectPath = path.join(config.modRequest.platformProjectRoot, projectName);

      const sourcePath = path.join(config.modRequest.projectRoot, 'assets', DATABASE_FILE);
      const destPath = path.join(iosProjectPath, DATABASE_FILE);

      fs.copyFileSync(sourcePath, destPath);
      console.log(`[withDatabaseAsset] Copied ${DATABASE_FILE} to iOS project`);

      return config;
    },
  ]);

  config = withXcodeProject(config, (config) => {
    const project = config.modResults;
    const projectName = config.modRequest.projectName;

    IOSConfig.XcodeUtils.addResourceFileToGroup({
      filepath: `${projectName}/${DATABASE_FILE}`,
      groupName: projectName,
      isBuildFile: true,
      project,
    });

    console.log(`[withDatabaseAsset] Added ${DATABASE_FILE} to iOS resources`);

    return config;
  });

  return config;
};
