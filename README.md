# volto-listing-block

[![Releases](https://img.shields.io/github/v/release/eea/volto-listing-block)](https://github.com/eea/volto-listing-block/releases)

[![Pipeline](https://ci.eionet.europa.eu/buildStatus/icon?job=volto-addons%2Fvolto-listing-block%2Fmaster&subject=master)](https://ci.eionet.europa.eu/view/Github/job/volto-addons/job/volto-listing-block/job/master/display/redirect)
[![Lines of Code](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-listing-block&metric=ncloc)](https://sonarqube.eea.europa.eu/dashboard?id=volto-listing-block)
[![Coverage](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-listing-block&metric=coverage)](https://sonarqube.eea.europa.eu/dashboard?id=volto-listing-block)
[![Bugs](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-listing-block&metric=bugs)](https://sonarqube.eea.europa.eu/dashboard?id=volto-listing-block)
[![Duplicated Lines (%)](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-listing-block&metric=duplicated_lines_density)](https://sonarqube.eea.europa.eu/dashboard?id=volto-listing-block)

[![Pipeline](https://ci.eionet.europa.eu/buildStatus/icon?job=volto-addons%2Fvolto-listing-block%2Fdevelop&subject=develop)](https://ci.eionet.europa.eu/view/Github/job/volto-addons/job/volto-listing-block/job/develop/display/redirect)
[![Lines of Code](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-listing-block&branch=develop&metric=ncloc)](https://sonarqube.eea.europa.eu/dashboard?id=volto-listing-block&branch=develop)
[![Coverage](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-listing-block&branch=develop&metric=coverage)](https://sonarqube.eea.europa.eu/dashboard?id=volto-listing-block&branch=develop)
[![Bugs](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-listing-block&branch=develop&metric=bugs)](https://sonarqube.eea.europa.eu/dashboard?id=volto-listing-block&branch=develop)
[![Duplicated Lines (%)](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-listing-block&branch=develop&metric=duplicated_lines_density)](https://sonarqube.eea.europa.eu/dashboard?id=volto-listing-block&branch=develop)

[Volto](https://github.com/plone/volto) add-on

## Features

This package aims to provide a framework for more flexible listings for the
Listing Volto block. It introduces the concept of UniversalCard, which is a
generic component governed by a designated "itemModel".

It provides several views and integrates with the Teaser Grid.

![Listing Block](https://raw.githubusercontent.com/eea/volto-listing-block/master/docs/volto-listing-block.gif)

## Upgrade

### Upgrading to 1.x

This version requires: `@plone/volto >= 16.0.0.alpha.15` (`volto-slate` part of Volto Core).

## Getting started

### Try volto-listing-block with Docker

      git clone https://github.com/eea/volto-listing-block.git
      cd volto-listing-block
      make
      make start

Go to http://localhost:3000

`make start` now defaults to Volto 18. To run the same setup against Volto 17, use:

      VOLTO_VERSION=17 make
      VOLTO_VERSION=17 make start

### Add volto-listing-block to your Volto project

1. Make sure you have a [Plone backend](https://plone.org/download) up-and-running at http://localhost:8080/Plone

   ```Bash
   docker compose up backend
   ```

1. Start Volto frontend

* If you already have a volto project, just update `package.json`:

   ```JSON
   "dependencies": {
       "@eeacms/volto-listing-block": "*"
   }
   ```

   and `volto.config.js`:

   ```JavaScript
   const addons = ['@eeacms/volto-listing-block'];
   ```

* If not, create one with Cookieplone, as recommended by the official Plone documentation for Volto 18+:

   ```
   uvx cookieplone project
   cd project-title
   ```

1. Install or update dependencies, then start the project:

   ```
   make install
   ```

   For a Cookieplone project, start the backend and frontend in separate terminals:

   ```
   make backend-start
   make frontend-start
   ```

   For a legacy Volto 17 project, install the package with `yarn` and restart the frontend as usual.

1. Go to http://localhost:3000

1. Happy editing!

## Release

See [RELEASE.md](https://github.com/eea/volto-listing-block/blob/master/RELEASE.md).

## How to contribute

See [DEVELOP.md](https://github.com/eea/volto-listing-block/blob/master/DEVELOP.md).

## Copyright and license

The Initial Owner of the Original Code is European Environment Agency (EEA).
All Rights Reserved.

See [LICENSE.md](https://github.com/eea/volto-listing-block/blob/master/LICENSE.md) for details.

## Funding

[European Environment Agency (EU)](http://eea.europa.eu)
