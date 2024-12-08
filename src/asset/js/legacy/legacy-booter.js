/**
 * This script handles the (decoupled) loading and booting of the legacy helper.
 */
legacyHelperScriptFilePath = 'legacy/legacy-helper.js'

/**
 * Boots the legacy helper.
 */
async function bootLegacyHelper() {
    console.info('Legacy booter booting.')
    legacyHelperScriptFileFullPath = app.getJsAssetsRootPath() + legacyHelperScriptFilePath
    if (!app.scriptIsLoad(legacyHelperScriptFileFullPath)) {
        // Load it.
        try {
            await app.autoloader.loadScript(legacyHelperScriptFileFullPath)
        }
        catch (e) {
            console.group('Legacy booter error.')
            console.error('Legacy helper could not be booted.')
            console.error(e)
            console.groupEnd()
            return
        }
    }
    var legacyHelper = new LegacyHelper()
    legacyHelper.loadAll()
}

if (app !== 'undefined' && app.booted === true) bootLegacyHelper()
else {
    window.addEventListener('appBooted', e => {
        bootLegacyHelper()
    })
}