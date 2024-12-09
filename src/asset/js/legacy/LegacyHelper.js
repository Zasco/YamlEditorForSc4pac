/**
 * This class handles legacy operations.
 */
class LegacyHelper {
    /**
     * @type {string} The assets root path.
     */
    static assetsPath = 'wwwroot/'
    /**
     * @type {string} The JS assets root path.
     */
    static jsAssetsSubPath = 'js/'
    /**
     * @type {[string]} The legacy scripts.
     */
    static scripts = [
        'site-util.js', // Must be loaded first.
        'site-interactivity.js',
        'site.js', // Must be loaded last.
    ]

    /**
     * Return the javascript assets directory path.
     * @returns {string} The javascript assets directory path.
     */
    static getJsAssetsRootPath() {
        return this.assetsPath + this.jsAssetsSubPath
    }

    /**
     * Loads all legacy scripts.
     */
    async loadAll() {
        console.info('LegacyHelper.loadAll')
        LegacyHelper.scripts.forEach(async script => {
            try {
                await app.autoloader.loadScript(LegacyHelper.getJsAssetsRootPath() + script)
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