module.exports = function(grunt) {
	grunt.registerMultiTask('concatAndWrap', function () {
		var files = [];
		var wrapper = grunt.file.read(this.data.wrapper);

		grunt.file.expand(this.data.src).forEach(function (file) {
			files.push(grunt.file.read(file));
		});

		grunt.file.write(this.data.dest, grunt.template.process(wrapper, {
			data: {
				pkg: grunt.file.readJSON('package.json'),
				src: files.join('\n\n').replace(/\n/g, '\n' + (this.data.indent || ''))
			}
		}));

		console.log('File %s created.', this.data.dest);
	});

	grunt.initConfig({
		concatAndWrap: {
			dist: {
				dest: 'ractive-route.js',
				indent: '\t',
				src: 'src/*',
				wrapper: '.wrapper'
			}
		},
		uglify: {
			bundle: {
				options: {
					preserveComments: 'some',
					sourceMap: true,
					sourceMapName: 'ractive-route.min.map'
				},
				files: {
					'ractive-route.min.js': 'ractive-route.js'
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask('build', [
		'concatAndWrap',
		'uglify'
	]);

	grunt.registerTask('default', 'build');
};