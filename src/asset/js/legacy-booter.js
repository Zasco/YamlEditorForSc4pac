/**
 * This script handles the (decoupled) loading and booting of the legacy helper.
 */
legacyHelperScriptFilePath = 'helper/legacy-helper.js'
legacyHelperScriptFileFullPath = app.getJsAssetsRootPath() + legacyHelperScriptFilePath

/**
 * Boots the legacy helper.
 */
function bootLegacyHelper() {
    var legacyHelper = new LegacyHelper()
    legacyHelper.loadAll()
}

// If legacy helper script file is not loaded.
if (!app.scriptIsLoad(legacyHelperScriptFileFullPath)) {
    // Load it.
    app.autoloader.loadScript(legacyHelperScriptFileFullPath).then(scriptElement => {
        // Then boot it.
        bootLegacyHelper()
    })
}
// Boot it.
else bootLegacyHelper()