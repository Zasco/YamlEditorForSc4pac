/**
 * This class is the app kernel.
 */
class AppKernel {
    /** @type {string} The path of the assets directory. */
    static assetsPath = 'src/asset/'
    /** @type {string} The subpath of the javascript assets directory. */
    static jsAssetsSubPath = 'js/'
    /** @type {string} The subpath of the application assets directory. */
    static appAssetsSubPath = 'app/'
    /** @type {string} The file name of the file helper. */
    static fileLoaderFileName = 'FileHelper.js'
    /** @type {string} The file name of the autoloader. */
    static autoloaderFileName = 'Autoloader.js'
    /** @type {string} The name of the booted event. */
    static bootedEventName = 'appBooted'
    
    /** @type {?FileHelper} The file helper. */
    fileLoader = null
    /** @type {?Autoloader} The autoloader. */
    autoloader = null
    /** @type {Object<string, Promise<HTMLScriptElement>|HTMLScriptElement>} The list of load*** scripts. */
    loadScripts = {}
    /** @type {boolean} If the application is booted. */
    booted = false

    /**
     * Boots the application.
     * @returns {AppKernel} The application kernel.
     */
    static boot() {
        console.info('App booting.')
        var appKernel = new AppKernel

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

        window.addEventListener('load', async e => {
            console.info('Loading assets/components.')
            
            // Load assets/components //
            //// File loader ////
            try {
                await appKernel.loadFileLoader()
                console.info('File loader loaded.')
            }
            catch(e) {return abortBoot('File loader could not be loaded.', e)}
            
            //// Autoloader ////
            try {
                await appKernel.loadAutoloader()
                console.info('Autoloader loaded.')
            }
            catch(e) {return abortBoot('Autoloader could not be loaded.', e)}

            //// Other scripts ////
            try {
                var scriptElements = await appKernel.autoloader.loadAll()
            }
            catch(e) {return abortBoot('Not all scripts could be loaded.', e)}


            this.booted = true
            console.info('App fully booted.')
            window.dispatchEvent(new CustomEvent(AppKernel.bootedEventName))
        })

        return appKernel
    }

    /**
     * Returns if the application is booted.
     */
    isBooted() {
        return this.booted
    }


    //// Load components ////

    /**
     * Loads the file loader.
     * @returns {Promise<boolean>} If the load was successful.
     */
    async loadFileLoader() {
        var fileLoaderFilePath = AppKernel.getFileLoaderFilePath()
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
        this.fileLoader = new FileHelper
        return true
    }

    /**
     * Loads the autoloader.
     * @returns {Promise<boolean>} If the load was successful.
     */
    async loadAutoloader() {
        var autoloaderFilePath = AppKernel.getAutoloaderFilePath()
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

    ////// Assets //////

    /**
     * Returns the javascript assets directory path.
     * @returns {string}
     */
    static getJsAssetsPath() {
        return this.assetsPath + this.jsAssetsSubPath
    }

    /**
     * Returns the application javascript assets directory path.
     * @returns {string}
     */
    static getAppJsAssetsPath() {
        return this.getJsAssetsPath() + this.appAssetsSubPath
    }

    /**
     * Returns the file loader file path.
     * @returns {string} The file loader file path.
     */
    static getFileLoaderFilePath() {
        return this.getAppJsAssetsPath() + this.fileLoaderFileName
    }

    /**
     * Returns the autoloader file path.
     * @returns {string} The autoloader file path.
     */
    static getAutoloaderFilePath() {
        return this.getAppJsAssetsPath() + this.autoloaderFileName
    }
}