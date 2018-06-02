const del     = require('del');
const gulp    = require('gulp');
const uglify  = require('gulp-uglify');
const rename  = require('gulp-rename');
const sass    = require('gulp-sass');
const cssnano = require('gulp-cssnano');
const babel   = require('gulp-babel');
const usemin  = require('gulp-usemin');
const ghPages = require('gulp-gh-pages');
const file    = require("gulp-file");

// Watch

gulp.task('dev-styles', function() {
    return gulp.src('src/assets/css/*.scss')
                .pipe(sass.sync().on('error', sass.logError))
                .pipe(gulp.dest(function(f) {
                    return f.base;
                }));
});

gulp.task('watch-styles', function() {
   return gulp.watch('src/assets/css/*.scss', gulp.parallel('dev-styles'));
});

gulp.task('watch', gulp.series('dev-styles', 'watch-styles' ));

// Build

gulp.task('static', function() {
    return gulp.src(['src/**/*', '!src/scripts/**/*', '!src/assets/css/**/*', '!src/index.html'])
               .pipe(gulp.dest('./build'));
});

gulp.task('styles', gulp.series('static', function() {
    return gulp.src('src/assets/css/*.scss')
                .pipe(sass().on('error', sass.logError))
                .pipe(cssnano())
                .pipe(gulp.dest('build/assets/css'));
}));

gulp.task('scripts', function() {
    return gulp.src('src/index.html')
                .pipe(usemin({
                    js: [
                        babel({ presets: ['es2015'] }),
                        uglify()
                    ],
                    jsconfig: [
                        babel({ presets: ['es2015'] }),
                        uglify()
                    ]
                }))
                .pipe(gulp.dest('./build'));
});

gulp.task("clean", function() {
   return del("build/*"); 
});

gulp.task('build',  gulp.series('clean', gulp.parallel('static', 'styles', 'scripts' )));

// Deploy

gulp.task('deploy', gulp.series('build', function() {
  return gulp.src([
      './build/**/*'
    ])
    .pipe(file('CNAME', "ui.dracoapi.ml"))
    .pipe(gulp.dest('./build'))
    .pipe(ghPages({remoteUrl: "https://github.com/dracoapi/dracoui.git"}));
}));

// Default

gulp.task('default', gulp.series('dev-styles', 'build' ));
