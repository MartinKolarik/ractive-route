(function () {
	var expect = chai.expect;
	var Router = Ractive.Router;

	describe('Router', function () {
		describe('Router()', function () {
			it('should create new Router instance with the given options', function () {
				var router = new Router({ basePath: '/xxx', el: 'body', data: { a: 1 }, history: { b: 2 }, strictMode: true });

				expect(router.basePath).to.equal('/xxx');
				expect(router.el).to.equal('body');
				expect(router.data).to.deep.equal({ a: 1 });
				expect(router.history).to.deep.equal({ b: 2 });
				expect(router.strictMode).to.be.true;
			});
		});

		describe('addRoute()', function () {
			var Handler = Ractive.extend({
				data: { a: 1, b: 2, c: 3, x: 4 }
			});

			it('should add a new route', function () {
				var router = new Router({});

				expect(router.addRoute('', Handler).routes).to.have.length(1);
				expect(router.addRoute('', Handler).routes).to.have.length(2);
			});
		});

		describe('buildHash()', function () {
			var Handler = Ractive.extend({
				data: { a: 1, b: 2, c: 3, x: 4 }
			});

			it('should return correct hash', function () {
				var router = new Router({});
				router.route = new Router.Route('', Handler, { hash: [ 'a', 'b' ] }).init({ path: '', qs: '', hash: '' }, {});

				expect(router.buildHash()).to.equal('#!%7B%22a%22%3A1%2C%22b%22%3A2%7D');
			});

			it('should return correct hash', function () {
				var router = new Router({});
				router.route = new Router.Route('', Handler).init({ path: '', qs: '', hash: '' }, {});

				expect(router.buildHash('#x')).to.equal('#x');
			});
		});

		describe('buildQS()', function () {
			var Handler = Ractive.extend({
				data: { a: 1, b: 2, c: 3, x: 4 }
			});

			it('should return correct QS', function () {
				var router = new Router({});
				router.route = new Router.Route('', Handler, { qs: [ 'a', 'b' ] }).init({ path: '', qs: '', hash: '' }, {});

				expect(router.buildQS()).to.equal('?a=1&b=2');
			});

			it('should return correct QS', function () {
				var router = new Router({});
				router.route = new Router.Route('', Handler).init({ path: '', qs: '', hash: '' }, {});

				expect(router.buildQS([ { x: 5 } ])).to.equal('?x=5');
			});
		});

		describe('dispatch()', function () {
			var options = { history: { pushState: function() {} } };
			var Handler = Ractive.extend({
				data: { a: 1, b: 2, c: 3, x: 4 }
			});

			it('should call router.redirect() if the request doesn\'t match any route', function (done) {
				var router = new Router(options);
				router.redirect = function (request) {
					expect(request).to.equal('/xxx/yyy?aaa#bbb');
					done();
				};

				router.dispatch('/xxx/yyy?aaa#bbb');
			});

			it('should dispatch the request if path changed', function (done) {
				var router = new Router(options).addRoute('/:aa', Handler).dispatch('/xx');
				router.routes[0].Handler.prototype.init = function () {
					done();
				};

				router.dispatch('/yy');
			});

			it('should dispatch the request if QS changed', function (done) {
				var router = new Router(options).addRoute('/:aa', Handler).dispatch('/xx?x');
				router.routes[0].Handler.prototype.init = function () {
					done();
				};

				router.dispatch('/xx?y');
			});

			it('should dispatch the request if observed hash changed', function (done) {
				var router = new Router(options).addRoute('/:aa', Handler, { hash: [ 'x' ] }).dispatch('/xx#x');
				router.routes[0].Handler.prototype.init = function () {
					done();
				};

				router.dispatch('/xx#y');
			});

			it('shouldn\'t dispatch the request if path didn\'t change', function (done) {
				var router = new Router(options).addRoute('/:aa', Handler).dispatch('/xx');
				router.update = function () {
					done();
				};
				router.routes[0].Handler.prototype.init = function () {
					done(new Error('Request dispatched.'));
				};

				router.dispatch('/xx');
			});

			it('shouldn\'t dispatch the request if QS didn\'t change', function (done) {
				var router = new Router(options).addRoute('/:aa', Handler).dispatch('/xx?x=5');
				router.update = function () {
					done();
				};
				router.routes[0].Handler.prototype.init = function () {
					done(new Error('Request dispatched.'));
				};

				router.dispatch('/xx?x=5');
			});

			it('shouldn\'t dispatch the request if observed hash didn\'t change', function (done) {
				var router = new Router(options).addRoute('/:aa', Handler, { hash: [ 'x' ] }).dispatch('/xx#!{"x":5}');
				router.update = function () {
					done();
				};
				router.routes[0].Handler.prototype.init = function () {
					done(new Error('Request dispatched.'));
				};

				router.dispatch('/xx#!{"x":5}');
			});

			it('shouldn\'t dispatch the request if hash changed but it\'s not being observed', function (done) {
				var router = new Router(options).addRoute('/:aa', Handler).dispatch('/xx#x');
				router.update = function () {
					done();
				};
				router.routes[0].Handler.prototype.init = function () {
					done(new Error('Request dispatched.'));
				};

				router.dispatch('/xx#y');
			});

			it('should dispatch the request if path didn\'t change but `reload`=true', function (done) {
				var router = new Router(options).addRoute('/:aa', Handler).dispatch('/xx');
				router.routes[0].Handler.prototype.init = function () {
					done();
				};

				router.dispatch('/xx', { reload: true });
			});

			it('should dispatch the request if QS didn\'t change but `reload`=true', function (done) {
				var router = new Router(options).addRoute('/:aa', Handler).dispatch('/xx?x');
				router.routes[0].Handler.prototype.init = function () {
					done();
				};

				router.dispatch('/xx?x', { reload: true });
			});

			it('should dispatch the request if hash didn\'t change but `reload`=true', function (done) {
				var router = new Router(options).addRoute('/:aa', Handler, { hash: [ 'x' ] }).dispatch('/xx#x');
				router.routes[0].Handler.prototype.init = function () {
					done();
				};

				router.dispatch('/xx#x', { reload: true });
			});
		});

		describe('init()', function () {
			var Handler = Ractive.extend({
				data: { a: 1, b: 2, c: 3, x: 4 }
			});

			it('should dispatch the request', function (done) {
				var router = new Router({ history: { pushState: function() {}, replaceState: function () {} } }).addRoute('/:x(.*)', Handler);
				router.dispatch = function (request) {
					expect(request).to.equal(location.pathname.substr(this.basePath.length) + location.search + location.hash);
					done();
				};

				router.init();
			});
		});

		describe('match()', function () {
			var Handler = Ractive.extend({
				data: { a: 1, b: 2, c: 3, x: 4 }
			});

			it('should return first route matching the request', function () {
				var router = new Router({})
					.addRoute('/aa/:xx', Handler)
					.addRoute('/bb/:xx', Handler)
					.addRoute('/bb/:yy', Handler);

				expect(router.match('/bb/zz').pattern).to.equal('/bb/:xx');
			});
		});

		describe('update()', function () {
			var Handler = Ractive.extend({
				data: { a: 1, b: 2, c: 3, x: 4 }
			});

			it('should call history.pushState()', function (done) {
				var router = new Router({
					history: {
						pushState: function(state, title, uri) {
							expect(state).to.deep.equal({ x: 4 });
							expect(uri).to.equal('/xx/11?b=2#!%7B%22c%22%3A12%7D');
							done();
						}
					}
				}).addRoute('/xx/:a/', Handler, { qs: [ 'b' ], hash: [ 'c' ], state: [ 'x' ] });

				router.dispatch('/xx/11#!{"c":12}');
			});

			it('should call history.replaceState()', function (done) {
				var router = new Router({
					history: {
						pushState: function () {},
						replaceState: function(state, title, uri) {
							expect(state).to.deep.equal({ x: 4 });
							expect(uri).to.equal('/xx/11?b=2#!%7B%22c%22%3A12%7D');
							done();
						}
					}
				}).addRoute('/xx/:a/', Handler, { qs: [ 'b' ], hash: [ 'c' ], state: [ 'x' ] });

				router.dispatch('/xx/11#!{"c":12}', { noHistory: true });
			});
		});
	});
})();