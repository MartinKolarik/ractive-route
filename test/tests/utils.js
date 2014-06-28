var expect = require('chai').expect;
var rewire = require('rewire');
var utils = rewire('../../src/utils.js');

describe('utils.js', function () {
	describe('assign()', function () {
		var assign = utils.__get__('assign');

		it('should assign the properties of multiple sources into target', function () {
			var target = { a: 1, b: 1 };
			var source1 = { a: 2, c: 2, d: 2 };
			var source2 = { a: 3, c: 3, e: 3 };
			var result = { a: 3, b: 1, c: 3, d: 2, e: 3 };

			expect(assign(target, source1, source2)).to.deep.equal(result);
			expect(target).to.deep.equal(result);
		});

		it('shouldn\'t assign undefined values', function () {
			expect(assign({ a: 1 }, { b: undefined })).to.deep.equal({ a: 1 });
		});

		it('shouldn\'t fail if source is not an object', function () {
			expect(assign({ a: 1 }, undefined)).to.deep.equal({ a: 1 });
		});
	});

	describe('isEmpty()', function () {
		var isEmpty = utils.__get__('isEmpty');

		it('should return true for false', function () {
			expect(isEmpty(false)).to.be.true;
		});

		it('should return true for null', function () {
			expect(isEmpty(null)).to.be.true;
		});

		it('should return true for undefined', function () {
			expect(isEmpty(undefined)).to.be.true;
		});

		it('should return true for an empty string', function () {
			expect(isEmpty('')).to.be.true;
		});

		it('should return true for zero', function () {
			expect(isEmpty(0)).to.be.true;
		});

		it('should return true for en empty array', function () {
			expect(isEmpty([])).to.be.true;
		});

		it('should return true for en empty object', function () {
			expect(isEmpty({})).to.be.true;
		});

		it('should return false for everything else', function () {
			expect(isEmpty(true)).to.be.false;
			expect(isEmpty('x')).to.be.false;
			expect(isEmpty(1)).to.be.false;
			expect(isEmpty([ 1 ])).to.be.false;
			expect(isEmpty({ a: 1 })).to.be.false;
		});
	});

	describe('joinPaths()', function () {
		var joinPaths = utils.__get__('joinPaths');

		it('should join the paths correctly', function () {
			expect(joinPaths('aa', 'bb', 'cc')).to.equal('aa/bb/cc');
			expect(joinPaths('/aa/', '/bb/', 'cc')).to.equal('/aa/bb/cc');
			expect(joinPaths('', '')).to.equal('/');
			expect(joinPaths('/', '/')).to.equal('/');
		});

		it('should preserve the trailing slash', function () {
			expect(joinPaths('/aa/', '/bb/')).to.equal('/aa/bb/');
		});

		it('shouldn\'t add a trailing slash', function () {
			expect(joinPaths('/aa/', '/bb')).to.equal('/aa/bb');
		});
	});

	describe('parseHash()', function () {
		var parseHash = utils.__get__('parseHash');

		it('should parse the hash correctly', function () {
			expect(parseHash('!#{"a":1,"b":"2"}')).to.deep.equal({ a: 1, b: '2' });
		});

		it('shouldn\'t return empty values', function () {
			expect(parseHash('?!{"a":""}')).to.deep.equal({});
		});

		it('should return only defined keys', function () {
			expect(parseHash('!#{"a":1,"b":"2"}', [ 'a' ])).to.deep.equal({ a: 1 });
		});

		it('should return an empty object if hash is not a valid JSON', function () {
			expect(parseHash('!#"a":1,"b":"2"}')).to.deep.equal({});
		});
	});

	describe('parseUri()', function () {
		var parseUri = utils.__get__('parseUri');

		it('should parse relative URI correctly', function () {
			expect(parseUri('/aaa/bbb/?a=1&b=2#cccc')).to.deep.equal({
				protocol: '',
				host: '',
				path: '/aaa/bbb/',
				qs: '?a=1&b=2',
				hash: '#cccc'
			});

			expect(parseUri('/aaa/bbb/#cccc')).to.deep.equal({
				protocol: '',
				host: '',
				path: '/aaa/bbb/',
				qs: '',
				hash: '#cccc'
			});
		});

		it('should parse absolute URI correctly', function () {
			expect(parseUri('ftp://sub.domain.com/path/to/the/file?qs=qs#hash')).to.deep.equal({
				protocol: 'ftp',
				host: 'sub.domain.com',
				path: '/path/to/the/file',
				qs: '?qs=qs',
				hash: '#hash'
			});
		});
	});

	describe('parseQS()', function () {
		var parseQS = utils.__get__('parseQS');

		it('should parse the QS correctly', function () {
			expect(parseQS('?a=1&b="2"')).to.deep.equal({ a: 1, b: '2' });
		});

		it('shouldn\'t return empty values', function () {
			expect(parseQS('?a&b=&c=""')).to.deep.equal({});
		});

		it('should return only defined keys', function () {
			expect(parseQS('?a=1&b="2"', [ 'a' ])).to.deep.equal({ a: 1 });
		});
	});

	describe('pick()', function () {
		var pick = utils.__get__('pick');

		it('should pick the correct properties', function () {
			expect(pick({ a: 1, b: 2, c: 3 }, [ 'a', 'c' ])).to.deep.equal({ a: 1, c: 3 });
			expect(pick({ a: 1, b: 2, c: 3 }, function (value) {
				return value !== 2;
			})).to.deep.equal({ a: 1, c: 3 });
		});
	});

	describe('stringify()', function () {
		var stringify = utils.__get__('stringify');

		it('should not stringify false', function () {
			expect(stringify(false)).to.be.false;
		});

		it('should not stringify true', function () {
			expect(stringify(true)).to.be.true;
		});

		it('should not stringify null', function () {
			expect(stringify(null)).to.be.null;
		});

		it('should not stringify undefined', function () {
			expect(stringify(undefined)).to.be.undefined;
		});

		it('should not stringify an empty string', function () {
			expect(stringify('')).to.equal('');
		});

		it('should not stringify numbers', function () {
			expect(stringify(123)).to.be.a.number;
		});

		it('should stringify everything else', function () {
			expect(stringify([ 1, 2 ])).to.equal('[1,2]');
			expect(stringify({ a: 1, b: '2' })).to.equal('{"a":1,"b":"2"}');
		});
	});

	describe('stringifyHash()', function () {
		var stringifyHash = utils.__get__('stringifyHash');

		it('should stringify the hash', function () {
			expect(stringifyHash({ a: 1, b: 2, c: '' })).to.equal('#!%7B%22a%22%3A1%2C%22b%22%3A2%7D');
		});

		it('should return an empty string for empty object', function () {
			expect(stringifyHash({})).to.equal('');
		});
	});

	describe('stringifyQS()', function () {
		var stringifyQS = utils.__get__('stringifyQS');

		it('should stringify the QS', function () {
			expect(stringifyQS({ a: 1, b: 2, c: '' })).to.equal('?a=1&b=2');
		});

		it('should return an empty string for empty object', function () {
			expect(stringifyQS({})).to.equal('');
		});
	});
});