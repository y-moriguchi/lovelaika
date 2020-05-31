var Pic = require("./pic.js");
var fs = require("fs");

function readfile(infile) {
    try {
        return fs.readFileSync(infile, "utf8");
    } catch(e) {
        console.log("Cannot read file " + infile);
        process.exit(2);
    }
}

function writefile(outfile, data) {
    try {
        fs.writeFileSync(outfile, data);
    } catch(e) {
        console.log("Cannot write file " + outfile);
        process.exit(2);
    }
}

function createPic(infile, outfile) {
    var text = readfile(infile),
        svg = Pic(text)();

    writefile(outfile, svg);
}

function main() {
    if(process.argv.length < 4) {
        console.log("usage: pic <infilename> <outfilename>");
        process.exit(1);
    }
    createPic(process.argv[2], process.argv[3]);
}

main();
