const Q = require('q');
if (process.env.NODE_ENV !== "production") {
    const dotEnv = require("dotenv"); //Configure environmental variables
    const result = dotEnv.config();

    if (result.error) {
        throw result.error;
    }
}

const repos = require("../services/repos");

module.exports = {
    saveMember: saveMember,
    flushMembers: flushMembers,
    getUserProfile: getUserProfile
};

/**
 * get all users who unsubscribed
 */
function getUserProfile(userId) {
    let deferred = Q.defer();
    repos.memberRepository.getMemberProfile(userId)
        .then(response => {
            deferred.resolve(response);
        })
        .catch(error => {
            if (error.code === ErrorCode.PlatformError) {
                console.log("error message", error.message);
                console.log("error message", error.data);
            }
            deferred.reject(error);
        });

    return deferred.promise
}


function saveMember(person) {
    repos.memberRepository.addMember(person);
}

function flushMembers() {
    repos.memberRepository.countMembers().then(membersCount => {
        if (membersCount.value > 0) {
            repos.memberRepository.flushMembers();
        }
    });
}

