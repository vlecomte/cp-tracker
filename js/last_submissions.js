/*global console, makeCell, getAllSubs*/

var numSubs = 20; // Number of last submissions to display
var ls_last_sub_num = 0;

function formatTime(timestamp) {
    "use strict";
    function pad2(number) {
        if (number < 10) {
            return "0" + number;
        } else {
            return number;
        }
    }
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        date = new Date(timestamp * 1000);
    return months[date.getMonth()] + " " + date.getDate() + ", "
        + pad2(date.getHours()) + ":" + pad2(date.getMinutes());
}

function makeSubmissionRow(sub) {
    "use strict";
    var rowElt = document.createElement("tr"),
        problemCell = document.createElement("th"),
        problemLink = document.createElement("a");
    
    problemCell.appendChild(problemLink);
    
    sub.getProblem().then(function (problem) {
        problemLink.href = problem.pdfLink;
        problemLink.textContent = problem.displayName;
    });
    
    rowElt.appendChild(makeCell(sub.userName));
    rowElt.appendChild(problemCell);
    rowElt.appendChild(makeCell(sub.verdict));
    rowElt.appendChild(makeCell(sub.lang));
    rowElt.appendChild(makeCell(sub.runTime.toFixed(3)));
    rowElt.appendChild(makeCell(formatTime(sub.submitTime)));
    return rowElt;
}

function refreshTable() {
    "use strict";
    var subTable = document.getElementById("submissions-table");
    
    function computeTable(subs) {
        // Avoid updates that don't change anything
        if (subs.length === ls_last_sub_num) {
            return;
        }
        ls_last_sub_num = subs.length;
        // Truncate to first numSubs elements
        subs.length = Math.min(subs.length, numSubs);
        // Clear and refill table
        subTable.innerHTML = "";
        subs.forEach(function (sub) {
            subTable.appendChild(makeSubmissionRow(sub));
        });
    }
    
    // Load last numSubs submissions for each user
    getAllSubs().then(computeTable);
}

refreshTable();
setInterval(refreshTable, 5000);
