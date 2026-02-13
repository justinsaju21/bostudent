const fs = require('fs');
const https = require('https');
const path = require('path');

const file = fs.createWriteStream("public/srm-logo.png");
const request = https.get("https://upload.wikimedia.org/wikipedia/en/f/fe/srm_seal.png", function (response) {
    response.pipe(file);
    file.on('finish', function () {
        file.close(() => {
            console.log("Download completed.");
        });
    });
}).on('error', function (err) {
    fs.unlink("public/srm-logo.png");
    console.error("Error downloading image:", err.message);
});
