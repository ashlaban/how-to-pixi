// requires HexUtil.LinkedList

var HexAnimationSystem = function () {

    // === Animation List ===
    // =============================================
    function AnimationSystem () {
        this.prevTime = -1;
        this.animList = new HexUtil.LinkedList();
    };
    /*
     * callback(dt, currentTime)
     *     A function providing the acutal animation.
     *     this       : An Animation object.
     *     dt         : Time since last frame
     *     currentTime: An absolute measure of time. 
     */
    AnimationSystem.prototype.add = function (callback) {
        var anim;
        anim = new Animation(callback);
        this.animList.push(anim);
    };

    AnimationSystem.prototype.updateAndPurge = function (dt, currentTime) {
        var node, nextNode, data, isExpired;
        node = this.animList.first;

        while (node !== null) {
            data = node.data;

            nextNode  = node.next;
            isExpired = data.update(dt, currentTime);

            if (isExpired) {
                this.animList.remove(node);
            }

            node = nextNode;
        }
    };

    AnimationSystem.prototype.update = function (dt, currentTime) {
        var node, data;
        node = this.animList.first;

        while (node !== null) {
            data = node.data;

            data.update(dt, currentTime);

            node = node.next;
        }
    };
    // AnimationSystem.prototype.purge  = function () {
    //     var node, nextNode, data;
        
    //     node  = animList.first;

    //     while (node !== null) {
    //         data = node.data;

    //         nextNode = node.next;

    //         if (data.isExpired()) {
    //             animList.remove(node);
    //         }

    //         node = nextNode;
    //     }
    // };
    
    AnimationSystem.prototype.animate = function (currentTime) {
        var dt;

        requestAnimationFrame(this.animate.bind(this));

        if (this.prevTime === -1 || this.prevTime === undefined) {
            this.prevTime = currentTime;
            return;
        }

        dt = currentTime - this.prevTime;
        this.prevTime = currentTime;

        this.updateAndPurge(dt, currentTime);
    };

    // =============================================
    // === END Animation List ===
    
    // === Animation ===
    // =============================================
    // 
    /*
     * callback(dt, currentTime)
     *     A function providing the acutal animation.
     *     this       : The Animation object.
     *     dt         : Time since last frame
     *     currentTime: An absolute measure of time.
     */ 
    function Animation (callback) {
        this.callback = callback;
    };
    Animation.prototype.update = function (dt, currentTime) {
        return this.callback.call(this, dt, currentTime);
    };

    // =============================================
    // === END Animation === 

    // External API
    var API = {
        AnimationSystem: AnimationSystem,
        Animation      : Animation
    };

    return API;
}();