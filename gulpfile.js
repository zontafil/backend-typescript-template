var gulp = require('gulp');  
var typescript = require('gulp-typescript');
var merge = require('merge2');  
var tslint = require("gulp-tslint");
var clean = require("gulp-clean");
var nodemon = require("gulp-nodemon");
var debug = require("gulp-debug");
var sourcemaps = require("gulp-sourcemaps");
var gulpCopy = require("gulp-copy");
var relativeSourcemapsSource = require('gulp-relative-sourcemaps-source');
var mocha = require("gulp-spawn-mocha");
var apidoc = require('gulp-apidoc');

var tsProject = typescript.createProject('tsconfig.json', {declaration: true});

gulp.task("watchApi", function(){
    nodemon({
        script: "release/js/bin/httpApi.js",
        watch: "release/js/bin/httpApi.js",
        ext: "js"
    })
})

// clean release/ folder before recompile
gulp.task("clean", function(){
    return merge([
        gulp.src('release/definitions/*', {read: false}).pipe(clean()),
        gulp.src('release/js/bin/*', {read: false}).pipe(clean()),
    ]);
})

// wipe release/ folder
gulp.task("cleanAll", function(){
    return gulp.src('release', {read: false}).pipe(clean());
})

// compile project
gulp.task('build', ["clean"], function() {  
    var tsResult = tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(tslint({configuration: "tslint.json"}))
        .pipe(tslint.report({emitError: false}))
        .pipe(tsProject());
        
    return merge([
        tsResult.js
            .pipe(relativeSourcemapsSource({dest: 'release/js'}))
            .pipe(sourcemaps.write('.', {
                includeContent: false,
            }))
            .pipe(gulp.dest('release/js')),
        tsResult.dts.pipe(gulp.dest('release/definitions')),
        gulp.src("src/**/*.js").pipe(gulpCopy("release/js/", {prefix: 1}))
    ])
});

gulp.task("test", function() {
    return gulp.src(["release/js/**/*.test.js"]).
        pipe(mocha({
            env: {
                'NODE_ENV': 'test'
            },
            timeout: 3000
        }));
})

gulp.task('apidoc', function(done){
    apidoc({
        src: "src/",
        dest: "docs/API/",
        config: "./"
    },done);
});

gulp.task('default', ['build']);  
