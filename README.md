# RSS Aggregator

## Overview

This is an RSS reader.

#### DEMO - https://rss-aggregator.aleksey-vl-ivanov.com

[![Node CI](https://github.com/alekseyvlivanov/rss-aggregator/workflows/Node%20CI/badge.svg)](https://github.com/alekseyvlivanov/rss-aggregator/actions)
[![Maintainability](https://api.codeclimate.com/v1/badges/b0ba463df67dfab87af8/maintainability)](https://codeclimate.com/github/alekseyvlivanov/rss-aggregator/maintainability)
[![Netlify Status](https://api.netlify.com/api/v1/badges/80053436-aca1-4a86-94dd-0b0d4373684b/deploy-status)](https://app.netlify.com/sites/rss-aggregator-aleksey-vl-ivanov/deploys)

<div align="center">
<img src="rss-aggregator.png" width="400px">
</div>

## Features

- DOM manipulation
- form validation
- internationalization (EN/RU)
- MVC
- [All Origins](https://github.com/gnuns/allorigins) is used as a CORS proxy
- using [Makefile](https://makefile.site) for better command management

## Dependencies

- vanilla js
- [axios](https://github.com/axios/axios) for AJAX
- styling with [Bootstrap](https://getbootstrap.com) (css only)
- interface localization with [i18next](https://www.i18next.com)
- [Lodash](https://github.com/lodash/lodash) is used to compare nested objects
- [on-change](https://github.com/sindresorhus/on-change) wathes for state and initiates renderings
- validating form data with [Yup](https://github.com/jquense/yup)

## Install

```
$ git clone ...
$ cd rss-aggregator
$ make  install
```

## Usage

```
$ make develop
```

and open http://localhost:8080 in your browser, or

```
$ make build
```

and deploy somewhere your new **dist** folder.
