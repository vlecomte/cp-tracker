/*global console, users, Promise, JsonPromise, CachedResults*/

function UhuntLike(judgeName, apiUrl, pdfUrl) {
    "use strict";
    var verdicts = {
            0: "???",
            10: "Submission error",
            15: "Can't be judged",
            20: "In queue",
            30: "Compile error",
            35: "Restricted function",
            40: "Runtime error",
            45: "Output limit",
            50: "Time limit",
            60: "Memory limit",
            70: "Wrong answer",
            80: "Presentation error",
            90: "Accepted"
        },
        langs = {
            1: "ANSI C",
            2: "Java",
            3: "C++",
            4: "Pascal",
            5: "C++11"
        },
        Problem = function (num, title) {
            this.num = num;
            this.title = title;
            this.displayName = judgeName + " " + num + " - " + title;
            this.pdfLink = pdfUrl + Math.floor(num / 100) + "/" + num + ".pdf";
        },
        problemData = new CachedResults(function (problemId) {
            return new JsonPromise(apiUrl + "p/id/" + problemId).then(function (data) {
                return new Problem(data.num, data.title);
            });
        }),
        Submission = function (userName, subDesc) {
            this.id = subDesc[0];
            this.userName = userName;
            this.problemId = judgeName + ", id=" + subDesc[1];
            this.getProblem = function () { return problemData.get(subDesc[1]); };
            this.verdict = verdicts[subDesc[2]];
            this.lang = langs[subDesc[5]];
            this.runTime = subDesc[3] * 0.001;
            this.submitTime = subDesc[4];
        };
    
    this.name = judgeName;
    this.userSubs = function (userName) {
        return new CachedResults(function (userId) {
            return new JsonPromise(apiUrl + "subs-user/" + userId)
                .then(function (result) {
                    return result.subs.map(function (subDesc) {
                        return new Submission(userName, subDesc);
                    });
                });
        }, 2000);
    };
}

var uh = new UhuntLike("UVa", "https://uhunt.onlinejudge.org/api/",
                       "https://uva.onlinejudge.org/external/");
var la = new UhuntLike("LA", "https://icpcarchive.ecs.baylor.edu/uhunt/api/",
                        "https://icpcarchive.ecs.baylor.edu/external/");

var judges = [uh, la];

function getAllSubsForUser(user) {
    "use strict";
    return new Promise(function (resolve, reject) {
        var subs = [], received = 0;
        judges.forEach(function (judge) {
            if (user.hasOwnProperty(judge.name)) {
                judge.userSubs(user.name).get(user[judge.name]).then(function (userSubs) {
                    //console.log("receiving subs for " + user[judge.name]);
                    userSubs.forEach(function (sub) {
                        subs.push(sub);
                    });
                    received += 1;
                    if (received === judges.length) {
                        //console.log("got all!");
                        resolve(subs);
                    }
                });
            } else {
                received += 1;
            }
        });
    });
}

function getAllSubs() {
    "use strict";
    return new Promise(function (resolve, reject) {
        var subs = [], received = 0;
        users.forEach(function (user) {
            getAllSubsForUser(user).then(function (userSubs) {
                userSubs.forEach(function (sub) {
                    subs.push(sub);
                });
                received += 1;
                if (received === users.length) {
                    subs.sort(function (sub1, sub2) {
                        return sub2.submitTime - sub1.submitTime;
                    });
                    resolve(subs);
                }
            });
        });
    });
}