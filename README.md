# ractive-route

Simple routing library for Ractive.js with support for two way (model <-> URI) data binding.

[See it in action!](http://rawgit.com/MartinKolarik/ractive-route/master/demo/index.html) ([source](https://github.com/MartinKolarik/ractive-route/tree/master/demo))

## Get started

```
https://cdn.jsdelivr.net/npm/ractive-route@0.3.5/ractive-route.min.js
```

ractive-route will always expose itself as `Ractive.Router`. Additionally, you can load it using AMD or CommonJS module loader.

## API

### new Router(options)

**options** `Object`:

**el** `HTMLElement|string|jQuery-like collection`

`el` that will be passed to your Ractive components.

**data** `function`

A function that will be invoked every time a time a new component is created and the returned data will be passed to your component.

**basePath** `string` (default: `''`)

Path to your application.

**history** `Object` (default: `window.history`)

Custom History API to use. It has to implement `pushState()` and `replaceState()` methods.

**strictMode** `boolean` (default: `false`)

If set to `false`, URLs are case insensitive and starting and trailing slashes are ignored.

**reloadOnClick** `boolean` (default: `false`)

If set to `true`, clicking on a link will always force a `dispatch()`.

### addRoute(pattern, Handler[, observe])

**pattern** `string`

Can contain required or optional variables:

```
/users/:id/ - required
/users/:id?/ - optional
```

By default, every variable will match anything except `/`. You can specify a pattern for each variable if you want:

```
/users/:id(\d+)/
/users/:id(\d+)?/
```

**Handler** `function`

Ractive component or function to handle the requests.

**Observe** `Object`

This object can contain one or more of the following properties:

- `qs` - a list of keys that will be observed and synced with query string.
- `hash` - a list of keys that will be observed and synced with hash.
- `state` - a list of keys that will be observed and synced with the History API.

### dispatch(request[, options])

Dispatch the `request` to the first `route` matching the `request`. If there is no such route, redirect to the requested URI.

**request** `string`

Either a relative or an absolute URI.

**options** `Object`:

**reload** `boolean` (default: `false`)

If set to `false`, then the request will be dispatched only if there is a difference between the new and the current URI.

**noHistory** `boolean` (default: `false`)

If set to `false`, then `replaceState()` will be used instead of `pushState()`.

**qs** `Object`

Additional query string data. These two lines will do exactly the same:

```js
router.dispatch('/users/123/?search=a');
router.dispatch('/users/123/', { qs: { search: 'a' } });
```

**hash** `Object`

Additional hash data. These two lines will do exactly the same:

```js
router.dispatch('/users/123#!{"search":"a"}');
router.dispatch('/users/123/', { hash: { search: 'a' } });
```

**state** `Object`

State data that will be passed to `pushState()` function.

### getUri()

Returns a current URI relative to `basePath`.

### init(options)

A shorthand for:

```js
router.dispatch(router.getUri(), { noHistory: true });
```

### match(request)

Returns a first `route` matching the `request` or `null`.

### watchLinks([pattern])

Watch all links that don't have `router-ignore` class and match the `pattern` and perform `dispatch()` on `click`. The default `pattern` matches all internal links.

**pattern** `RegExp` (default: `new RegExp('^((https?:)?\\/\\/' + location.hostname.replace(/\./g, '\\.') + '.*|((?!\\/\\/)[^:]+))$');`)

### unwatchLinks()

Stop listening to `click` events.

### watchState()

Perform `dispatch()` on `popstate`.

### unwatchState()

Stop listening to `popstate` events.

## License
Copyright (c) 2014 - 2017 Martin Kolárik. Released under the MIT license.
