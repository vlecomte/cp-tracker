/*global console, uh, uhuntIds, makeCell, getAllSubs*/

var numDays = 15; // Time period to compare users
var refreshTime = 5000; // Time between refreshes (millis)

function makeTopSolverRow(rank, user) {
    "use strict";
    var rowElt = document.createElement("tr");
    rowElt.appendChild(makeCell(rank));
    rowElt.appendChild(makeCell(user.name));
    rowElt.appendChild(makeCell(user.numSolved));
    return rowElt;
}

function refreshTable() {
    "use strict";
    var topTable = document.getElementById("top-solvers");
    
    function computeTable(activeUsers) {
        activeUsers.sort(function (user1, user2) {
            if (user1.numSolved !== user2.numSolved) {
                return user2.numSolved - user1.numSolved;
            } else {
                return user1.name.localeCompare(user2.name);
            }
        });
        
        topTable.innerHTML = "";
        activeUsers.forEach(function (user, rank) {
            topTable.appendChild(makeTopSolverRow(rank + 1, user));
        });
    }
    
    getAllSubs().then(function (subs) {
        var firstAC = {},
            minTimestamp = Date.now() / 1000 - numDays * 24 * 60 * 60,
            activeUsers = [];
        subs.forEach(function (sub) {
            if (!firstAC.hasOwnProperty(sub.userName)) {
                firstAC[sub.userName] = {};
            }
            firstAC[sub.userName][sub.problemId] = sub.submitTime;
        });
        Object.keys(firstAC).forEach(function (userName) {
            var solvedLately = 0;
            Object.keys(firstAC[userName]).forEach(function (problemId) {
                if (firstAC[userName][problemId] >= minTimestamp) {
                    solvedLately += 1;
                }
            });
            if (solvedLately > 0) {
                activeUsers.push({name: userName, numSolved: solvedLately});
            }
        });
        computeTable(activeUsers);
    });
}

refreshTable();
setInterval(refreshTable, refreshTime);
