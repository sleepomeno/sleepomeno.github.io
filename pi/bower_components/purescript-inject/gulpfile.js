var gulp = require('gulp')
  , gutil = require('gulp-util')
  , plumber = require('gulp-plumber')
  , purescript = require('gulp-purescript')
  , sequence = require('run-sequence')
  , del = require('del')
  , config = {
      del: ['dist'],
      purescript: {
        src: [
          'bower_components/purescript-*/src/**/*.purs*',
          'src/**/*.purs'
        ],
        dest: 'dist',
        docs: 'MODULE.md'
      }
    }
;

function error(e) {
  gutil.log(gutil.colors.magenta('>>>> Error <<<<') + '\n' + e.toString().trim());
  this.emit('end');
}

gulp.task('del', function(cb){
  del(config.del, cb);
});

gulp.task('make', function(){
  return (
    gulp.src(config.purescript.src).
    pipe(plumber()).
    pipe(purescript.pscMake({output: config.purescript.dest})).
    on('error', error)
  );
});

gulp.task('psci', function(){
  return (
    gulp.src(config.purescript.src).
    pipe(plumber()).
    pipe(purescript.dotPsci()).
    on('error', error)
  );
});

gulp.task('docs', function(){
  return (
    gulp.src(config.purescript.src[1]).
    pipe(plumber()).
    pipe(purescript.pscDocs()).
    on('error', error).
    pipe(gulp.dest(config.purescript.docs))
  );
});

gulp.task('watch', function(cb){
  gulp.watch(config.purescript.src, ['make']);
});

gulp.task('default', function(){
  sequence('del', 'make', ['psci', 'docs']);
});
