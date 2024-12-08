/**
 * This class handles autoloading operations.
 */
class Autoloader {
    /**
     * The application scripts.
     * @type {[string]}
     */
    scripts = []
    
    /**
     * @type {FileLoader}
     */
    fileLoader = null

    /**
     * Returns the autoloaded scripts.
     * @returns {[string]} The autoloaded scripts.
     */
    getScripts() {
        // This should be automated by recursively reading the asset directory content...
        return this.scripts
    }
    
    /**
     * Returns the autoloaded scripts with full path.
     * @returns {[string]} The full path autoloaded scripts.
     */
    getFullPathScripts() {
        return this.getScripts().map(script => app.getJsAssetsRootPath() + script)
    }
    
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
     * @param {FileLoader} fileLoader The file loader.
     */
    constructor(fileLoader) {
        this.fileLoader = fileLoader
    }


    /**
     * Loads all scripts required by the application.
     * @returns {Promise<[HTMLScriptElement|Error]>}
     */
    async loadAll() {
        console.info('Autoloader.loadAll()')
        
        var scriptLoadPromises = await this.loadScripts(this.getFullPathScripts())
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

        var scriptLoadPromise = this.getFileLoader().loadScript(scriptFilePath)
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