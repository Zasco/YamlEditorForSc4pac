/**
 * This class handles legacy operations.
 */
class LegacyHelper {
    /**
     * @type {string} The assets root path.
     */
    assetsPath = 'wwwroot/'
    /**
     * @type {string} The JS assets root path.
     */
    jsAssetsPath = 'js/'
    /**
     * @type {[string]} The legacy scripts.
     */
    scripts = [
        'site-util.js', // Must be loaded first.
        'site-interactivity.js',
        'site.js', // Must be loaded last.
    ]

    /**
     * Return the javascript assets directory path.
     * @returns {string}
     */
    getJsAssetsRootPath() {
        return this.assetsPath + this.jsAssetsPath
    }

    /**
     * Loads all legacy scripts.
     */
    loadAll() {
        console.log('LegacyHelper.loadAll')
        var _this = this
        app.autoloader.loadScripts(this.scripts.map(script => {
            return _this.getJsAssetsRootPath() + script
        }))
    }
}