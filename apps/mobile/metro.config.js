const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// pnpm symlink support
config.resolver.unstable_enableSymlinks = true;
config.resolver.unstable_enablePackageExports = true;

// Singleton pinning — prevent duplicate React/RN instances across workspace
const singletons = ['react', 'react-native', 'expo', 'expo-router', 'expo-modules-core', 'react-native-reanimated', 'react-native-worklets'];
config.resolver.extraNodeModules = Object.fromEntries(
  singletons.map((pkg) => [pkg, path.resolve(projectRoot, 'node_modules', pkg)])
);

module.exports = config;
