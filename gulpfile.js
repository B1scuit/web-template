'use strict';
// Declaring constants for easy referencing
const gulp          = require('gulp');
const sass          = require('gulp-sass');
const cssmin        = require('gulp-cssmin');
const uglify        = require('gulp-uglify');
const imagemin      = require('gulp-imagemin');
const notify        = require('gulp-notify');
const svgSprite     = require('gulp-svg-sprite');
const filter        = require('gulp-filter');
const include       = require('gulp-include');
const svg2png       = require('gulp-svg2png');
const gulpSequence  = require('gulp-sequence');
const browsersync   = require('browser-sync').create();
const pump          = require('pump');
const manakin       = require('manakin').global;

const err = function(err){
    if(!err) {
        return;
    }

    if(err.messageFormatted) {
        console.error(err.messageFormatted);
    }

    if(err.cause) {
        console.error('Error Message')
        console.info('\t' + err.cause.message);

        console.error('In File')
        console.info('\t' + err.fileName);

        console.error('Line')
        console.info('\t' + err.cause.line);
    }
}

// Uglifies JS, puts in to web JS
gulp.task('js', function() {
    pump([
        gulp.src('./resources/js/*.js'),
        include(),
        uglify(),
        gulp.dest('./web/js'),
        notify("JS compilation complete: <%=file.relative%>")
    ], err)
});

// Compiles SaSS
gulp.task('sass', function(){
    pump([
        gulp.src('./resources/sass/*.sass'),
        sass(),
        cssmin(),
        gulp.dest('./web/css'),
        notify("SASS compilation complete: <%=file.relative%>")
    ], err)
});

// Minifies images
gulp.task('imgmin', function(){
    pump([
        gulp.src('./resources/img/**/*.*'),
        imagemin(),
        gulp.dest('./web/img'),
        notify("Image compression complete: <%=file.relative%>")
    ], err)
});

// Sprite sheet
gulp.task('sprite', function () {
    pump([
        gulp.src('./resources/svg/*.svg'),
        svgSprite({
            mode: {
                css: {
                    dimensions: true,
                    prefix : ".%s",
                    sprite: "img/sprite.svg",
                    bust: true,
                    render: {
                        sass: {
                            template: "./resources/sass/template/_sprite-template.scss",
                            dest: "./../../resources/sass/components/_sprite",
                        }
                    },
                    example: true
                },
            }
        }),
        gulp.dest('./web'),
        notify("Sprite compilation complete: <%=file.relative%>"),
        filter("./resources/svg/*.svg"),
        svg2png(),
        gulp.dest("./web/img"),
        notify("Sprite PNG fallback generated: <%=file.relative%>"),
    ], err)
});

// Browser sync
gulp.task('serve', function() {
    browsersync.init({ server: "./web" })
    gulp.watch("./resources/sass/**/*.sass", ['sass']).on('change', browsersync.reload)
    gulp.watch("./resources/js/*.js", ['js']).on('change', browsersync.reload)
    gulp.watch("./resources/img/**/*.*", ['imgmin']).on('create', browsersync.reload)
    gulp.watch("./resources/svg/*.svg", ['sprite'])
    gulp.watch("./web/*.html").on('change', browsersync.reload)
});

// Default Task
gulp.task('default', gulpSequence('js','sprite', 'sass', 'imgmin', 'serve'));
