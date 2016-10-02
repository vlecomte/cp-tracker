/*global console, users, Promise, JsonPromise, CachedResults*/

function UhuntLike(judgeName, url, apiUrl) {
    "use strict";
    this.name = judgeName;
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
        pdfUrl = url + "external/",
        problemData = new CachedResults(function (problemId) {
            return new JsonPromise(apiUrl + "p/id/" + problemId);
        });
    
    function Problem(num, title) {
        this.num = num;
        this.title = title;
        this.displayName = judgeName + " " + num + " - " + title;
        this.pdfLink = pdfUrl + Math.floor(num / 100) + "/" + num + ".pdf";
    }
    
    function Submission(userName, sub) {
        this.id = sub[0];
        this.userName = userName;
        this.problemId = judgeName + ", id=" + sub[1];
        this.problem = new Promise(function (resolve, reject) {
            problemData.get(sub[1]).then(function (data) {
                resolve(new Problem(data.num, data.title));
            });
        });
        this.verdict = verdicts[sub[2]];
        this.lang = langs[sub[5]];
        this.runTime = sub[3] * 0.001;
        this.submitTime = sub[4];
    }
    
    this.userData = new CachedResults(function (userId) {
        return new JsonPromise(apiUrl + "subs-user/" + userId)
            .then(function (result) {
                var data = {
                    name: result.name,
                    username: result.uname,
                    displayName: result.name + " (" + result.uname + ")",
                    subs: []
                };
                result.subs.forEach(function (subDesc) {
                    data.subs.push(new Submission(data.name, subDesc));
                });
                // Latest submission first
                data.subs.sort(function (sub1, sub2) {
                    return sub2.id - sub1.id;
                });
                return data;
            });
    }, 2000);
}

var uh = new UhuntLike("UVa", "https://uhunt.onlinejudge.org/",
                       "https://uhunt.onlinejudge.org/api/");
var la = new UhuntLike("LA", "https://icpcarchive.ecs.baylor.edu/",
                       "https://icpcarchive.ecs.baylor.edu/uhunt/api/");

var judges = [uh, la];

function getAllSubsForUser(user) {
    "use strict";
    return new Promise(function (resolve, reject) {
        var subs = [], received = 0;
        judges.forEach(function (judge) {
            if (user.hasOwnProperty(judge.name)) {
                judge.userData.get(user[judge.name]).then(function (data) {
                    //console.log("receiving subs for " + user[judge.name]);
                    data.subs.forEach(function (sub) {
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