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
     * The list of already loaded scripts.
     * @type {[?string]}
     */
    loadScripts = []
    

    /**
     * Boots the application.
     */
    boot() {
        console.log('App booting.')
        var _this = this

        /**
         * Logs and alerts about boot abort.
         * @param {string} message 
         * @param {string} log 
         */
        function abortBoot(message, log) {
            console.log(log)
            console.log(message +' Aborting app boot. See log for details.')
        }

        // When page is loaded.
        window.addEventListener('load', async function(e) {
            console.log('Loading essential assets.')
            // Load essential components.
            // Load the file loader.
            try {
                /** @type {FileLoader} */
                var fileLoader = await _this.loadFileLoader()
                _this.fileLoader = fileLoader
            }
            catch(e) {
                return abortBoot('File loader could not be loaded.', e)
            }
            
            // Load the autoloader.
            try {
                var autoloaderFilePath = _this.getAutoloaderFilePath()
                var autoloaderLoadPromise = fileLoader.loadScript(autoloaderFilePath)
                _this.addLoadingScript(autoloaderFilePath, autoloaderLoadPromise)
                // Wait for the autoloader script file to be loaded.
                await autoloaderLoadPromise

                // Then instantiate it.
                var autoloader = new Autoloader
                _this.autoloader = autoloader
                autoloader.setFileLoader(fileLoader)

                console.log('Autoloader loaded.')
            }
            catch(e) {
                return abortBoot('Autoloader could not be loaded.', e)
            }

            // Load all other scripts.
            try {
                /* var t = await autoloader.loadAll()
                console.log(t)
                var loadAllSuccess = (t).every(Boolean) */
                //alert('>'+ [true, true, [true, true, false,],].flat(Infinity).every(Boolean))

                var scriptElements = await autoloader.loadAll()
            }
            catch(e) {
                return abortBoot('Not all scripts could be loaded.', e)
            }

            // Load all legacy scripts.


            
            // If this code is reached, it's because "load all" was resolved.
            console.log(scriptElements)
            console.log('App fully booted.')
        })
    }

    /**
     * Loads the file loader.
     * @returns {Promise.<FileLoader|Error>|Error} The file loader if it was successfuly loaded.
     */
    async loadFileLoader() {
        var fileLoaderFilePath = this.getFileLoaderFilePath()
        var fileLoaderScriptElement = document.createElement('script')
        
        // https://stackoverflow.com/questions/67016273/multiple-onload-events-with-javascript-promise
        var fileLoaderLoadPromise = new Promise((fileLoaderLoadSuccess, fileLoaderLoadFail) => {
            // If load succeeded.
            fileLoaderScriptElement.addEventListener('load', function(e) {
                // Instantiate and resolve with the file loader.
                fileLoaderLoadSuccess(new FileLoader)
            })
            // If load failed, reject with an error.
            fileLoaderScriptElement.addEventListener('error', function(e){
                // https://javascript.info/promise-error-handling#implicit-try-catch
                fileLoaderLoadFail(new Error('File loader script file could not be loaded.'))
                document.head.removeChild(fileLoaderScriptElement)
            })
        })
        this.addLoadingScript(fileLoaderFilePath, fileLoaderLoadPromise)
        
        fileLoaderScriptElement.type = 'text/javascript'
        fileLoaderScriptElement.async = false
        fileLoaderScriptElement.src = fileLoaderFilePath
        document.head.appendChild(fileLoaderScriptElement)
        
        return fileLoaderLoadPromise
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
     * @param {Promise} loadPromise The load script promise.
     */
    addLoadingScript(scriptFilePath, loadPromise) {
        console.log('App.addLoadingScript('+ scriptFilePath +')')
        this.loadScripts.push(this.getPrefixedFilePath(scriptFilePath))
        // When successfuly loaded.
        loadPromise.then(scriptElement => {
            // Add to loaded script.
            this.addLoadedScript(scriptFilePath)
        })
    }

    /**
     * Removes a loading script.
     * @param {string} scriptFilePath 
     */
    removeLoadingScript(scriptFilePath) {
        console.log('App.removeLoadingScript('+ scriptFilePath +')')
        const index = this.loadScripts.indexOf('~'+ scriptFilePath);
        if (index > -1) this.loadScripts.splice(index, 1)
    }

    /**
     * Adds a loaded script.
     * @param {string} scriptFilePath 
     */
    addLoadedScript(scriptFilePath) {
        console.log('App.addLoadedScript('+ scriptFilePath +')')
        this.removeLoadingScript(scriptFilePath)
        this.loadScripts.push(scriptFilePath)
    }

    /**
     * Return an array of loading and loaded scripts.
     * @returns {[string]} The array of loading and loaded scripts.
     */
    getLoadScripts() {
        return this.loadScripts
    }

    /**
     * Returns an array of loading scripts.
     * @returns {[string]} The array of loading scripts.
     */
    getLoadingScripts() {
        return this.getLoadScripts().filter(script => {
            return script.startsWith(this.getLoadingPrefix())
        })
    }
    
    /**
     * Returns an array of loaded scripts.
     * @returns {[string]} The array of loaded scripts.
     */
    getLoadedScripts() {
        return this.getLoadScripts().filter(script => {
            return !script.startsWith(this.getLoadingPrefix())
        })
    }

    /**
     * Returns if the specified script is load***.
     * @param {string} scriptFilePath The script file path.
     * @returns {boolean} If the file is already load***.
     */
    scriptIsLoad(scriptFilePath) {
        return this.getLoadScripts().includes(this.getPrefixedFilePath(scriptFilePath))
    }

    /**
     * Returns if the specified script is loading.
     * @param {string} scriptFilePath The script file path.
     * @returns {boolean} If the file is already loading.
     */
    scriptIsLoading(scriptFilePath) {
        return this.getLoadingScripts().includes(this.getPrefixedFilePath(scriptFilePath))
    }

    /**
     * Returns if the specified script is loaded.
     * @param {string} scriptFilePath The script file path.
     * @returns {boolean} If the file is already loaded.
     */
    scriptIsLoaded(scriptFilePath) {
        return this.getLoadedScripts().includes(scriptFilePath)
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