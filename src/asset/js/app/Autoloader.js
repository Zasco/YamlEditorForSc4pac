/**
 * This class handles autoloading operations.
 */
class Autoloader {
    /** @type {[string]} The application scripts. */
    static scripts = []
    
    /** @type {FileHelper} The application kernel file helper. */
    fileHelper = null

    /**
     * Returns the autoloaded scripts.
     * @returns {[string]} The autoloaded scripts.
     */
    static getScripts() {
        // This should be automated by recursively reading the asset directory content...
        return this.scripts
    }
    
    /**
     * Returns the autoloaded scripts with full path.
     * @returns {[string]} The full path autoloaded scripts.
     */
    static getFullPathScripts() {
        return this.getScripts().map(script => AppKernel.getAppJsAssetsPath() + script)
    }

    /**
     * @param {FileHelper} fileHelper The file loader.
     */
    constructor(fileHelper) {
        this.fileHelper = fileHelper
    }


    /**
     * Loads all scripts required by the application.
     * @returns {Promise<[HTMLScriptElement|Error]>}
     */
    async loadAll() {
        console.info('Autoloader.loadAll()')
        
        var scriptLoadPromises = await this.loadScripts(Autoloader.getFullPathScripts())
        return Promise.all(scriptLoadPromises)
    }

    /**
     * Loads a script file (if it's not already).
     * @param {string} scriptFilePath The path of the script file.
     */
    async loadScript(scriptFilePath) {
        console.info('Autoloader.loadScript('+ scriptFilePath +')')
        
        if (app.scriptIsLoad(scriptFilePath)) {
            console.info('Script file "'+ scriptFilePath +'" already load.')
            return app.getLoadScript(scriptFilePath)
        }

        var scriptLoadPromise = this.fileHelper.loadScript(scriptFilePath)
        app.addLoadingScript(scriptFilePath, scriptLoadPromise)
        return scriptLoadPromise
    }

    /**
     * Loads an array of script files.
     * @param {[string]} scriptFilePaths The array of script file paths.
     * @returns {Promise<[Promise<HTMLScriptElement>]>} The array of script load promises.
     */
    async loadScripts(scriptFilePaths) {
        var scriptLoadPromises = []
        scriptFilePaths.forEach(scriptFilePath => {
            scriptLoadPromises.push(this.loadScript(scriptFilePath))
        })
        return scriptLoadPromises
    }
}