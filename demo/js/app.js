define([
	'ractive',
	'../../ractive-route',
	'rvc!../components/search',
	'rvc!../components/credits'
], function (
	Ractive,
	Router,
	Search,
	Credits
) {
	var router = new Router({
		el: '#content',
		basePath: location.pathname.replace(/[^/]+$/, '')
	});

	// bind component `Search` to URI `/search` and sync value of `query` between Ractive and query string
	router.addRoute('/search', Search, { qs: [ 'query' ] });
	router.addRoute('/credits', Credits);

	// dispatch
	router
		.dispatch('/search', { noHistory: true })
		.watchLinks()
		.watchState();
});