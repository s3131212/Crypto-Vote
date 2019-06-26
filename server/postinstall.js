var fs = require('fs');

console.log("This is the postinstall script for Crypto Vote.")
console.log("This script will now do some modifications to express-admin in order to create better UX.")

let replaceStringInFile = function(originalString, newString, file){
    fs.readFile(file, 'utf8', function (err,data) {
        if (err) {
            return console.log(err);
        }
        var result = data.replace(originalString, newString);
    
        fs.writeFile(file, result, 'utf8', function (err) {
            if (err) return console.log(err);
        });
    });
}

replaceStringInFile("Express Admin", "Crypto Vote", "./node_modules/express-admin/config/lang/en.json");
replaceStringInFile("default", "flatly", "./node_modules/express-admin/views/js/theme.html");
replaceStringInFile("</table>", "</table>\n        <a href='../' class='text-center'>Back to Homepage</a>", "./node_modules/express-admin/views/login.html");