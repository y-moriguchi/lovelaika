var common = require("./net_common.js");

function createSvg(base) {
    var me;

    me = common.extend(base(), {
        addLine: function(toAdd, x1, y1, x2, y2, stroke) {
            var node = me.createNode("line");

            node.setAttribute("x1", x1);
            node.setAttribute("y1", y1);
            node.setAttribute("x2", x2);
            node.setAttribute("y2", y2);
            node.setAttribute("stroke", stroke);
            toAdd.appendChild(node);
        },

        addLineByPath: function(toAdd, x1, y1, x2, y2, id, stroke) {
            var node = me.createNode("path");

            node.setAttribute("d", "M" + x1 + " " + y1 + " L" + x2 + " " + y2);
            node.setAttribute("id", id);
            node.setAttribute("stroke", stroke);
            toAdd.appendChild(node);
        },

        addPath: function(toAdd, d, fill, stroke) {
            var node = me.createNode("path");

            node.setAttribute("d", d);
            node.setAttribute("fill", fill);
            node.setAttribute("stroke", stroke);
            toAdd.appendChild(node);
        },

        addText: function(toAdd, text, x, y, opt) {
            var node = me.createNode("text");

            node.setAttribute("x", x);
            node.setAttribute("y", y);
            node.setAttribute("font-family", opt.fontFamily);
            node.setAttribute("font-size", opt.fontSize);
            node.textContent = text;
            toAdd.appendChild(node);
        },

        addTextWithPath: function(toAdd, text, id, opt) {
            var node = me.createNode("text"),
                path = me.createNode("textPath");

            node.setAttribute("font-family", opt.fontFamily);
            node.setAttribute("font-size", opt.fontSize);
            path.setAttribute("href", "#" + id);
            path.textContent = text;
            node.appendChild(path);
            toAdd.appendChild(node);
        },

        addDefs: function(toAdd) {
            var node = me.createNode("defs");

            toAdd.appendChild(node);
            return node;
        },

        addUse: function(toAdd, id) {
            var node = me.createNode("use");

            node.setAttribute("href", "#" + id);
            toAdd.appendChild(node);
        },

        addCircle: function(toAdd, x, y, radius, stroke, fill) {
            var node = me.createNode("circle");

            node.setAttribute("cx", x);
            node.setAttribute("cy", y);
            node.setAttribute("r", radius);
            node.setAttribute("stroke", stroke);
            if(fill) {
                node.setAttribute("fill", fill);
            }
            toAdd.appendChild(node);
        },

        addPolygon: function(toAdd, points, stroke) {
            var node = me.createNode("polygon");

            node.setAttribute("points", points);
            toAdd.appendChild(node);
        },

        addRect: function(toAdd, x, y, width, height, stroke) {
            var node = me.createNode("rect");

            node.setAttribute("x", x);
            node.setAttribute("y", y);
            node.setAttribute("width", width);
            node.setAttribute("height", height);
            node.setAttribute("stroke", stroke);
            toAdd.appendChild(node);
        }
    });
    return me;
}

module.exports = createSvg;

