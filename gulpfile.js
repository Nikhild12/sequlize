const gulp = require('gulp');
const uglify = require('gulp-uglify-es').default;
const zip = require('gulp-zip');
const clean = require('gulp-clean');
const jsonfile = require('jsonfile');

const eslint = require('gulp-eslint');
const friendlyFormatter = require("eslint-formatter-friendly");

const pkgPath = './package.json';
const pkg = require(pkgPath);
const lintrule = './.eslintrc';

const releasefolder = '../release/';
const releasetmpfolder = 'tmp/';
const adminappfolder = 'LIS/';
const WarFileName = 'OASYS_EMR';

gulp.task('eslint', function () {
    return gulp.src(['**/*.js', '!node_modules/**'])
        .pipe(eslint(lintrule))
        .pipe(eslint.format(friendlyFormatter))
        .pipe(eslint.failAfterError());
});

gulp.task('buildmain', () => {
    return gulp.src(['index.js'])
        .pipe(uglify())
        .pipe(gulp.dest(releasefolder + releasetmpfolder + adminappfolder));
});

gulp.task('builddocker', () => {
    return gulp.src(['Dockerfile'])
        .pipe(gulp.dest(releasefolder + releasetmpfolder + adminappfolder));
});

gulp.task('buildpackagejson', () => {
    return gulp.src(['package.json'])
        .pipe(gulp.dest(releasefolder + releasetmpfolder + adminappfolder));
});

gulp.task('buildsrc', () => {
    return gulp.src(['src/**/*.js'])
        .pipe(uglify())
        .pipe(gulp.dest(releasefolder + releasetmpfolder + adminappfolder + 'src'));
});

gulp.task('buildjson', () => {
    return gulp.src(['src/**/*.json'])
        .pipe(gulp.dest(releasefolder + releasetmpfolder + adminappfolder + 'src'));
});

gulp.task('buildzip', () => {
    updateVersion();
    return gulp.src([releasefolder + releasetmpfolder + '**'])
        .pipe(zip(WarFileName + pkg.version + '.zip'))
        .pipe(gulp.dest(releasefolder));
});


gulp.task('buildclean', function () {
    return gulp.src(releasefolder + releasetmpfolder)
        .pipe(clean({
            force: true
        }));
});

function updateVersion() {
    var version = (pkg.version).split('.');
    var build = Number.parseInt(version[version.length - 1]);
    version[version.length - 1] = (build + 1).toString();
    pkg.version = version.join('.');
    console.log('Updated Package Version Number: ' + pkg.version);
    jsonfile.writeFileSync(pkgPath, pkg, {
        spaces: 2
    });
    return pkg.version;
}

gulp.task('prodbuild',
    gulp.series('buildmain', 'builddocker', 'buildpackagejson', 'buildsrc',
        'buildjson', 'buildzip', 'buildclean')); // Combine