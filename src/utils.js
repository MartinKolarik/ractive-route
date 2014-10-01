/**
 * Assign
 *
 * @param {Object} object
 * @param {...Object} source
 * @returns {Object}
 * @private
 */
function assign(object, source) {
	for (var i = 1, c = arguments.length; i < c; i++) {
		for (var x in arguments[i]) {
			if (arguments[i].hasOwnProperty(x) && arguments[i][x] !== undefined) {
				object[x] = arguments[i][x];
			}
		}
	}

	return object;
}
/**
 * Compact
 *
 * @param {Object} collection

 * @returns {Object}
 * @private
 */
function compact(collection) {
	return pick(collection, function (value) {
		return !isEmpty(value);
	});
}

/**
 * Is empty
 *
 * @param {*} value
 * @returns {Boolean}
 * @private
 */
function isEmpty(value) {
	if (!value || typeof value !== 'object') {
		return !value;
	}

	return !Object.keys(value).length;
}

/**
 * Join paths
 *
 * @param {...String} parts
 * @returns {String}
 * @private
 */
function joinPaths(parts) {
	return Array.prototype.slice.call(arguments)
		.join('/')
		.replace(/\/+/g, '/');
}

/**
 * Parents
 *
 * @param {Element} el
 * @param {String} name
 * @returns {Element|null}
 * @private
 */
function parents(el, name) {
	while (el && el.nodeName.toLowerCase() !== name) {
		el = el.parentNode;
	}

	return el && el.nodeName.toLowerCase() === name
		? el
		: null;
}

/**
 * Parse hash
 *
 * @param {String} hash
 * @param {Array} [keys]
 * @returns {Object}
 * @private
 */
function parseHash(hash, keys) {
	try {
		var parsed = compact(JSON.parse(decodeURIComponent(hash.substr(2))));

		return keys
			? pick(parsed, keys)
			: parsed;
	} catch (e) {
		return {};
	}
}

/**
 * Parse JSON
 *
 * @param {String} string
 * @returns {*}
 * @private
 */
function parseJSON(string) {
	try {
		return JSON.parse(string);
	} catch (e) {
		return string || '';
	}
}

/**
 * Parse URI
 *
 * @param {String} uri
 * @returns {{protocol: string, host: string, path: string, qs: string, hash: string}}
 * @private
 */
function parseUri(uri) {
	var parts = uri.match(/^(?:([\w+.-]+):\/\/([^/]+))?([^?#]*)?(\?[^#]*)?(#.*)?/);

	return {
		protocol: parts[1] || '',
		host: parts[2] || '',
		path: parts[3] || '',
		qs: parts[4] || '',
		hash: parts[5] || ''
	};
}

/**
 * Parse QS
 *
 * @param {String} qs
 * @param {Array} [keys]
 * @returns {Object}
 * @private
 */
function parseQS(qs, keys) {
	var index = qs.indexOf('?');
	var parsed = {};

	if (index !== -1) {
		var pairs = qs.substr(index + 1).split('&');
		var pair = [];

		for (var i = 0, c = pairs.length; i < c; i++) {
			pair = pairs[i].split('=');

			if((!isEmpty(pair[1])) && (!isEmpty(parseJSON(pair[1])))) {
				parsed[decodeURIComponent(pair[0])] = parseJSON(decodeURIComponent(pair[1]));
			}
		}
	}

	return keys
		? pick(parsed, keys)
		: parsed;
}

/**
 * Pick
 *
 * @param {Object} object
 * @param {Array|Function} keys
 * @returns {Object}
 * @private
 */
function pick(object, keys) {
	var data = {};

	if (typeof keys === 'function') {
		for (var x in object) {
			if (object.hasOwnProperty(x) && keys(object[x], x)) {
				data[x] = object[x];
			}
		}
	} else {
		for (var i = 0, c = keys.length; i < c; i++) {
			data[keys[i]] = object[keys[i]];
		}
	}

	return data;
}

/**
 * Scroll to
 *
 * @param {String} id
 * @private
 */
function scrollTo(id) {
	var el = document.getElementById(id);

	if (el) {
		window.scrollBy(0, el.getBoundingClientRect().top);
	} else {
		window.scrollTo(0, 0);
	}
}

/**
 * Stringify
 *
 * @param {*} value
 * @returns {String}
 * @private
 */
function stringify(value) {
	if (!value || typeof value !== 'object') {
		return value;
	}

	return JSON.stringify(value);
}

/**
 * Stringify hash
 *
 * @param {Object} data
 * @returns {String}
 * @private
 */
function stringifyHash(data) {
	data = compact(data);

	return !isEmpty(data)
		? '#!' + encodeURIComponent(stringify(data))
		: '';
}

/**
 * Stringify QS
 * @param {Object} data
 * @returns {String}
 */
function stringifyQS(data) {
	var qs = '';

	for (var x in data) {
		if (data.hasOwnProperty(x) && !isEmpty(data[x])) {
			qs += '&' + encodeURIComponent(x) + '=' + encodeURIComponent(stringify(data[x]));
		}
	}

	return qs
		? '?' + qs.substr(1)
		: '';
}
