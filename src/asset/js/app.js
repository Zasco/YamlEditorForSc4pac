/**
 * This class is the app kernel.
 */
class App {
    /**
     * The path of the assets directory.
     * @type {string}
     */
    assetsPath = 'src/asset/'
    /**
     * The path of the javascript assets directory.
     * @type {string}
     */
    jsAssetsPath = 'js/'
    /**
     * The file name of the file loader.
     * @type {string}
     */
    fileLoaderFileName = 'file-loader.js'
    /**
     * The file name of the autoloader.
     * @type {string}
     */
    autoloaderFileName = 'autoloader.js'
    /**
     * @type {?FileLoader}
     */
    fileLoader = null
    /**
     * @type {?Autoloader}
     */
    autoloader = null
    /**
     * The list of load*** scripts.
     * @type {Object<string, Promise<HTMLScriptElement>|HTMLScriptElement>}
     */
    loadScripts = {}
    /**
     * @type {boolean} If the application is booted.
     */
    booted = false

    /**
     * Boots the application.
     */
    boot() {
        console.info('App booting.')
        var _this = this

        /**
         * Logs about boot abort.
         * @param {string} message The log message.
         * @param {string} log The log content.
         */
        function abortBoot(message, log) {
            console.group('Aborting app boot.')
            console.error(message +' Error details below:')
            console.error(log)
            console.groupEnd()
        }

        // Once page is loaded.
        window.addEventListener('load', async e => {
            console.info('Loading assets/components.')
            
            // Load assets/components.
            //// Load the file loader.
            try {
                await _this.loadFileLoader()
                console.info('File loader loaded.')
            }
            catch(e) {return abortBoot('File loader could not be loaded.', e)}
            
            //// Load the autoloader.
            try {
                await _this.loadAutoloader()
                console.info('Autoloader loaded.')
            }
            catch(e) {return abortBoot('Autoloader could not be loaded.', e)}

            //// Load all other scripts.
            try {
                var scriptElements = await _this.autoloader.loadAll()
            }
            catch(e) {return abortBoot('Not all scripts could be loaded.', e)}


            this.booted = true
            var appBootedEvent = new CustomEvent('appBooted')
            window.dispatchEvent(appBootedEvent);
            console.info('App fully booted.')
        })
    }


    //// Load components ////

    /**
     * Loads the file loader.
     * @returns {Promise<boolean>} If the load was successful.
     */
    async loadFileLoader() {
        var fileLoaderFilePath = this.getFileLoaderFilePath()
        var fileLoaderScriptElement = document.createElement('script')
        
        // https://stackoverflow.com/questions/67016273/multiple-onload-events-with-javascript-promise
        /**
         * @type {Promise<HTMLScriptElement|Error>}
         */
        var fileLoaderLoadPromise = new Promise((fileLoaderLoadSuccess, fileLoaderLoadFail) => {
            fileLoaderScriptElement.addEventListener('load', function(e) {
                fileLoaderLoadSuccess(fileLoaderScriptElement)
                console.info('File loader script file successfuly loaded.')
            })

            fileLoaderScriptElement.addEventListener('error', function(e){
                document.head.removeChild(fileLoaderScriptElement)
                fileLoaderLoadFail(new Error('File loader script file could not be loaded.'))
                console.info('File loader script file could not be loaded.')
            })
        })
        this.addLoadingScript(fileLoaderFilePath, fileLoaderLoadPromise)
        
        fileLoaderScriptElement.type = 'text/javascript'
        fileLoaderScriptElement.async = false
        fileLoaderScriptElement.src = fileLoaderFilePath
        document.head.appendChild(fileLoaderScriptElement)
        
        await fileLoaderLoadPromise
        this.fileLoader = new FileLoader
        return true
    }

    /**
     * Loads the autoloader.
     * @returns {Promise<boolean>} If the load was successful.
     */
    async loadAutoloader() {
        var autoloaderFilePath = this.getAutoloaderFilePath()
        var autoloaderLoadPromise = this.fileLoader.loadScript(autoloaderFilePath)
        this.addLoadingScript(autoloaderFilePath, autoloaderLoadPromise)
        
        await autoloaderLoadPromise
        this.autoloader = new Autoloader(this.fileLoader)
        return true
    }


    //// Load scripts ////

    /**
     * Return the loading prefix.
     * @returns {string} The loading prefix.
     */
    getLoadingPrefix() {
        return '~'
    }

    /**
     * Returns the prefixed file path.
     * @param {string} filePath The file path to prefix.
     * @returns {string} The prefixed file path.
     */
    getPrefixedFilePath(filePath) {
        return this.getLoadingPrefix() + filePath
    }

    /**
     * Adds a loading script.
     * @param {string} scriptFilePath The script file path.
     * @param {Promise<HTMLScriptElement|Error>} loadPromise The script load promise.
     */
    async addLoadingScript(scriptFilePath, loadPromise) {
        console.info('App.addLoadingScript('+ scriptFilePath +')')
        this.loadScripts[this.getPrefixedFilePath(scriptFilePath)] = loadPromise
                
        try {
            // Register automatic transfer to loaded script when loaded.
            var scriptElement = await loadPromise
            this.addLoadedScript(scriptFilePath, scriptElement)
        }
        catch (e) {}
    }

    /**
     * Removes a loading script.
     * @param {string} scriptFilePath The script file path.
     */
    removeLoadingScript(scriptFilePath) {
        console.info('App.removeLoadingScript('+ scriptFilePath +')')
        delete this.loadScripts[this.getPrefixedFilePath(scriptFilePath)]
    }

    /**
     * Adds a loaded script.
     * @param {string} scriptFilePath The script file path.
     * @param {HTMLScriptElement} scriptElement The script DOM element.
     */
    addLoadedScript(scriptFilePath, scriptElement) {
        console.info('App.addLoadedScript('+ scriptFilePath +')')
        this.removeLoadingScript(scriptFilePath)
        this.loadScripts[scriptFilePath] = scriptElement
    }

    /**
     * Return an array of loading/loaded scripts.
     * @returns {Object<string, Promise<HTMLScriptElement>|HTMLScriptElement>} The array of loading/loaded scripts.
     */
    getLoadScripts() {
        return this.loadScripts
    }

    /**
     * Return the load*** script for the provided file path.
     * @param {string} scriptFilePath The path of the script file.
     * @throws {Error} If the script file is not load***.
     */
    getLoadScript(scriptFilePath) {
        if (!this.scriptIsLoad(scriptFilePath)) throw new Error('Script file "'+ scriptFilePath +'" is not load.')
        
        var loadingScript, loadedScript
        if (loadingScript = this.getLoadScripts()[app.getPrefixedFilePath(scriptFilePath)]) return loadingScript
        else if (loadedScript = this.getLoadScripts()[scriptFilePath]) return loadedScript
    }

    /**
     * Returns if the specified script is load***.
     * @param {string} scriptFilePath The script file path.
     * @returns {boolean} If the file is already load***.
     */
    scriptIsLoad(scriptFilePath) {
        return typeof this.getLoadScripts()[this.getPrefixedFilePath(scriptFilePath)] !== 'undefined'
    }


    //// Paths ////

    /**
     * Returns the assets directory path.
     * @returns {string}
     */
    getAssetsRootPath() {
        return this.assetsPath
    }

    /**
     * Returns the javascript assets directory path.
     * @returns {string}
     */
    getJsAssetsRootPath() {
        return this.getAssetsRootPath() + this.jsAssetsPath
    }

    /**
     * Returns the file loader file name.
     * @returns {string} The file loader file name.
     */
    getFileLoaderFileName() {
        return this.fileLoaderFileName
    }

    /**
     * Returns the file loader file path.
     * @returns {string} The file loader file path.
     */
    getFileLoaderFilePath() {
        return this.getJsAssetsRootPath() + this.getFileLoaderFileName()
    }

    /**
     * Returns the autoloader file name.
     * @returns {string} The autoloader file name.
     */
    getAutoloaderFileName() {
        return this.autoloaderFileName
    }

    /**
     * Returns the autoloader file path.
     * @returns {string} The autoloader file path.
     */
    getAutoloaderFilePath() {
        return this.getJsAssetsRootPath() + this.getAutoloaderFileName()
    }
}

var app = new App()
app.boot()