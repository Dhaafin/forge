const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const exclusionList = require('metro-config/src/defaults/exclusionList');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch files within the monorepo
config.watchFolders = [workspaceRoot];

// 2. Block heavy/irrelevant directories from being watched to avoid Windows file watch limits
const escapedWorkspaceRoot = workspaceRoot.replace(/\\/g, '\\\\');
config.resolver.blockList = exclusionList([
  new RegExp(`${escapedWorkspaceRoot}[/\\\\]node_modules[/\\\\]\\.pnpm[/\\\\].*`),
  new RegExp(`${escapedWorkspaceRoot}[/\\\\]apps[/\\\\]web[/\\\\]node_modules[/\\\\].*`),
  new RegExp(`${escapedWorkspaceRoot}[/\\\\]apps[/\\\\]web[/\\\\]\\.next[/\\\\].*`),
]);

// 3. Let Metro resolve packages from both mobile and workspace root node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

module.exports = config;
