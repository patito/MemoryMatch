var data_ = null;

/* Callback function.
 */
function JsonP(data) {
    data_ = data;
};

function MemoryMatch() {

	/* Board Game */
	this.board_ = [];

	/* Elements of Board */
	this.badges_ = [];

	/* Number of clicks */
	this.nclicks_ = 0;

	/* Number of opened badges */
	this.openedBadges_ = [];

	/* Number of hits */
	this.hits_ = 0;

	/* Game status */
	this.started_ = false;

	/* Configured Board */
	this.configuredBoard_ = false;

	/* First element click */
	this.firstElement_ = -1;

	/* Second element click */
	this.secondElement_ = -1;

	/* Start Chronometer */
	this.startChronometer_ = 0;

	/* Seconds */
	this.secs_ = 0;

	/* Minutes */
	this.mins_ = 0

    /* Interval ID */
    this.interval_ = -1;

    /* Lock variable */
    this.lock_ = false;
};

/* Getters Methods */

MemoryMatch.prototype.getBoard = function () {
    return this.board_;
};

MemoryMatch.prototype.getBadges = function () {
    return this.badges_;
};

MemoryMatch.prototype.getClicks = function () {
    return this.nclicks_;
};

MemoryMatch.prototype.getOpenedBadges = function () {
    return this.openedBadges_;
};

MemoryMatch.prototype.getHits = function () {
    return this.hits_;
};

MemoryMatch.prototype.getStatus = function () {
    return this.hits_;
};

/* Setters Methods */

/* Get the list of random badges.
 */
MemoryMatch.prototype.setBadges = function () {

    var local = this,
    	len = 9;

    for (var i = 0; i < len; i++) {
        local.badges_[i] = data_[local.getRandomID()];
    }
};

/* Increment hit.
 */
MemoryMatch.prototype.addHit = function () {
    this.hits_++;
};

/* Initialize MemoryMatch attributes.
 */
MemoryMatch.prototype.init = function () {
	var local = this;
	local.board_ = [];
	local.badges_ = [];
	local.nclicks_ = 0;
	local.openedBadges_ = [];
	local.hits_ = 0;
	local.started_ = true;
	local.configuredBoard_ = false;
	local.firstElement_ = -1;
	local.secondElement_ = -1;
	local.startChronometer_ = 0;
	local.secs_ = 0;
	local.mins_ = 0;
    clearInterval(local.interval_);
	document.getElementById("btnStartGame").disabled = false; 
};

/* Script request.
 */
MemoryMatch.prototype.newGame = function (url) {
    var script = document.createElement('script'),
    	local = this;

    script.src = url;
    document.getElementsByTagName('body')[0].appendChild(script);
    local.init();
    document.getElementById("btnStartGame").disabled = true; 
    local.startChronometer_ = 1;
    local.interval_ = setInterval("memory.chronometer();", 1000);
};

/* Return a random ID (0 - 83). Number of JSON elements.
 */
MemoryMatch.prototype.getRandomID = function () {
    return Math.floor((Math.random()*83));
};

/* Shuffle array; StackOverflow;
 * http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
 */
MemoryMatch.prototype.shuffle = function () {
    var local = this,
        i = local.board_.length;

    if (0 === i) { 
        return;
    }

    while (--i) {
        var j = Math.floor( Math.random() * (i + 1)),
            tempi = local.board_[i],
            tempj = local.board_[j];
        local.board_[i] = tempj;
        local.board_[j] = tempi;
   }
};

/* Configure game board.
 */
MemoryMatch.prototype.configureBoard = function () {
	var local = this;

	local.setBadges();
    for (var i = 0; i < 18; i++) {
        local.board_[i] = local.badges_[i%9];
    }

    local.shuffle();
};

/* Show the badge.
 */
MemoryMatch.prototype.showBadge = function(index) {
	var local = this;
    document.badge[index].src = local.board_[index].img;
};

/* Hide the badge.
 */
MemoryMatch.prototype.hideBadge = function(index) {
    document.badge[index].src = "https://i2.wp.com/codebits.eu/logos/defaultavatar.jpg";
};

/* Hide all badges.
 */
MemoryMatch.prototype.hideOpenedBadges = function () {
	var local = this;
    for (var i = 0; i < local.openedBadges_.length; i++) {
        local.hideBadge(local.openedBadges_[i]);
    }
    local.openedBadges_ = [];
    local.nclicks_ = 0;
};

/* Hide badges.
 */
MemoryMatch.prototype.hideBadges = function () {

    var local = this;
    local.hideBadge(local.firstElement_);
    local.hideBadge(local.secondElement_);
    local.firstElement_ = -1;
    local.secondElement_ = -1;
    this.lock_ = false;
};

/* Handle hits.
 */
MemoryMatch.prototype.handleHits = function () {

	var local = this;

    local.hits_++;
    local.openedBadges_.push(local.firstElement_);
    local.openedBadges_.push(local.secondElement_);
    if (9 === local.hits_) {
    	local.twittResult();
    	local.hideOpenedBadges();
        local.init();
        return;
    }
};

MemoryMatch.prototype.verify = function () {

    var i;
    for (i = 0; i < this.board_.length; i++) {
        if (this.controller[i] === true) {
            return true;
        }
    }
    return false;
};

/* Click handle.
 */
MemoryMatch.prototype.move = function (index) {

	var local = this;

    if (false === this.lock_) {
        this.lock_ = true;

        if (false === local.started_) {
        	alert("Press Start");
            return;
        } else {
        	if (false === local.configuredBoard_) {
        		local.configureBoard();
        		local.configuredBoard_ = true;
        	}
        }

        if (local.firstElement_ === index ||
            local.secondElement_ === index ||
            -1 !== local.openedBadges_.indexOf(index)) {
            this.lock_ = false;
            return;
        }

        local.showBadge(index);
        if (0 === local.nclicks_){
        	local.firstElement_ = index;
        }

        if (1 === local.nclicks_) {
        	local.secondElement_ = index;
        }

        local.nclicks_++;
        if (2 === local.nclicks_) {
            if (local.board_[local.firstElement_].id !== local.board_[local.secondElement_].id) {
                setTimeout("memory.hideBadges();", 1000);
            } else {
                local.handleHits();
                this.lock_ = false;
            }
            local.nclicks_ = 0;
        } else {
            this.lock_ = false;
        }
    }
};

/* Game chronometer.
 */
MemoryMatch.prototype.chronometer = function () {

	var local = this;

	if (1 === local.startChronometer_) {
		local.secs_++;
		if (60 === local.secs_) {
			local.secs_ = 0;
			local.mins_ += 1;
		}

		if (60 === local.mins_) {
			local.secs_ = 0;
			local.mins_ = 0;
		}
	} 

	document.getElementById('showtm').innerHTML = local.mins_ + ' Minute(s) ' + local.secs_ + ' Second(s)';
};

/* Twitt the result.
 */
MemoryMatch.prototype.twittResult = function () {
	var local = this;
    window.open("https://twitter.com/intent/tweet?text=Memory JavaScript FTW em:" + local.mins_ + " Minute(s) " + local.secs_ + " Second(s)", 
                "Twitter",
                "status = 1, left = 430, top = 270, height = 550, width = 420, resizable = 0");

}

var memory = new MemoryMatch();

