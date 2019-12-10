if (process.env.NODE_ENV !== "production") {
    const dotEnv = require("dotenv"); //Configure environmental variables
    const result = dotEnv.config();

    if (result.error) {
        throw result.error;
    }
}
const AppDao = require("../dao");
const TokenRepository = require("../repositories/token");
const UserRepository = require("../repositories/users");
const MemberRepository = require("../repositories/channel-members");
const TeamRepository = require("../repositories/teams");
const UserStandupsRepository = require("../repositories/user-standups");

const dao = new AppDao(process.env.DB_PATH);
const tokenRepo = new TokenRepository(dao);
const userRepo = new UserRepository(dao);
const teamRepo = new TeamRepository(dao);
const userStandupRepo = new UserStandupsRepository(dao);
const memberRepository = new MemberRepository(dao);

module.exports = {
    userRepo: userRepo,
    teamRepo: teamRepo,
    userStandupRepo: userStandupRepo,
    memberRepository: memberRepository,
    tokenRepo: tokenRepo
};
