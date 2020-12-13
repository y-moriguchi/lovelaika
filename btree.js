(function(root) {
    var ORDER = 4;

    function Node() {
        this.isLeaf = true;
        this.count = 0;
        this.keys = [];
        this.nodes = [];
    }

    Node.prototype.getKey = function(index) {
        return this.keys[index];
    };

    Node.prototype.getNode = function(index) {
        return this.nodes[index];
    };

    Node.prototype.isExistNode = function(index) {
        return !!this.nodes[index];
    };

    Node.prototype.insertKey = function(index, key) {
        this.keys.splice(index, 0, key);
        this.count++;
    };

    Node.prototype.insertNode = function(index, node) {
        this.nodes.splice(index, 0, node);
    };

    Node.prototype.splitNode = function(index) {
        var nodeNew = new Node(),
            centerKey = this.keys[index];

        nodeNew.isLeaf = this.isLeaf;
        nodeNew.keys = this.keys.slice(index);
        nodeNew.count = this.count - index;
        nodeNew.nodes = this.nodes.slice(index);

        this.keys.splice(index);
        this.nodes.splice(index);
        this.count = index;

        return {
            key: centerKey,
            node: nodeNew
        };
    };

    Node.prototype.searchIndex = function(key) {
        var i;

        for(i = 0; i < this.count; i++) {
            if(key <= this.getKey(i)) {
                break;
            }
        }
        return i;
    };

    Node.prototype.searchNode = function(key) {
        var i;

        for(i = 0; i < this.count; i++) {
            if(key === this.getKey(i)) {
                return this.getNode(i);
            }
        }
        return null;
    };

    Node.prototype.search = function(key) {
        if(this.isLeaf) {
            return this.searchNode(key);
        } else {
            return this.getNode(this.searchIndex(key)).search(key);
        }
    };

    Node.prototype.insertKeyNode = function(key, node) {
        var i;

        i = this.searchIndex(key);
        this.insertKey(i, key);
        this.insertNode(i + 1, node);
        if(this.count > ORDER) {
            return this.splitNode(i);
        } else {
            return false;
        }
    };

    Node.prototype.insertKeyValue = function(key, value, action) {
        var i;

        i = this.searchIndex(key);
        if(this.getKey(i) === key) {
            action(this.getNode(i), value);
            return false;
        } else {
            this.insertKey(i, key);
            this.insertNode(i, [value]);
            if(this.count > ORDER) {
                return this.splitNode(i);
            } else {
                return false;
            }
        }
    };

    Node.prototype.insert = function(key, value, action) {
        var i,
            result;

        i = this.searchIndex(key);
        if(!this.isExistNode(i)) {
            this.keys[i] = key;
            this.nodes[i] = [value];
            this.count++;
            if(this.count > ORDER) {
                result = this.splitNode(ORDER / 2);
                this.nodes[this.count] = result.node;
                return result;
            } else {
                return false;
            }
        } else if(this.isLeaf) {
            return this.insertKeyValue(key, value, action);
        } else {
            result = this.getNode(i).insert(key, value, action);
            if(result) {
                return this.insertKeyNode(result.key, result.node);
            } else {
                return false;
            }
        }
    };

    function BPlusTree() {
        this.root = new Node();
    }

    BPlusTree.prototype.search = function(key) {
        return this.root.search(key);
    };

    BPlusTree.prototype.insert = function(key, value) {
        function insertAction(node, value) {
            node.push(value);
        }

        var result = this.root.insert(key, value, insertAction),
            rootNew;

        if(result) {
            rootNew = new Node();
            rootNew.insertKey(0, result.key);
            rootNew.insertNode(0, this.root);
            rootNew.insertNode(1, result.node);
            rootNew.isLeaf = false;
            this.root = rootNew;
        }
    };

    root["BTree"] = BPlusTree;
})(this);

