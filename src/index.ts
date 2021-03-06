import { join } from 'path';
import { execSync } from 'child_process';
import { existsSync, readFileSync, lstatSync } from 'fs';

function haveFile(cwd: string, fileName: string) {
  return existsSync(join(cwd, fileName));
}

/**
 * 判断这个包管理器是否存在
 * @param packageName
 */
const hasPackageCommand = (packageName: string) => {
  try {
    execSync(`${packageName} -v`, {
      stdio: 'inherit',
    });
    return true;
  } catch (error) {
    return false;
  }
};

const detectInstaller = function(cwd: string) {
  // 没有 package.json 或 node_modules，判断不出。
  if (!haveFile(cwd, 'package.json') || !haveFile(cwd, 'node_modules')) {
    return [];
  }

  const pkg = JSON.parse(readFileSync(join(cwd, 'package.json'), 'utf-8'));
  const deps = [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.devDependencies || {})];

  // 没有依赖，判断不出。
  if (!deps.length) {
    return [];
  }

  // 有 package-lock.json
  if (haveFile(cwd, 'package-lock.json')) {
    return ['npm'];
  }

  // 有 yarn.lock
  if (haveFile(cwd, 'yarn.lock') && haveFile(cwd, 'node_modules/.yarn-integrity')) {
    const isAliRegistry = readFileSync(join(cwd, 'node_modules/.yarn-integrity'), 'utf-8').includes(
      'registry.npm.alibaba-inc.com',
    );
    if (isAliRegistry) {
      return ['ayarn', 'yarn'];
    }
    return ['tyarn', 'yarn'];
  }

  // 依赖是 link 文件
  const depDir = join(cwd, 'node_modules', deps[0]);
  const isDepSymLink = lstatSync(depDir)?.isSymbolicLink?.();
  if (isDepSymLink) {
    if (process.env.BIGFISH_COMPAT) {
      return ['tnpm'];
    }
    return ['cnpm', 'tnpm', 'pnpm'];
  }

  // 检测不到。
  return [];
};

export default detectInstaller;

detectInstaller.hasPackageCommand = hasPackageCommand;
module.exports = detectInstaller;
