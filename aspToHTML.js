const fs = require('fs').promises
const path = require('path')

layoutFilePath = path.join(__dirname, 'Pages/Shared/_Layout.cshtml');
indexFilePath = path.join(__dirname, 'Pages/Index.cshtml');

layoutFile = fs.readFile(layoutFilePath, {encoding: 'utf-8'});
indexFile = fs.readFile(indexFilePath, {encoding: 'utf-8'});

Promise.all([layoutFile, indexFile]).then(files => {
    // Remove first 5 lines of Index.cshtml.
    var lines = files[1].split('\n');
    lines.splice(0,5);
    files[1] = lines.join('\n');
    
    // Include body in layout.
    merge = files[0].replace('@RenderBody()', files[1])

    // ASP replacements.
    merge = merge.replace('@await RenderSectionAsync("Scripts", required: false)', '')
        // Replace comments.
        .replaceAll('@*', '<!--', 'g')
        .replaceAll('*@', '-->', 'g')
        
    // Replace assets links.
    merge = merge.replaceAll('~/', 'wwwroot/')
        .replaceAll('src="/js/', 'src="wwwroot/js/')
        .replaceAll('href="/css/', 'href="wwwroot/css/')

    fs.writeFile(
        'index.html', 
        merge, 
    ).then(result => {
        console.log('index.html was created.')
    }).catch(function(error) {
        console.log(error.message)
    });
})