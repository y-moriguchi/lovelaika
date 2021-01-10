var widths = require("./net_width.js");

var defaultOption = {
    margin: 20,
    yGap: 22,
    fontFamily: "sans-serif",
    fontSize: 12,
    textMargin: 14,
    titleMargin: 30,
    stroke: "#000000",
    fill: "black",
    labelGap: 9,
    arrowSize: 4
};

function draw(parsed, drawer, option) {
    var opt = option ? option : defaultOption,
        leftX = [],
        rightX = [],
        lines = parsed.lines,
        title = parsed.title,
        canvas;

    function computeTextSize(text) {
        var result = 0,
            width,
            i;

        for(i = 0; i < text.length; i++) {
            width = widths[text.charCodeAt(i)];
            if(width) {
                result += opt.fontSize * width;
            } else {
                result += opt.fontSize;
            }
        }
        return result;
    }

    function computeMinimumMargin(index) {
        var result = 0, i;

        for(i = 0; i < lines.length; i++) {
            if(lines[i].startX === index || lines[i].endX === index) {
                result = Math.max(result, computeTextSize(lines[i].label));
            }
        }
        return result;
    }

    function drawTitle() {
        var i,
            gap = opt.margin;

        for(i = 0; i < title.length; i++) {
            if(i === 0) {
                drawer.addText(canvas, title[i].title, gap, opt.margin, opt);
                rightX[i] = gap;
                gap += computeMinimumMargin(i);
            } else if(i < title.length - 1) {
                drawer.addText(canvas, title[i].title, gap, opt.margin, opt);
                leftX[i] = gap;
                gap += computeTextSize(title[i].title);
                rightX[i] = gap;
                gap += computeMinimumMargin(i);
            } else {
                drawer.addText(canvas, title[i].title, gap, opt.margin, opt);
                leftX[i] = gap;
            }
        }
    }

    function drawArrow(x, xDist, y, yStart, dx) {
        var pathd = "",
            theta = Math.atan2(y - yStart, xDist);

        function rotateX(x, y, theta) {
            return Math.floor(x * Math.cos(theta) - y * Math.sin(theta));
        }

        function rotateY(x, y, theta) {
            return Math.floor(x * Math.sin(theta) + y * Math.cos(theta));
        }

        theta = dx > 0 ? -theta : theta;
        pathd += "M" + x + " " + y + " ";
        pathd += "L" + (x + rotateX(dx, -opt.arrowSize, theta)) + " ";
        pathd += (y + rotateY(dx, -opt.arrowSize, theta)) + " ";
        pathd += "L" + (x + rotateX(dx, opt.arrowSize, theta)) + " ";
        pathd += (y + rotateY(dx, opt.arrowSize, theta));
        pathd += " Z";
        drawer.addPath(canvas, pathd, opt.fill, opt.stroke);
    }

    function drawLine() {
        var i,
            gap = opt.margin,
            yGapTitle = opt.margin + opt.titleMargin,
            defs = drawer.addDefs(canvas);

        for(i = 0; i < lines.length; i++) {
            if(lines[i].startX < lines[i].endX) {
                drawer.addLineByPath(defs,
                        rightX[lines[i].startX],
                        yGapTitle + opt.yGap * lines[i].startY - opt.labelGap,
                        leftX[lines[i].endX],
                        yGapTitle + opt.yGap * lines[i].endY - opt.labelGap,
                        "id" + i,
                        opt.stroke);
                drawer.addLine(canvas,
                        rightX[lines[i].startX],
                        yGapTitle + opt.yGap * lines[i].startY,
                        leftX[lines[i].endX],
                        yGapTitle + opt.yGap * lines[i].endY,
                        opt.stroke);
                drawArrow(leftX[lines[i].endX],
                        leftX[lines[i].endX] - rightX[lines[i].startX],
                        yGapTitle + opt.yGap * lines[i].endY,
                        yGapTitle + opt.yGap * lines[i].startY,
                        -opt.arrowSize);
            } else {
                drawer.addLineByPath(defs,
                        rightX[lines[i].endX],
                        yGapTitle + opt.yGap * lines[i].endY - opt.labelGap,
                        leftX[lines[i].startX],
                        yGapTitle + opt.yGap * lines[i].startY - opt.labelGap,
                        "id" + i,
                        opt.stroke);
                drawer.addLine(canvas,
                        rightX[lines[i].endX],
                        yGapTitle + opt.yGap * lines[i].endY,
                        leftX[lines[i].startX],
                        yGapTitle + opt.yGap * lines[i].startY,
                        opt.stroke);
                drawArrow(rightX[lines[i].endX],
                        leftX[lines[i].startX] - rightX[lines[i].endX],
                        yGapTitle + opt.yGap * lines[i].endY,
                        yGapTitle + opt.yGap * lines[i].startY,
                        opt.arrowSize);
            }
            drawer.addTextWithPath(canvas, "  " + lines[i].label + "  ", "id" + i, opt);
        }
    }

    canvas = drawer.createCanvas(500, 500);
    drawTitle();
    drawLine();
    return canvas;
}

module.exports = draw;

