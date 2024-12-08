/**
 * This class handles file loading operations.
 */
class FileLoader {
    /**
     * Loads a script file.
     * @param {string} scriptFilePath The path of the script file.
     */
    async loadScript(scriptFilePath) {
        console.info('FileLoader.loadScript('+ scriptFilePath +')')

        // The call to "fileExists()" duplicates the request for the file (at least the header). Improvement may be done here, like hydrating the script element with the fetched result?
        // See https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/304
        
        if (!await this.fileExists(scriptFilePath)) throw new Error('Script file "'+ scriptFilePath +'" does not exist.')

        var scriptElement = this.buildScriptElement(scriptFilePath)
        var scriptLoadPromise = this.getScriptLoadPromise(scriptElement)
        // Promise must be made before append to ensure event listeners are registered before their respective event happens.
        document.head.appendChild(scriptElement)

        return scriptLoadPromise
    }

    /**
     * Returns a new script DOM element.
     * @param {string} scriptFilePath The path of the script file.
     * @returns {HTMLScriptElement} The script DOM element.
     */
    buildScriptElement(scriptFilePath) {
        var scriptElement = document.createElement('script')
        scriptElement.type = 'text/javascript'
        scriptElement.async = false
        //scriptElement.src = scriptFilePath + 1 // Test load fail.
        scriptElement.src = scriptFilePath

        return scriptElement
    }

    /**
     * Returns the load promise of a provided script element.
     * @param {HTMLScriptElement} scriptElement The script element for which to make the promise.
     * @returns {Promise<HTMLScriptElement|Error>} A promise that resolves/rejects when the script loads/errors.
     */
    getScriptLoadPromise(scriptElement) {
        // Make a promise that resolves/rejects when the script DOM element loads/errors.
        return new Promise((scriptFileLoadSuccess, scriptFileLoadFail) => {
            scriptElement.addEventListener('load', function(e) {
                scriptFileLoadSuccess(scriptElement)
                console.info('Script file "'+ scriptElement.src +'" successfuly loaded.')
            })
            // Il load failed.
            scriptElement.addEventListener('error', function(e){
                document.head.removeChild(scriptElement)
                scriptFileLoadFail(new Error('Script file "'+ scriptElement.src +'" could not be loaded.'))
            })
        })
    }

    /**
     * Returns if a file exists.
     * @param {string} filePath The path of the file.
     * @returns {Promise<boolean>} If the file exists.
     */
    async fileExists(filePath) {
        console.info('FileLoader.fileExists('+ filePath +')')
        // https://stackoverflow.com/questions/3646914/how-do-i-check-if-file-exists-in-jquery-or-pure-javascript/42696480#42696480
        // https://stackoverflow.com/questions/43493323/cross-origin-request-for-local-file/65501561#65501561
        //// I had to toggle security.fileuri.strict_origin_policy to make it work on local file system. (about:config)
        try {
            var response = await fetch(filePath, {
                method: 'HEAD',
                cache: 'no-cache'
            })
            return response.status === 200
        }
        catch(e) {
            return false
        }
    }
}