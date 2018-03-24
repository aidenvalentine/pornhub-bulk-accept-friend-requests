// ==UserScript==
// @name         Pornhub - Bulk Accept Friend Requests
// @namespace    https://www.pornhub.com/
// @version      0.1
// @description  Bulk Accept Friend Requests
// @author       Aiden Valentine
// @match        https://www.pornhub.com/user/friend_requests
// @grant        none
// @require http://code.jquery.com/jquery-1.12.4.min.js
// ==/UserScript==

(function() {
    'use strict';

    var delay = 100;

    /** Variables for this script. DO NOT CHANGE (Unless you know what you're doing) */
    var reqDelay = delay || 200;
    /** @todo Not in use. Set if on a different page than pornhub.com/user/friend_requests */
    var baseUrl = "https://www.pornhub.com";
    var ai = 0; /** Requests Array Index */
    var requests = [];
    var x = document.querySelectorAll('div.float-left.requestRightCol.requestContent > div > button.greenButton.float-right');
    var i = 0; /** aReq Index */
    /** End Variables */

    for( i=0; i < x.length; i++ ) {
        var reqData = $($(x)[i]).attr("onClick");
        var reqParams = reqData.slice(18,-1);
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
    };

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
    function sendReq(f, d, b, e, a, next){
        $.ajax({
            type: "POST",
            url: b,
            data: {
                id: f,
                accept: d
            },
            success: function(g) {
                if (g == "OK") {
                    var elem = $("#request_" + f);
                    elem.addClass("accepted");
                    elem.find(".requestContent,.usernameWrap").fadeOut("fast", function() {
                        elem.find(".actionMessage").html('You and <a href="' + a + '" style="font-weight:bold;">' + e + "</a> are now friends.").fadeIn("fast");
                    });
                    // elem.html("Friend has been added! (Exception in success function.)");

                    /** Wait until we hear back from Server 'OK', wait until reqDelay expires (So we don't bombard their servers with AJAX reqs), then process next friend request */
                    console.log("OK received, Callback firing in T-"+reqDelay+" Milliseconds, and counting...");
                    setTimeout(function(){
                        next();
                    }, reqDelay);
                } else {
                    /** @todo Figure out err responses from server for error handling (Error Codes: 502) */
                    console.log("Did NOT receive OK from server, Callback firing anyway...T-"+reqDelay+" Milliseconds, and counting...");
                    setTimeout(function(){
                        next();
                    }, reqDelay);
                    /** @todo If not 200, do something else (Console.log, alert, etc.), then quit loop */
                    // window.alert("An error has occured, please try again later...");
                    /** @todo Create quit(); function to quit loop if fatal/non-recoverable error occurs. */
                }
            }
        });
    }

    // Clicks an HTML element using jQuery.
    function loadMore(elem) {
        console.log("Loading More Vids.");
        elem.trigger( "click" );
    }

    // Parse the jQuery elems and extract vid id and other data.
    function getIds(elems, callback) {
        console.log(elems.length);
        var arr = []; // Init an array to hold the data.
        for( var i=0; i <= elems.length; i++ ) {
            var doc = elems[i];
            var id = doc.dataset.id*1;
            arr.push(id); // Push vid data into the arr.

            // Runs when finished looping the array.
            if (i == elems.length-1) {
                callback(null, arr); // Return the array.
            }
        }
    }

})();
