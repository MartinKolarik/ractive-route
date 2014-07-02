/**
 * Route
 *
 * @param {string} pattern
 * @param {function} Handler
 * @param {Object} [observe]
 * @param {Object} [router]
 * @constructor
 * @public
 */
function Route(pattern, Handler, observe, router) {
	this.pattern = pattern;
	this.map = parsePattern(pattern);
	this.regExp = patternToRegExp(pattern);
	this.strictRegExp = patternToStrictRegExp(pattern);
	this.isComponent = !!Handler.extend;
	this.Handler = this.isComponent ? extendHandler(Handler) : Handler;
	this.observe = assign({ qs: [], hash: [], state: [] }, observe);
	this.allObserved = this.observe.qs.concat(this.observe.hash, this.observe.state);
	this.router = router || {};
	this.view = null;
}

/**
 * Destroy
 *
 * @returns {Route}
 * @private
 */
Route.prototype.destroy = function () {
	if (this.view) {
		this.view.teardown();
		this.view = null;
	}

	return this;
};

/**
 * Get state
 *
 * @returns {Object}
 * @private
 */
Route.prototype.getState = function () {
	var data = {};

	for (var i = 0, c = this.allObserved.length; i < c; i++) {
		data[this.allObserved[i]] = this.view.get(this.allObserved[i]);
	}

	return {
		qs: pick(data, this.observe.qs),
		hash: pick(data, this.observe.hash),
		state: pick(data, this.observe.state)
	};
};

/**
 * Init
 *
 * @param {Object} uri
 * @param {Object} data
 * @returns {Route}
 * @private
 */
Route.prototype.init = function (uri, data) {
	var _this = this;

	assign(
		data,
		this.parsePath(uri.path),
		parseQS(uri.qs, this.observe.qs),
		parseHash(uri.hash, this.observe.hash)
	);

	// not a component
	if (!this.isComponent) {
		this.Handler({ el: this.router.el, data: data });
	} else {
		// init new Ractive
		this.view = new this.Handler({
			el: this.router.el,
			data: data
		});

		// observe
		if (this.allObserved.length) {
			this.view.observe(this.allObserved.join(' '), function () {
				if (!_this.updating) {
					_this.router.update();
				}
			}, { init: false });
		}

		// notify Ractive we're done here
		this.view.set('__ready', true);
	}

	return this;
};

/**
 * Match
 *
 * @param {string} request
 * @param {boolean} strict
 * @returns {boolean}
 * @private
 */
Route.prototype.match = function (request, strict) {
	return strict
		? this.strictRegExp.test(request)
		: this.regExp.test(request);
};

/**
 * Parse path
 *
 * @param {string} path
 * @returns {Object}
 * @private
 */
Route.prototype.parsePath = function(path) {
	var parsed = path.match(this.regExp);
	var data = {};

	for (var i = 0, c = this.map.length; i < c; i++) {
		if (!isEmpty(parsed[i + 1])) {
			data[this.map[i]] = parseJSON(parsed[i + 1]);
		}
	}

	return data;
};

/**
 * Extend handler
 *
 * @param {function} Handler
 * @returns {function}
 * @private
 */
function extendHandler(Handler) {
	return Handler.extend({ // see ractive#837
		init: function (options) {
			if (options.data) {
				this.set(options.data);
			}

			if (this._super) {
				this._super();
			}
		}
	});
}

/**
 * Parse pattern
 *
 * @param {string} pattern
 * @returns {Array}
 * @private
 */
function parsePattern(pattern) {
	return (pattern.match(/\/:\w+/g) || []).map(function (name) {
		return name.substr(2);
	});
}

/**
 * Pattern to RegExp
 *
 * @param pattern
 * @returns {RegExp}
 * @private
 */
function patternToRegExp(pattern) {
	return new RegExp(
		patternToRegExpString(pattern)
			.replace(/^\^(\\\/)?/, '^\\/?')
			.replace(/(\\\/)?\$$/, '\\/?$'),
		'i'
	);
}

/**
 * Pattern to RegExp string
 *
 * @param {string} pattern
 * @returns {string}
 * @private
 */
function patternToRegExpString(pattern) {
	return ('^' + pattern + '$')
		.replace(/\/:\w+(\([^)]+\))?/g, '(?:\/([^/]+)$1)')
		.replace(/\(\?:\/\(\[\^\/]\+\)\(/, '(?:/(')
		.replace(/\//g, '\\/');
}

/**
 * Pattern to strict RegExp
 *
 * @param {string} pattern
 * @returns {RegExp}
 * @private
 */
function patternToStrictRegExp(pattern) {
	return new RegExp(patternToRegExpString(pattern));
}