/**
 *  Gulp uses BrowserSync server for HTML files
 *  Watches & minify css/html/javascript/images
 *
 * More details: http://www.browsersync.io/docs/gulp/
 */

const gulp = require("gulp");
const browserSync = require("browser-sync").create();
const reload = browserSync.reload;
const compress = require("compression");

// Minify HTML files
// More details: https://www.npmjs.com/package/gulp-htmlmin
const htmlmin = require("gulp-htmlmin");

// Minify CSS fiels
// More details: https://www.npmjs.com/package/gulp-cssmin
const cssmin = require("gulp-cssmin");

// Minify javascript scripts
// More details: https://www.npmjs.com/package/gulp-jsmin
const jsmin = require("gulp-jsmin");

// Rename files
// More details: https://www.npmjs.com/package/gulp-rename
const rename = require("gulp-rename");

// Compress images CSS
// More details: https://www.npmjs.com/package/gulp-imagemin
const imagemin = require("gulp-imagemin");

// Create favicon.ico from icon.png
// https://www.npmjs.com/package/gulp-to-ico
const ico = require("gulp-to-ico");

// Add source maps for minified files
// More details: https://www.npmjs.com/package/gulp-sourcemaps
const sourcemaps = require("gulp-sourcemaps");

// Resize and rename images
// More details: https://www.npmjs.com/package/gulp-responsive-images
const responsiveImages = require("gulp-responsive-images");

// configure based directory between source and distribution paths
const bases = {
  src: "src/",
  dist: "dist/"
};

// configure file specific directory paths
const paths = {
  html: "**/*.html",
  css: "css/**/*.css",
  js: "js/**/*.js",
  img: "img/**/*.{png,jpg,jpeg,gif}",
  icon: "icon.png",
  manifest: "manifest.json",
  sw: "sw.js"
};

// html task, will run when any html files change & BrowserSync
// will auto-update browsers
gulp.task("html", () => {
  gulp
    .src(paths.html, { cwd: bases.src })
    .pipe(htmlmin({ collapseWhitespace: false }))
    .pipe(gulp.dest(bases.dist))
    .pipe(reload({ stream: true }));
});

// CSS task, will run when any CSS files change & BrowserSync
// will auto-update browsers
gulp.task("css", () => {
  gulp
    .src(paths.css, { cwd: bases.src })
    // Uncomment the following line to enable source maps
    // .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(cssmin())
    .pipe(rename({ suffix: ".min" }))
    // Comment the following line to disable source maps
    // .pipe(sourcemaps.write())
    .pipe(gulp.dest(bases.dist + "css/"))
    .pipe(reload({ stream: true }));
});

// Javscript task, will run when any javascript files change & BrowserSync
// will auto-update browsers
gulp.task("js", () => {
  gulp
    .src(paths.js, { cwd: bases.src })
    // Uncomment the following line to enable source maps
    // .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(jsmin())
    .pipe(rename({ suffix: ".min" }))
    // Uncomment the following line to enable source maps
    // .pipe(sourcemaps.write())
    .pipe(gulp.dest(bases.dist + "js/"))
    .pipe(reload({ stream: true }));

  gulp
    .src(paths.sw, { cwd: bases.src })
    // Uncomment the following line to enable source maps
    // .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(jsmin())
    .pipe(rename({ suffix: ".min" }))
    // Uncomment the following line to enable source maps
    // .pipe(sourcemaps.write())
    .pipe(gulp.dest(bases.dist))
    .pipe(reload({ stream: true }));
});

// Image task, will run when any image files change
gulp.task("img", () => {
  gulp
    .src(paths.img, { cwd: bases.src })
    .pipe(
      imagemin({
        progressive: true
      })
    )
    .pipe(
      responsiveImages({
        "*.*": [
          {
            width: 270,
            suffix: "-thumb",
            upscale: false
          },
          {
            width: "100%"
          }
        ]
      })
    )
    .pipe(gulp.dest(bases.dist + "img/"));
});

// Image icon task, will run when any icon image files change
gulp.task("icon", () => {
  const widths = [48, 72, 96, 144, 168, 192, 512];
  widthsArray = widths.map(w => ({ width: w, suffix: `${w}` }));

  gulp
    .src(paths.icon, { cwd: bases.src })
    .pipe(responsiveImages({ "icon.png": widthsArray }))
    .pipe(gulp.dest(bases.dist + "icon/"));

  gulp
    .src(paths.icon, { cwd: bases.src })
    .pipe(ico("favicon.ico", { resize: true, sizes: [64] }))
    .pipe(gulp.dest(bases.dist));
});

// copy web app mainfest.json to distrobution directory
gulp.task("manifest", () => {
  gulp.src(paths.manifest, { cwd: bases.src }).pipe(gulp.dest(bases.dist));
});

// serve web app locally on port 5000
gulp.task("serve", () => {
  browserSync.init({
    notify: false,
    server: {
      baseDir: bases.dist,
      middleware: [compress()]
    },
    ui: {
      port: 5000
    },
    port: 5000
  });
  gulp.watch(paths.html, { cwd: bases.src }, ["html"]);
  gulp.watch(paths.js, { cwd: bases.src }, ["js"]);
  gulp.watch(paths.sw, { cwd: bases.src }, ["js"]);
  gulp.watch(paths.css, { cwd: bases.src }, ["css"]);
});

gulp.task("default", ["html", "css", "js", "manifest", "img", "icon"]);
