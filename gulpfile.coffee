"use strict"

args = require('yargs')
  .usage('Command line tool to build npm package. Usage: $0 <command>')
  .demand(1)
  .example('$0 compile','Compile all')
  .example('$0 watch', 'Watches and rebuilds')
  .argv

gulp     = require('gulp')
$        = require("gulp-load-plugins")(lazy: false)
$run     = require('run-sequence')
$logger  = $.util.log


gulp.task 'compile::sources', ->
  gulp.src(['src/chinchilla.coffee', 'src/chinchilla/*.coffee'])
  .pipe($.plumber(errorHandler: $.notify.onError("Error: <%= error.message %>")))
  .pipe($.coffee(bare: false, sourceMap: false).on('error', $logger))
  .pipe($.ngmin({dynamic: false}))
  .pipe($.concat('chinchilla.js'))
  .pipe(gulp.dest('./lib'))

gulp.task 'compile::tests', ->
  gulp.src(['test/test_helper.coffee', 'test/**/*.spec.coffee'])
  .pipe($.plumber(errorHandler: $.notify.onError("Error: <%= error.message %>")))
  .pipe($.coffee(bare: true, sourceMap: false).on('error', $logger))
  .pipe($.ngmin({dynamic: false}))
  .pipe($.concat('chinchilla.spec.js'))
  .pipe(gulp.dest('./lib'))

gulp.task 'compile::bower', ->
  $.bowerFiles(includeDev: true)
  .pipe($.filter(['**/*.js', '!**/*.min.js']))
  .pipe($.plumber(errorHandler: $.notify.onError("Error: <%= error.message %>")))
  .pipe($.concat('bower.js'))
  .pipe(gulp.dest('./lib'))

gulp.task 'compile::fixtures', ->
  gulp.src(['test/fixtures/loader.js', 'test/fixtures/*.fixture.js'])
  .pipe($.plumber(errorHandler: $.notify.onError("Error: <%= error.message %>")))
  .pipe($.concat('fixtures.js'))
  .pipe(gulp.dest('./lib'))

gulp.task "watch::watch", ->
  gulp.watch './src/**/*.coffee', ['compile::sources']
  gulp.watch './test/**/*.coffee', ['compile::tests']
  return

gulp.task "compile", (cb) ->
  $run(["compile::bower", "compile::fixtures", "compile::sources", "compile::tests"], cb)

gulp.task "watch", (cb) ->
  $run('compile', 'watch::watch', cb)


