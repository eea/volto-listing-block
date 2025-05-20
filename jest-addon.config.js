/**
 * Generic Jest configuration for Volto addons
 *
 * This configuration automatically:
 * - Detects the addon name from the config file path
 * - Configures test coverage to focus on the specific test path
 * - Handles different ways of specifying test paths:
 *   - Full paths like src/addons/addon-name/src/components
 *   - Just filenames like Component.test.jsx
 *   - Just directory names like components
 *
 * Usage:
 * RAZZLE_JEST_CONFIG=src/addons/addon-name/jest-addon.config.js CI=true yarn test [test-path] --collectCoverage
 */

require('dotenv').config({ path: __dirname + '/.env' });

const path = require('path');
const fs = require('fs');

// Get the addon name from the current file path
const pathParts = __filename.split(path.sep);
const addonsIdx = pathParts.lastIndexOf('addons');
const addonName =
  addonsIdx !== -1 && addonsIdx < pathParts.length - 1
    ? pathParts[addonsIdx + 1]
    : 'volto-listing-block';
const addonBasePath = `src/addons/${addonName}/src`;

/**
 * Find files or directories in the addon using Node.js filesystem APIs
 * @param {string} name - The name to search for
 * @param {string} type - The type of item to find ('f' for files, 'd' for directories)
 * @param {string} [additionalOptions=''] - Additional options for flexible path matching
 * @returns {string|null} - The path of the found item or null if not found
 */
const findInAddon = (name, type, additionalOptions = '') => {
  const isFile = type === 'f';
  const isDirectory = type === 'd';
  const isFlexiblePathMatch = additionalOptions.includes('-path');

  // Extract the path pattern from additionalOptions if it's a flexible path match
  let pathPattern = null;
  if (isFlexiblePathMatch) {
    const match = additionalOptions.match(/-path "([^"]+)"/);
    if (match && match[1]) {
      pathPattern = match[1].replace(/\*/g, '');
    }
  }

  // Function to search recursively through directories
  const searchRecursive = (dir, results = []) => {
    if (!fs.existsSync(dir)) {
      return results;
    }

    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        // Check if this entry matches our search criteria
        if (
          (isFile && entry.isFile()) ||
          (isDirectory && entry.isDirectory())
        ) {
          if (isFlexiblePathMatch && pathPattern) {
            // For flexible path matching, check if the path contains the pattern
            if (fullPath.includes(pathPattern)) {
              results.push(fullPath);
            }
          } else if (entry.name === name) {
            // For exact name matching
            results.push(fullPath);
          }
        }

        // Recursively search subdirectories
        if (entry.isDirectory()) {
          searchRecursive(fullPath, results);
        }
      }
    } catch (error) {
      // Ignore errors for individual directories
    }

    return results;
  };

  try {
    const results = searchRecursive(addonBasePath);
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    // Ignore errors during file search
    return null;
  }
};

/**
 * Get the test path from command line arguments
 * @returns {string|null} - The resolved test path or null if not found
 */
const getTestPath = () => {
  const args = process.argv;
  let testPath = null;

  // 1. Look for paths that include the addon name
  testPath = args.find(
    (arg) =>
      arg.includes(addonName) &&
      !arg.startsWith('--') &&
      arg !== 'test' &&
      arg !== 'node',
  );

  // 2. If not found, look for the argument after 'test'
  if (!testPath) {
    const testIndex = args.findIndex((arg) => arg === 'test');
    if (testIndex !== -1 && testIndex < args.length - 1) {
      const nextArg = args[testIndex + 1];
      if (!nextArg.startsWith('--')) {
        testPath = nextArg;
      }
    }
  }

  // 3. If still not found, look for any test file
  if (!testPath) {
    testPath = args.find(
      (arg) =>
        arg.endsWith('.test.js') ||
        arg.endsWith('.test.jsx') ||
        arg.endsWith('.test.ts') ||
        arg.endsWith('.test.tsx'),
    );
  }

  if (!testPath) {
    return null;
  }

  // Handle the case where only the filename or directory name is provided (no path separators)
  if (!testPath.includes(path.sep)) {
    // Check if it's a test file
    if (
      testPath.endsWith('.test.js') ||
      testPath.endsWith('.test.jsx') ||
      testPath.endsWith('.test.ts') ||
      testPath.endsWith('.test.tsx')
    ) {
      const foundTestFile = findInAddon(testPath, 'f');
      if (foundTestFile) {
        return foundTestFile;
      }
    }
    // Check if it's a directory name
    else {
      // Try exact directory name match
      const foundDir = findInAddon(testPath, 'd');
      if (foundDir) {
        return foundDir;
      }

      // Try flexible directory path match
      const flexibleDir = findInAddon(testPath, 'd', `-path "*${testPath}*"`);
      if (flexibleDir) {
        return flexibleDir;
      }
    }
  } else if (
    testPath.includes('.test.') &&
    !testPath.startsWith('src/addons/')
  ) {
    // Handle relative paths with test files (e.g., layout-templates/VisualizationCards.test.jsx)
    // Try to find the test file in the addon
    const testFileName = path.basename(testPath);
    const foundTestFile = findInAddon(testFileName, 'f');
    if (foundTestFile) {
      // Check if the found file path contains the relative path components
      const relativePath = path.dirname(testPath);
      if (foundTestFile.includes(relativePath)) {
        return foundTestFile;
      }

      // If not found with the exact relative path, try to find a file with a similar path
      // Helper function to find files that match a specific pattern
      const findFilesWithPattern = (baseDir, fileName, pathPattern) => {
        const results = [];

        const searchRecursive = (dir) => {
          if (!fs.existsSync(dir)) {
            return;
          }

          try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });

            for (const entry of entries) {
              const fullPath = path.join(dir, entry.name);

              // Check if this is a file with the matching name
              if (entry.isFile() && entry.name === fileName) {
                // Check if the path contains the pattern
                if (fullPath.includes(pathPattern)) {
                  results.push(fullPath);
                }
              }

              // Recursively search subdirectories
              if (entry.isDirectory()) {
                searchRecursive(fullPath);
              }
            }
          } catch (error) {
            // Ignore errors for individual directories
          }
        };

        searchRecursive(baseDir);
        return results;
      };

      const similarFiles = findFilesWithPattern(
        addonBasePath,
        testFileName,
        relativePath,
      );
      if (similarFiles && similarFiles.length > 0) {
        return similarFiles[0];
      }
    }
  }

  // If the path doesn't start with the addon base path and isn't absolute,
  // prepend the addon base path
  if (
    !path
      .normalize(testPath)
      .startsWith(path.join('src', 'addons', addonName, 'src')) &&
    !testPath.startsWith('/')
  ) {
    testPath = `${addonBasePath}/${testPath}`;
  }

  // Verify the path exists
  // First try with the path as is
  if (fs.existsSync(testPath)) {
    return testPath;
  }

  // If path has a trailing slash and doesn't exist, try without the trailing slash
  if (testPath.endsWith('/') && fs.existsSync(testPath.slice(0, -1))) {
    return testPath.slice(0, -1);
  }

  // If path doesn't have a trailing slash and doesn't exist, try with a trailing slash
  if (!testPath.endsWith('/') && fs.existsSync(`${testPath}/`)) {
    return testPath;
  }

  return testPath;
};

/**
 * Find the implementation file for a test file
 * @param {string} testPath - Path to the test file
 * @returns {string|null} - Path to the implementation file or null if not found
 */
const findImplementationFile = (testPath) => {
  // If the test path doesn't exist, return null
  if (!fs.existsSync(testPath)) {
    return null;
  }

  // Get the directory and filename
  const dirPath = path.dirname(testPath);
  const fileName = path.basename(testPath);

  // Skip if it's not a test file
  if (!fileName.includes('.test.')) {
    return null;
  }

  // Get the base name without extension and without .test
  const baseFileName = path
    .basename(fileName, path.extname(fileName))
    .replace('.test', '');

  // Try to find the implementation file
  const dirFiles = fs.readdirSync(dirPath);

  // First, try exact match (e.g., PreviewImage.test.js -> PreviewImage.js)
  const exactMatch = dirFiles.find((file) => {
    const fileBaseName = path.basename(file, path.extname(file));
    return (
      fileBaseName === baseFileName &&
      !file.includes('.test.') &&
      !file.includes('.spec.')
    );
  });

  if (exactMatch) {
    return `${dirPath}/${exactMatch}`;
  }

  // Try to find a file with a similar name
  const similarMatch = dirFiles.find((file) => {
    // Skip test files and directories
    if (
      file.includes('.test.') ||
      file.includes('.spec.') ||
      fs.statSync(`${dirPath}/${file}`).isDirectory()
    ) {
      return false;
    }

    // Get the base name without extension
    const fileBaseName = path.basename(file, path.extname(file));

    // Check if the file name is similar to our test file name
    return (
      fileBaseName.toLowerCase().includes(baseFileName.toLowerCase()) ||
      baseFileName.toLowerCase().includes(fileBaseName.toLowerCase())
    );
  });

  if (similarMatch) {
    return `${dirPath}/${similarMatch}`;
  }

  return null;
};

/**
 * Determine collectCoverageFrom patterns based on test path
 * @returns {string[]} - Array of coverage patterns
 */
const getCoveragePatterns = () => {
  // Default exclude patterns
  const excludePatterns = [
    '!src/**/*.d.ts',
    '!**/*.test.{js,jsx,ts,tsx}',
    '!**/*.spec.{js,jsx,ts,tsx}',
  ];

  // Default pattern for the whole addon
  const defaultPatterns = [
    `${addonBasePath}/**/*.{js,jsx,ts,tsx}`,
    ...excludePatterns,
  ];

  // First check for directory arguments without path separators
  const directoryArg = process.argv.find(
    (arg) =>
      !arg.includes('/') &&
      !arg.startsWith('--') &&
      arg !== 'test' &&
      arg !== 'node' &&
      !arg.endsWith('.js') &&
      !arg.endsWith('.jsx') &&
      !arg.endsWith('.ts') &&
      !arg.endsWith('.tsx') &&
      // Exclude common arguments that aren't directory names
      !['yarn', 'npm', 'npx', 'collectCoverage', 'watch'].includes(arg),
  );

  if (directoryArg) {
    // Try to find the directory in the addon
    const foundDir = findInAddon(directoryArg, 'd');
    if (foundDir) {
      return [`${foundDir}/**/*.{js,jsx,ts,tsx}`, ...excludePatterns];
    }
  }

  // Check for test file arguments with relative paths
  const testFileArg = process.argv.find(
    (arg) =>
      arg.includes('.test.') &&
      !arg.startsWith('--') &&
      arg !== 'test' &&
      arg !== 'node',
  );

  if (
    testFileArg &&
    testFileArg.includes('/') &&
    !testFileArg.startsWith('src/addons/')
  ) {
    // This is a relative path to a test file (e.g., layout-templates/VisualizationCards.test.jsx)
    const testFileName = path.basename(testFileArg);
    const relativePath = path.dirname(testFileArg);

    try {
      // Helper function to find files that match a specific pattern
      const findFilesWithPattern = (baseDir, fileName, pathPattern) => {
        const results = [];

        const searchRecursive = (dir) => {
          if (!fs.existsSync(dir)) {
            return;
          }

          try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });

            for (const entry of entries) {
              const fullPath = path.join(dir, entry.name);

              // Check if this is a file with the matching name
              if (entry.isFile() && entry.name === fileName) {
                // Check if the path contains the pattern
                if (fullPath.includes(pathPattern)) {
                  results.push(fullPath);
                }
              }

              // Recursively search subdirectories
              if (entry.isDirectory()) {
                searchRecursive(fullPath);
              }
            }
          } catch (error) {
            // Ignore errors for individual directories
          }
        };

        searchRecursive(baseDir);
        return results;
      };

      // Try to find the implementation file that corresponds to the test file
      const testFiles = findFilesWithPattern(
        addonBasePath,
        testFileName,
        relativePath,
      );

      if (testFiles && testFiles.length > 0) {
        const testFile = testFiles[0];
        const implFile = findImplementationFile(testFile);

        if (implFile) {
          return [implFile, '!src/**/*.d.ts'];
        }

        // If we couldn't find a specific implementation file, use the directory
        const dirPath = path.dirname(testFile);
        // Get the implementation file name (remove .test from the filename)
        const implFileName = testFileName.replace('.test.', '.');

        // Try to find the implementation file in the same directory
        const implFilePath = path.join(dirPath, implFileName);
        if (fs.existsSync(implFilePath)) {
          return [implFilePath, '!src/**/*.d.ts'];
        }

        return [`${dirPath}/**/*.{js,jsx,ts,tsx}`, ...excludePatterns];
      }
    } catch (error) {
      // If there's an error, continue with the normal flow
    }
  }

  // If no directory arg or directory not found, use the test path
  let testPath = getTestPath();
  if (!testPath) {
    return defaultPatterns;
  }

  // Remove trailing slash if present to ensure consistent path handling
  if (testPath.endsWith('/')) {
    testPath = testPath.slice(0, -1);
  }

  // Check if the test path is a file or directory
  try {
    const stats = fs.statSync(testPath);

    if (stats.isFile()) {
      // If it's a specific test file, find the corresponding implementation file
      const implFile = findImplementationFile(testPath);

      if (implFile) {
        return [implFile, '!src/**/*.d.ts'];
      }

      // If we couldn't find a specific implementation file, use the directory
      const dirPath = path.dirname(testPath);
      return [`${dirPath}/**/*.{js,jsx,ts,tsx}`, ...excludePatterns];
    } else if (stats.isDirectory()) {
      // If it's a directory, include ONLY files in that directory and its subdirectories
      return [`${testPath}/**/*.{js,jsx,ts,tsx}`, ...excludePatterns];
    }
  } catch (error) {
    // If there's an error (e.g., path doesn't exist), use default
  }

  return defaultPatterns;
};

// Get the coverage configuration
const coverageConfig = getCoveragePatterns();

module.exports = {
  testMatch: ['**/src/addons/**/?(*.)+(spec|test).[jt]s?(x)'],
  collectCoverageFrom: coverageConfig,
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'schema\\.[jt]s?$',
    'index\\.[jt]s?$',
    'config\\.[jt]sx?$',
  ],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '@plone/volto/cypress': '<rootDir>/node_modules/@plone/volto/cypress',
    '@plone/volto/babel': '<rootDir>/node_modules/@plone/volto/babel',
    '@plone/volto/(.*)$': '<rootDir>/node_modules/@plone/volto/src/$1',
    '@package/(.*)$': '<rootDir>/node_modules/@plone/volto/src/$1',
    '@root/(.*)$': '<rootDir>/node_modules/@plone/volto/src/$1',
    '@plone/volto-quanta/(.*)$': '<rootDir>/src/addons/volto-quanta/src/$1',
    '@eeacms/search/(.*)$': '<rootDir>/src/addons/volto-searchlib/searchlib/$1',
    '@eeacms/search': '<rootDir>/src/addons/volto-searchlib/searchlib',
    '@eeacms/(.*?)/(.*)$': '<rootDir>/node_modules/@eeacms/$1/src/$2',
    '@plone/volto-slate$':
      '<rootDir>/node_modules/@plone/volto/packages/volto-slate/src',
    '@plone/volto-slate/(.*)$':
      '<rootDir>/node_modules/@plone/volto/packages/volto-slate/src/$1',
    '~/(.*)$': '<rootDir>/src/$1',
    'load-volto-addons':
      '<rootDir>/node_modules/@plone/volto/jest-addons-loader.js',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@plone|@root|@package|@eeacms)/).*/',
  ],
  transform: {
    '^.+\\.js(x)?$': 'babel-jest',
    '^.+\\.ts(x)?$': 'babel-jest',
    '^.+\\.(png)$': 'jest-file',
    '^.+\\.(jpg)$': 'jest-file',
    '^.+\\.(svg)$': './node_modules/@plone/volto/jest-svgsystem-transform.js',
  },
  coverageThreshold: {
    global: {
      branches: 5,
      functions: 5,
      lines: 5,
      statements: 5,
    },
  },
  ...(process.env.JEST_USE_SETUP === 'ON' && {
    setupFilesAfterEnv: [
      fs.existsSync(
        path.join(
          __dirname,
          'node_modules',
          '@eeacms',
          addonName,
          'jest.setup.js',
        ),
      )
        ? `<rootDir>/node_modules/@eeacms/${addonName}/jest.setup.js`
        : `<rootDir>/src/addons/${addonName}/jest.setup.js`,
    ],
  }),
};
