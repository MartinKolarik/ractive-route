require.config({
	paths: {
		'amd-loader': 'vendor/amd-loader',
		rvc: 'vendor/rvc',
		ractive: 'vendor/ractive'
	}
});

require([ 'app' ]);