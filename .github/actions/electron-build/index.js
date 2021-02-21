const { execSync } = require("child_process");
const { existsSync, readFileSync } = require("fs");
const { join } = require("path");

/**
 * Logs to the console
 */
const log = (msg) => console.log(`\n${msg}`); // eslint-disable-line no-console

/**
 * Exits the current process with an error code and message
 */
const exit = (msg) => {
  console.error(msg);
  process.exit(1);
};

/**
 * Executes the provided shell command and redirects stdout/stderr to the console
 */
const run = (cmd, cwd) =>
  execSync(cmd, { encoding: "utf8", stdio: "inherit", cwd });

/**
 * Determines the current operating system (one of ["mac", "windows", "linux"])
 */
const getPlatform = () => {
  switch (process.platform) {
    case "darwin":
      return "mac";
    case "win32":
      return "windows";
    default:
      return "linux";
  }
};

/**
 * Returns the value for an environment variable (or `null` if it's not defined)
 */
const getEnv = (name) => process.env[name.toUpperCase()] || null;

/**
 * Sets the specified env variable if the value isn't empty
 */
const setEnv = (name, value) => {
  if (value) {
    process.env[name.toUpperCase()] = value.toString();
  }
};

/**
 * Returns the value for an input variable (or `null` if it's not defined). If the variable is
 * required and doesn't have a value, abort the action
 */
const getInput = (name, required) => {
  const value = getEnv(`INPUT_${name}`);
  if (required && !value) {
    exit(`"${name}" input variable is not defined`);
  }
  return value;
};

/**
 * Installs NPM dependencies and builds/releases the Electron app
 */
const runAction = () => {
  const platform = getPlatform();
  const release = getInput("release", true) === "true";
  const pkgRoot = getInput("package_root", true);
  const buildScriptName = getInput("build_script_name", true);
  const skipBuild = getInput("skip_build") === "true";
  const useVueCli = getInput("use_vue_cli") === "true";
  const args = getInput("args") || "";
  const maxAttempts = Number(getInput("max_attempts") || "1");

  // TODO: Deprecated option, remove in v2.0. `electron-builder` always requires a `package.json` in
  // the same directory as the Electron app, so the `package_root` option should be used instead
  const appRoot = getInput("app_root") || pkgRoot;

  const pkgJsonPath = join(pkgRoot, "package.json");
  const pkgLockPath = join(pkgRoot, "package-lock.json");

  // Determine whether NPM should be used to run commands (instead of Yarn, which is the default)
  const useNpm = existsSync(pkgLockPath);
  log(`Will run ${useNpm ? "NPM" : "Yarn"} commands in directory "${pkgRoot}"`);

  // Make sure `package.json` file exists
  if (!existsSync(pkgJsonPath)) {
    exit(`\`package.json\` file not found at path "${pkgJsonPath}"`);
  }

  // Disable console advertisements during install phase
  setEnv("ADBLOCK", true);

  log(`Installing dependencies using yarn`);
  run("yarn", pkgRoot);

  log(`Building${release ? " and releasing" : ""} the Electron app…`);
  for (let i = 0; i < maxAttempts; i += 1) {
    try {
      run(`yarn workspace @blab/desktop forge-publish`, appRoot);
      break;
    } catch (err) {
      if (i < maxAttempts - 1) {
        log(`Attempt ${i + 1} failed:`);
        log(err);
      } else {
        throw err;
      }
    }
  }
};

runAction();
