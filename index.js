/**
 * @file Pornhub - Bulk Accept Friend Requests
 * @summary Pornhub doesn't have a "Bulk" accept friends, so I built one. Import into Chrome Dev Tools > Sources > Snippets, then run the function from the pornhub.com/user/friend_requests page.
 * @author Aiden Valentine <aiden@xxxmultimedia.com>
 * @copyright Nero Media LLC 2017
 * @license Apache-2.0
 */
/** Load jQuery Library from CDN, and inject into page's head */
var jq = document.createElement('script');
jq.src = "https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js";
document.getElementsByTagName('head')[0].appendChild(jq);
// ... give time for script to load, then type (or see below for non wait option)
jQuery.noConflict();

/**
 * Configuration - You can change these settings if needed.
 * @constant {number} delay Number of milliseconds to wait between AJAX requests. Let the server breathe, set to at least 1000.
 * @default 2000
*/
var delay = 2000;

/** Variables for this script. DO NOT CHANGE (Unless you know what you're doing) */
var reqDelay = delay || 2000;
/** @todo Not in use. Set if on a different page than pornhub.com/user/friend_requests */
var baseUrl = "https://www.pornhub.com";
var ai = 0; /** Requests Array Index */
var requests = [];
var x = document.querySelectorAll('div.float-left.requestRightCol.requestContent > div > button.greenButton.float-right');
var i = 0; /** aReq Index */
/** End Variables */

for( i=0; i < x.length; i++ ) {
	var reqData = jQuery(jQuery(x)[i]).attr("onClick");
	var reqParams = reqData.slice(18,-1);
	var req = [];
	var aReq = {};

	var req = reqParams.split(", ");

	var reqId = +req[0].slice(1,-1);
	var reqAccept = +req[1];
	var reqUrl = req[2].slice(1,-1);
	var reqUser = req[3].slice(1,-1);
	var reqUserUrl = req[4].slice(1,-1);
	
	var aReq = {
		"id" : reqId,
		"accept" : reqAccept,
		"url" : reqUrl,
		"user" : reqUser,
		"userUrl" : reqUserUrl
	};
//     console.log(aReq); // Debug
    requests.push(aReq);
}

console.log("Requests on this page: ", requests);
/** Send one request at a time through the AJAX endpoint, then wait for a callback before continuing */
var loopArray = function(r) {
    // call itself
		sendReq(r[ai].id, r[ai].accept, r[ai].url, r[ai].user, r[ai].userUrl, function(){
        // set ai to next item
        ai++;
        // any more items in array?
        if(ai < r.length) {
         	loopArray(r);   
        } else {
            console.log("All done!");
        }
    });
}

/** Begin looping through friend requests and send then to {@link sendReq} */
loopArray(requests);

/**
 *  Send Request - Send a single "Accept" friend request to the server at a time. Wait for delay to timeout, then callback to the loopArray to upon success to process the next request.
 *  @function sendReq
 *  @param {number} f ID of the friend request.
 *  @param {number} d Action to preform (1 = Accept Friend Request, -1 = Block User).
 *  @param {string} b URI of the AJAX endpoint to send POST data.
 *  @param {string} e Username of the user which sent the friend request.
 *  @param {string} a URI of the requesting user.
 */
function sendReq(f, d, b, e, a, callback){
  $j.ajax({
    type: "POST",
    url: b,
    data: {
        id: f,
        accept: d
    },
    success: function(g) {
        if (g == "OK") {
            /** Wait until we hear back from Server 'OK', wait until reqDelay expires (So we don't bombard their servers with AJAX reqs), then process next friend request */
			console.log("OK received, Callback firing in T-"+reqDelay+" Milliseconds, and counting...");
			setTimeout(function(){
			    callback();
            }, reqDelay);
        } else {
            /** @todo Figure out err responses from server for error handling (Error Codes: 502) */
			console.log("Did NOT receive OK from server, Callback firing anyway...T-"+reqDelay+" Milliseconds, and counting...");
            setTimeout(function(){
			    callback();
            }, reqDelay);
            /** @todo If not 200, do something else (Console.log, alert, etc.), then quit loop */
            // window.alert("An error has occured, please try again later...");
						/** @todo Create quit(); function to quit loop if fatal/non-recoverable error occurs. */
        }
    }
  })
}