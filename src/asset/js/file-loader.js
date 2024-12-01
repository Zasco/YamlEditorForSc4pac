/**
 * This class handles file loading operations.
 */
class FileLoader {
    /**
     * Loads a script file.
     * @param {string} scriptFilePath The path of the script file.
     * @returns {Promise.<HTMLScriptElement|error>} The load promise.
     */
    async loadScript(scriptFilePath) {
        console.log('FileLoader.loadScript('+ scriptFilePath +')')

        // TO-DO: Check if file exists...
        // If not, return rejected with error promise.
        /* async function isUrlFound(url) {
            try {
              const response = await fetch(url, {
                method: 'HEAD',
                cache: 'no-cache'
              });
          
              return response.status === 200;
          
            } catch(error) {
              // console.log(error);
              return false;
            }
        }
        if (!isUrlFound(scriptFilePath)) alert(scriptFilePath) */

        // Build script DOM element.
        // https://stackoverflow.com/questions/37876001/javascript-autoloader
        var scriptElement = document.createElement('script')
        scriptElement.type = 'text/javascript'
        scriptElement.async = false
        scriptElement.src = scriptFilePath

        var scriptLoadPromise = new Promise((scriptFileLoadSuccess, scriptFileLoadFail) => {
            // If load succeeded.
            scriptElement.addEventListener('load', function(e) {
                // Resolve with script DOM element.
                scriptFileLoadSuccess(scriptElement)
            })
            // Reject with an error.
            scriptElement.addEventListener('error', function(e){
                // https://javascript.info/promise-error-handling#implicit-try-catch
                scriptFileLoadFail(new Error('Script file "'+ scriptFilePath +'" could not be loaded.'))
                // Remove DOM element.
                document.head.removeChild(scriptElement)
            })
        })

        document.head.appendChild(scriptElement)
        return scriptLoadPromise
    }

    /**
     * Loads an array of script files.
     * @param {[string]} scripts The array of script file paths.
     * @returns {[Promise]} The array of script load promises.
     */
    async loadScripts(scripts, callback) {
        var scriptLoadPromises = []
        scripts.forEach(script => {
            var scriptLoadPromise = this.loadScript(script)
            scriptLoadPromises.push(scriptLoadPromise)
            callback(script, scriptLoadPromise)
        })
        return scriptLoadPromises
    }
}