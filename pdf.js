const https = require("https");
const fs = require("fs");

function downloadPDF(arxivURL, filename) {
    return new Promise((resolve, reject) => {
        // Change 'http' to 'https' in the URL.
        let secureURL = arxivURL.replace('http://', 'https://');

        // Change 'abs' to 'pdf' and remove the version number at the end.
        let pdfURL = secureURL.replace('/abs/', '/pdf/').replace(/v\d+$/, '');
        pdfURL += ".pdf";
        // Specify the folder name as part of the filename.
        let file = fs.createWriteStream(`./pdfs/${filename}`);

        // Add options for the request, including a User-Agent header.
        let options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537'
            }
        };

        https.get(pdfURL, options, function(response) {
            response.pipe(file);

            file.on('finish', function() {
                file.close(resolve);  // close() is async, call resolve after close completes.
            });

            file.on('error', function(err) { // Handle errors
                fs.unlink(`./pdfs/${filename}`); // Delete the file async. (But we don't check the result)
                reject(err);
            });
        });
    });
}

module.exports = {
  downloadPDF,
};
