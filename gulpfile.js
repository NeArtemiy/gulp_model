//* Подключение библиотек
let gulp = require('gulp'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    sourcemaps = require('gulp-sourcemaps'),
    browserSync = require('browser-sync').create(),
    include = require('gulp-file-include'),
    del = require('del'),
    clean__css = require('gulp-clean-css'),
    css__media = require('gulp-group-css-media-queries'),
    webp = require('gulp-webp'),
    webphtml = require('gulp-webp-in-html'),
    webpcss = require('gulp-webp-css'),
    svg_sprite = require('gulp-svg-sprite'),
    ttfwoff = require('gulp-ttf2woff'),
    ttfwoff2 = require("gulp-ttf2woff2"),
    imagemin = require('gulp-imagemin');
    
const {
    src,
    dest
} = require('gulp');
let fs = require('fs');


//* scss
function scss_style(done) {
    gulp.src(['./$src/scss/**.scss', './$src/scss/**.sass'])
        .pipe(sourcemaps.init())
        .pipe(include())
        .pipe(sass({
            outputStyle: 'expanded'
        }).on('error', sass.logError))
        .pipe(css__media())
        .on('error', console.error.bind(console))
        .pipe(autoprefixer({
            overrideBrowserslist: [
                "last 5 versions",
                ">= 1%",
                "Chrome >= 45",
                "Firefox >= 38",
                "Edge >= 12",
                "Explorer >= 10",
                "iOS >= 9",
                "Safari >= 9",
                "Android >= 4.3",
                "Opera >= 30"
            ],
            cascade: false
        }))
        .pipe(webpcss())
        .pipe(clean__css({
            level: {
                2: {
                    mergeAdjacentRules: true,
                    mergeIntoShorthands: true,
                    mergeMedia: true,
                    mergeNonAdjacentRules: true,
                    mergeSemantically: false,
                    overrideProperties: true,
                    removeEmpty: true,
                    reduceNonAdjacentRules: true,
                    removeDuplicateFontRules: true,
                    removeDuplicateMediaBlocks: true,
                    removeDuplicateRules: true,
                    removeUnusedAtRules: false,
                    restructureRules: false,
                }
            }
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist/css/'))
        .pipe(browserSync.stream());
    done();
}

//* CSS 
function css_style(done) {
    gulp.src('./$src/css/**/*.css')
        .pipe(sourcemaps.init())
        .pipe(include())
        .pipe(css__media())
        .on('error', console.error.bind(console))
        .pipe(autoprefixer({
            overrideBrowserslist: [
                "last 5 versions"
            ],
            cascade: false
        }))
        .pipe(clean__css({
            level: {
                2: {
                    mergeAdjacentRules: true,
                    mergeIntoShorthands: true,
                    mergeMedia: true,
                    mergeNonAdjacentRules: true,
                    mergeSemantically: false,
                    overrideProperties: true,
                    removeEmpty: true,
                    reduceNonAdjacentRules: true,
                    removeDuplicateFontRules: true,
                    removeDuplicateMediaBlocks: true,
                    removeDuplicateRules: true,
                    removeUnusedAtRules: false,
                    restructureRules: false,
                }
            }
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist/css/'))
        .pipe(browserSync.stream());
    done();
}

//* Создание локально сервера
function sync(done) {
    browserSync.init({
        server: "./dist/",
        port: 3000
    });
    done();
}

//* Функция для обновления браузера
function browserReload(done) {
    browserSync.reload();
    done();
}

//* парсинг Html
function html(done) {
    gulp.src(["./$src/*.html", "!./$src/_*.html"])
        .pipe(include())
        .pipe(webphtml())
        .pipe(gulp.dest('./dist/'))
        .pipe(browserSync.stream());
    done();
}

//* парсинг Html элементов
function htmlInclude(done) {
    gulp.src(["./$src/_*.html"])
        .pipe(include())
        .pipe(webphtml())
        .pipe(gulp.dest('./dist/link'))
        .pipe(browserSync.stream());
    done();
}

//* обработка JS
function js(done){
    gulp.src(["./$src/script/*.js", "./$src/script/*.min.js"])
        .pipe(include())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./dist/script/'))
        .pipe(src("./$src/script/*.min.js"))
        .pipe(include())
        .pipe(gulp.dest('./dist/script/'))
        .pipe(browserSync.stream());
    done();
}

//* Обработка изображений
function images(done) {
    gulp.src("./$src/images/**")
        .pipe(webp({
            quality: 70,
        }))
        .pipe(gulp.dest('./dist/images'))
        .pipe(gulp.src("./$src/images/**"))
        .pipe(imagemin({
            progressive: true,
            interlaced: true,
            optimizationLevel: 3,
        }))
        .pipe(gulp.dest('./dist/images'))
        .pipe(browserSync.stream());
    done();
}

//* Конвертация шрифтов из ttf в woff и woff2
function fonts(done) {
    gulp.src("./$src/fonts/*.ttf")
        .pipe(ttfwoff2())
        .pipe(gulp.dest("./dist/fonts"))
        .pipe(gulp.src("./$src/fonts/*.ttf"))
        .pipe(ttfwoff())
        .pipe(gulp.dest("./dist/fonts"))
        .pipe(gulp.src(["./$src/fonts/*.woff", "./$src/fonts/*.woff2"]))
        .pipe(gulp.dest("./dist/fonts"))
    done()
}

//* Добавление woff и woff2 в _fonts.scss
function fontsAdd(done) {
    let file_content = fs.readFileSync('./$src/scss/_fonts.scss');
    if (file_content) {
        return fs.readdir("./dist/fonts", function (err, items) {
            if (items) {
                let c_fontname;
                for (var i = 0; i < items.length; i++) {
                    let fontname = items[i].split('.');
                    fontname = fontname[0];
                    if (c_fontname != fontname) {
                        fs.appendFile('./$src/scss/_fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
                    }
                    c_fontname = fontname;
                }
            }
        })
    }
    done()
}
function cb() {}

//* Sprite
gulp.task('svg_sprite', function () {
    return gulp.src(['./$src/iconsprite/*.svg'])
        .pipe(svg_sprite({
            mode: {
                stack: {
                    sprite: '../icons/icons.svg',
                    example: true,
                }
            }
        }))
        .pipe(dest('dist/images/'))
})

//* Удаление папки dist
function clean(done) {
    return del("./dist/")
    done()
}

//* Отслеживание изменений в файле 
function watchFiles() {
    gulp.watch(['./$src/scss/**.scss', './$src/scss/**.sass'], scss_style)
    gulp.watch("./$src/scss/**/*.css", css_style)
    gulp.watch("./$src/*.html", html)
    gulp.watch("./$src/_*.htmll", htmlInclude)
    gulp.watch("./$src/images/**", images)
    gulp.watch(["./$src/script/*.js", "./$src/script/*.min.js"], js)
    gulp.watch("./$src/fonts/**.ttf", fonts)
}

//* Запуск функций по отдельности
gulp.task(clean)
gulp.task(fontsAdd)
gulp.task(js)

//* Запуск паралельных функций 
gulp.task("default", gulp.parallel(
    fonts,
    sync,
    htmlInclude,
    css_style,
    scss_style,
    js,
    html,
    images,
    watchFiles,
));