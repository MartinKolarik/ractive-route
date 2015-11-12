/**
 * Router
 *
 * @param {Object} options
 * @constructor
 * @public
 */
function Router(options) {
	this.globals = options.globals || [];
	this.basePath = options.basePath || '';
	this.el = options.el;
	this.data = options.data || function () { return {}; };
	this.history = options.history || history;
	this.strictMode = !!options.strictMode;
	this.linksWatcher = null;
	this.stateWatcher = null;
	this.route = null;
	this.routes = [];
	this.uri = {};
}

/**
 * Add route
 *
 * @param {String} pattern
 * @param {Function} Handler
 * @param {Object} [observe]
 * @returns {Router}
 * @public
 */
Router.prototype.addRoute = function (pattern, Handler, observe) {
	this.routes.push(new Route(pattern, Handler, observe, this));

	return this;
};

/**
 * Build hash
 *
 * @param {String} mixIn
 * @returns {String}
 * @private
 */
Router.prototype.buildHash = function (mixIn) {
	var data = this.route.getState().hash;

	return !isEmpty(data) || !mixIn
		? stringifyHash(data)
		: mixIn;
};

/**
 * Build QS
 *
 * @param {Array} mixIn
 * @returns {String}
 * @private
 */
Router.prototype.buildQS = function (mixIn) {
	return stringifyQS(assign.apply(null, [{}].concat(mixIn, this.route.getState().qs)));
};

/**
 * Dispatch
 *
 * @param {String} request
 * @param {Object} [options]
 * @returns {Router}
 * @public
 */
Router.prototype.dispatch = function (request, options) {
	options = options || {};
	var uri = parseUri(request);
	var route = this.match(uri.path);
	var oldUri = this.uri;

	// 404
	if (!route) {
		return this.redirect(request);
	}

	if (options.reload || shouldDispatch(this.uri, uri, route)) {
		// prepare data
		if (this.route && this.route.view) {
			options.state = options.state || {};

			this.globals.forEach(function (global) {
				if (options.state[global] === undefined) {
					options.state[global] = this.route.view.get(global);
				}
			}, this);
		}

		var defaults = typeof this.data === 'function' ? this.data() : this.data;
		var data = assign(defaults, options.state, options.hash, options.qs);

		// destroy existing route
		if (this.route) {
			this.route.destroy();
		}

		// init new route
		this.uri = uri;
		this.route = route.init(uri, data);
	}

	// will scroll to the top if there is no matching element
	scrollTo(uri.hash.substr(1));

	// update history
	return this.update(!oldUri.path || oldUri.path !== uri.path, !options.noHistory, uri);
};

/**
 * Get URI
 *
 * @returns {String}
 * @public
 */
Router.prototype.getUri = function () {
	return location.pathname.substr(this.basePath.length) + location.search + location.hash;
};

/**
 * Init
 *
 * @param {Object} [options]
 * @returns {Router}
 * @public
 */
Router.prototype.init = function (options) {
	return this.dispatch(this.getUri(), assign({ noHistory: true }, options));
};

/**
 * Get the first `route` matching the `request`
 *
 * @param {String} request
 * @returns {Object|null}
 * @public
 */
Router.prototype.match = function (request) {
	var i = -1;

	while (this.routes[++i]) {
		if (this.routes[i].match(request)) {
			return this.routes[i];
		}
	}

	return null;
};

/**
 * Redirect
 *
 * @param {String} request
 * @returns {Router}
 * @private
 */
Router.prototype.redirect = function (request) {
	location.pathname = joinPaths(this.basePath, request);

	return this;
};

/**
 * Unwatch links
 *
 * @returns {Router}
 * @public
 */
Router.prototype.unwatchLinks = function () {
	if (this.linksWatcher) {
		document.body.removeEventListener('click', this.linksWatcher);
		this.linksWatcher = null;
	}

	return this;
};

/**
 * Unwatch state
 *
 * @returns {Router}
 * @public
 */
Router.prototype.unwatchState = function () {
	if (this.stateWatcher) {
		window.removeEventListener('popstate', this.stateWatcher);
		this.stateWatcher = null;
	}

	return this;
};

/**
 * Update
 *
 * @param {Boolean} [pathChange]
 * @param {Boolean} [history] - true = always, false = never, undefined = if something changed
 * @param {Object} [uri]
 * @returns {Router}
 * @private
 */
Router.prototype.update = function (pathChange, history, uri) {
	if (!this.route) {
		return this;
	}

	uri = uri || { qs: '', hash: '' };
	var path = joinPaths(this.basePath, this.uri.path);
	var qs = this.buildQS([ parseQS(uri.qs) ].concat(!pathChange ? [ parseQS(location.search) ] : []));
	var hash = this.buildHash(uri.hash);
	var newUri = path + qs + hash;
	var oldUri = location.pathname + location.search + location.hash;
	var state = this.route.getState().state;
	this.uri.qs = qs;
	this.uri.hash = hash;

	if (history === true) {
		this.history.pushState(state, null, newUri);
	} else if (history === false) {
		this.history.replaceState(state, null, newUri);
	} else if (newUri !== oldUri) {
		this.history.pushState(state, null, newUri);
	}

	return this;
};

/**
 * Watch links
 *
 * @param {RegExp} [pattern]
 * @returns {Router}
 * @public
 */
Router.prototype.watchLinks = function (pattern) {
	pattern = pattern || new RegExp('^((https?:)?\\/\\/' + location.hostname.replace(/\./g, '\\.') + '.*|((?!\\/\\/)[^:]+))$');
	var _this = this;

	document.body.addEventListener('click', this.unwatchLinks().linksWatcher = function (e) {
		var el = parents(e.target, 'a');

		if (el) {
			var href = el.getAttribute('href') || el.getAttribute('data-href');

			if (href && !el.classList.contains('router-ignore') && pattern.test(href)) {
				_this.dispatch(href);

				e.preventDefault();
			}
		}
	});

	return this;
};

/**
 * Watch state
 *
 * @returns {Router}
 * @public
 */
Router.prototype.watchState = function () {
	var _this = this;

	window.addEventListener('popstate', this.unwatchState().stateWatcher = function(e) {
		if (e.state) {
			_this.init({ state: e.state });
		}
	});

	return this;
};

/**
 * Should dispatch
 *
 * @param {Object} oldUri
 * @param {Object} newUri
 * @param {Object} route
 * @returns {Boolean}
 * @private
 */
function shouldDispatch(oldUri, newUri, route) {
	return oldUri.path !== newUri.path
		|| oldUri.qs !== newUri.qs
		|| (decodeURIComponent(oldUri.hash) !== decodeURIComponent(newUri.hash) && (!route || route.observe.hash.length));
}
