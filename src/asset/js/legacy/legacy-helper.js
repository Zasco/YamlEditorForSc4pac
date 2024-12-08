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
     * @returns {string} The javascript assets directory path.
     */
    getJsAssetsRootPath() {
        return this.assetsPath + this.jsAssetsPath
    }

    /**
     * Loads all legacy scripts.
     */
    async loadAll() {
        console.info('LegacyHelper.loadAll')
        this.scripts.forEach(async script => {
            try {
                await app.autoloader.loadScript(this.getJsAssetsRootPath() + script)
            }
            catch (e) {
                console.group('Legacy helper error.')
                console.error('Not all legacy scripts could be loaded. Error details below:')
                console.error(e)
                console.groupEnd()
            }
        })
    }
}