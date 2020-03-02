//npm i gulp gulp-uglify-es gulp-zip gulp-clean jsonfile gulp-eslint eslint-formatter-friendly
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
const appfolder = 'EMR/';
const WarFileName = 'OASYS_EMR';

gulp.task('eslint', function () {
    return gulp.src(['**/*.js', '!node_modules/**'])
        .pipe(eslint(lintrule))
        .pipe(eslint.format(friendlyFormatter))
        .pipe(eslint.failAfterError());
});


gulp.task('buildcopy', function () {
    return gulp.src(['**', '!node_modules/**'])
        .pipe(gulp.dest(releasefolder + releasetmpfolder + appfolder));
});

gulp.task('devbuildzip', () => {
    updateVersion(pkg.version, 1);
    return gulp.src([releasefolder + releasetmpfolder + '**'])
        .pipe(zip(WarFileName + '_dev_' + pkg.version + '.zip'))
        .pipe(gulp.dest(releasefolder));
});

gulp.task('qabuildzip', () => {
    updateVersion(pkg.qaversion, 2);
    return gulp.src([releasefolder + releasetmpfolder + '**'])
        .pipe(zip(WarFileName + '_qa_' + pkg.qaversion + '.zip'))
        .pipe(gulp.dest(releasefolder));
});

gulp.task('uatbuildzip', () => {
    updateVersion(pkg.uatversion, 3);
    return gulp.src([releasefolder + releasetmpfolder + '**'])
        .pipe(zip(WarFileName + '_uat_' + pkg.uatversion + '.zip'))
        .pipe(gulp.dest(releasefolder));
});

gulp.task('prodbuildzip', () => {
    updateVersion(pkg.prodversion, 4);
    return gulp.src([releasefolder + releasetmpfolder + '**'])
        .pipe(zip(WarFileName + '_prod_' + pkg.prodversion + '.zip'))
        .pipe(gulp.dest(releasefolder));
});


gulp.task('buildclean', function () {
    return gulp.src(releasefolder + releasetmpfolder)
        .pipe(clean({
            force: true
        }));
});

function updateVersion(version_, env) {
    var version = (version_).split('.');
    var build = Number.parseInt(version[version.length - 1]);
    version[version.length - 1] = (build + 1).toString();
    switch (env) {
        case 1:
            pkg.version = version.join('.');
            console.log('Updated DEV Package Version Number: ' + pkg.version);
            break;
        case 2:
            pkg.qaversion = version.join('.');
            console.log('Updated QA Package Version Number: ' + pkg.qaversion);
            break;
        case 3:
            pkg.uatversion = version.join('.');
            console.log('Updated UAT Package Version Number: ' + pkg.uatversion);
            break;
        case 4:
            pkg.prodversion = version.join('.');
            console.log('Updated PROD Package Version Number: ' + pkg.prodversion);
            break;
    }
    jsonfile.writeFileSync(pkgPath, pkg, {
        spaces: 2
    });
    return pkg.version;
}


gulp.task('devbuild',
    gulp.series('buildcopy', 'devbuildzip', 'buildclean')); // Combine

gulp.task('qabuild',
    gulp.series('buildcopy', 'qabuildzip', 'buildclean')); // Combine

gulp.task('uatbuild',
    gulp.series('buildcopy', 'uatbuildzip', 'buildclean')); // Combine

gulp.task('prodbuild',
    gulp.series('buildcopy', 'prodbuildzip', 'buildclean')); // Combine

