/**
 * This class handles autoloading operations.
 */
class Autoloader {
    // This should be automated...
    scripts = [
        'legacy-booter.js',
    ]
    
    /**
     * @type {FileLoader}
     */
    fileLoader = null

    /**
     * Sets the file loader.
     * @param {FileLoader} fileLoader 
     */
    setFileLoader(fileLoader) {
        this.fileLoader = fileLoader
    }

    /**
     * Returns the set file loader.
     * @returns {FileLoader}
     */
    getFileLoader() {
        return this.fileLoader
    }

    /**
     * Loads all scripts required by the application.
     * @returns {Promise}
     */
    async loadAll(callback) {
        console.log('Autoloader.loadAll')
        
        var scriptLoadPromises = await this.loadScripts(this.scripts.map(script => app.getJsAssetsRootPath() + script))
        return Promise.all(scriptLoadPromises)
    }

    /**
     * Loads a script file if it's not already loaded.
     * @param {string} scriptFilePath The path of the script file.
     * @returns {false|Promise.<HTMLScriptElement|error>} The load promise.
     */
    loadScript(scriptFilePath) {
        if (app.scriptIsLoad(scriptFilePath)) {
            console.log('Script file "'+ scriptFilePath +'" already load.')
            return false
        }
        return this.getFileLoader().loadScript(scriptFilePath)
    }

    /**
     * Loads an array of script files if not already loaded.
     * @param {[string]} scriptFilePaths The array of script file paths.
     * @returns {[Promise.<HTMLScriptElement|error>]} The array of script load promises.
     */
    async loadScripts(scriptFilePaths) {
        var scriptLoadPromises = []
        scriptFilePaths.forEach(scriptFilePath => {
            var scriptLoadPromise = this.loadScript(scriptFilePath)
            if (scriptLoadPromise !== false) {
                scriptLoadPromises.push(scriptLoadPromise)
                app.addLoadingScript(scriptFilePath, scriptLoadPromise)
            }
        })
        return scriptLoadPromises
    }
}