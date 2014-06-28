(function () {
	var expect = chai.expect;
	var Route = Ractive.Router.Route;

	describe('Route', function () {
		describe('Route()', function () {
			var Handler = Ractive.extend({
				data: { a: 1, b: 2, c: 3, x: 4 }
			});

			it('should create a map', function () {
				expect(new Route('/aa/:bb/:cc?/:dd(\\d+)/', Handler).map).to.deep.equal([ 'bb', 'cc', 'dd' ]);
			});

			it('should create a regExp', function () {
				expect(new Route('/aa/:bb/:cc?/:dd(\\d+)/', Handler).regExp.toString()).to.equal('/^\\/?aa(?:\\/([^\\/]+))(?:\\/([^\\/]+))?(?:\\/(\\d+))\\/?$/i');
				expect(new Route('aa/:bb/:cc?/:dd(\\d+)', Handler).regExp.toString()).to.equal('/^\\/?aa(?:\\/([^\\/]+))(?:\\/([^\\/]+))?(?:\\/(\\d+))\\/?$/i');
			});

			it('should create a strict regExp', function () {
				expect(new Route('/aa/:bb/:cc?/:dd(\\d+)', Handler).strictRegExp.toString()).to.equal('/^\\/aa(?:\\/([^\\/]+))(?:\\/([^\\/]+))?(?:\\/(\\d+))$/');
			});

			it('should create a list of all observed keys', function () {
				expect(new Route('', Handler, { qs: [ 'a' ], hash: [ 'b' ], state: [ 'c' ]}).allObserved).to.deep.equal([ 'a', 'b', 'c' ]);
			});
		});

		describe('destroy()', function () {
			var Handler = Ractive.extend({
				data: { a: 1, b: 2, c: 3, x: 4 }
			});

			it('should destroy the view', function () {
				expect(new Route('', Handler).init({ path: '', qs: '', hash: '' }, {}).destroy().view).to.be.null;
			});
		});

		describe('getState()', function () {
			var Handler = Ractive.extend({
				data: { a: 1, b: 2, c: 3, x: 4 }
			});

			it('should get the correct state', function () {
				var route = new Route('', Handler, { qs: [ 'a' ], hash: [ 'b' ], state: [ 'c' ]}).init({ path: '', qs: '', hash: ''}, {});

				expect(route.getState()).to.deep.equal({ qs: { a: 1 }, hash: { b: 2 }, state: { c: 3 } });
			});
		});

		describe('init()', function () {
			var Handler = Ractive.extend({
				data: { a: 1, b: 2, c: 3, x: 4 }
			});

			it('should init new Ractive instance with correct data', function () {
				var route = new Route('/:aa/:bb', Handler, { qs: [ 'a' ], hash: [ 'b' ], state: [ 'c' ]}).init({ path: '/x/y', qs: '?a=1', hash: ''}, {});

				expect(route.view.get('aa')).to.equal('x');
				expect(route.view.get('bb')).to.equal('y');
				expect(route.view.get('a')).to.equal(1);
				expect(route.view.get('b')).to.equal(2);
				expect(route.view.get('c')).to.equal(3);
				expect(route.view.get('x')).to.equal(4);
			});

			it('should register an observer', function (done) {
				var route = new Route('', Handler, { qs: [ 'a' ], hash: [ 'b' ], state: [ 'c' ]});
				route.Handler.prototype.observe = function (keypath) {
					expect(keypath).to.equal('a b c');
					done();
				};

				route.init({ path: '', qs: '', hash: ''}, {});
			});

			it('should set __ready to true', function () {
				expect(new Route('', Handler).init({ path: '', qs: '', hash: ''}, {}).view.get('__ready')).to.be.true;
			});
		});

		describe('match()', function () {
			var Handler = Ractive.extend({
				data: { a: 1, b: 2, c: 3, x: 4 }
			});

			it('should match the pattern', function () {
				expect(new Route('/aa/:bb/:cc?/:dd(\\d+)/', Handler).match('/aa/x/y/1/', true)).to.be.true;
				expect(new Route('/aa/:bb/:cc?/:dd(\\d+)/', Handler).match('/aa/x/y/1')).to.be.true;
				expect(new Route('/aa/:bb/:cc?/:dd(\\d+)/', Handler).match('aa/x/1')).to.be.true;
			});

			it('shouldn\'t match the pattern', function () {
				expect(new Route('/aa/:bb/:cc?/:dd(\\d+)/', Handler).match('/aa/x/y/1', true)).to.be.false;
				expect(new Route('/aa/:bb/:cc?/:dd(\\d+)/', Handler).match('aa/x/y/1/', true)).to.be.false;
			});
		});

		describe('parsePath()', function () {
			var Handler = Ractive.extend({
				data: { a: 1, b: 2, c: 3, x: 4 }
			});

			it('should work', function () {
				expect(new Route('/aa/:bb/:cc?/:dd(\\d+)/', Handler).parsePath('/aa/x/y/1/', true)).to.deep.equal({ bb: 'x', cc: 'y', dd: 1  });
				expect(new Route('/aa/:bb/:cc?/:dd(\\d+)/', Handler).parsePath('/aa/x/1/', true)).to.deep.equal({ bb: 'x', dd: 1  });
			});
		});
	});
})();