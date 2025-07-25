const { version } = require('discord.js');
let fetch;
import('node-fetch').then(module => {
    fetch = module.default;
});

/**
 * This function gets the aura color of a user
 * @param {string}          type    specifies if the NID is a name or an ID. Defaults to ID, only uses name when 'name' is passed
 * @param {string|number}   NID     the name or ID of the user
 * @returns                         the aura color of the user, as an integer
 * @returns                         16645629 if the aura caused problems
 */
async function getAura(type, NID) {
    try {
        var url = (type == 'name') ? `https://api2.ninja.io/user/profile/${encodeURIComponent(NID)}/view-name` : `https://api2.ninja.io/user/profile/${NID}/view`   // turnary operator. if type is name, use the first url, else use the second url 
        const response = await fetch(url)
        if (response.status == 500) {
            return 16645629;
        } else {
            const profile = await response.json()
            const custom = profile['customization']
            if (Object.getOwnPropertyNames(custom).length != 0) {
                const orb = custom['orb']['data']
                if (Object.getOwnPropertyNames(orb).length != 0) {
                    const color = orb['energy']
                    return parseInt(color, 0)
                } else { return 16645629 }
            } else { return 16645629 }
        }
    } catch (error) {
        console.error('Error fetching aura:', error);
        return 16645629; // Default color in case of an error

    }
}

/**
 * This function gets the profile of a user
 * @param {string} type         specifies if the NID is a name or an ID. Defaults to ID, only uses name when 'name' is passed
 * @param {string|number} NID   the name or ID of the user
 * @returns                     the user profile json object
 * @returns                     'badName' if the name is not found
 * @returns                     'invalid' if the user is not found
 */
const getProfile = async (type, NID) => {
    const url = (type == 'name') ? `https://api2.ninja.io/user/profile/${encodeURIComponent(NID)}/view-name` : `https://api2.ninja.io/user/profile/${NID}/view`;
    const response = await fetch(url);
    return response.status == 500 ? 'badName'   // if the response status is 500, return 'badName'
        : response.status != 200 ? 'invalid'   // if the response status is not 200, return 'invalid'
            : await response.json();               // else return the json object
}

/**
 * This function gets the clan profile of a clan
 * @param {number} NID  the ID of the clan
 * @returns             the clan profile json object
 * @returns             'invalid' if the clan is not found
 */
async function getClanProfile(NID) {
    url = `https://api2.ninja.io/clan/${NID}/clan-id`
    const response = await fetch(url)
    const r = await response.json()
    if (response.status == 500) {
        return 'invalid';
    } else {
        if (r['error'] == 'Clan does not exist.') {
            return 'invalid'
        } else {
            return r
        }
    }
}

/**
 * This function gets the weapon stats of a user
 * @param {number} ID   the ID of the user
 * @returns             the user weapon stats json object
 * @returns             'invalid' if the user is not found
 */
async function getWeaponStats(ID) {
    var url = `https://api2.ninja.io/user/${ID}/weapon-stats`
    const response = await fetch(url)
    return response.status == 500 ? 'invalid' : await response.json();  // if the response status is 500, return 'invalid', else return the json object
}

/**
 * This function gets the clan ID of a clan
 * @param {string} name the name of the clan
 * @returns             the ID of the clan
 * @returns             'invalid' if the clan is not found
 */
async function getClanID(name) {
    var url = `https://api2.ninja.io/clan/list`
    const response = await fetch(url)
    r = await response.json()
    var clans = r['clans']
    var clanID = '0'
    for (i in clans) {
        if (clans[i]['name'].toLowerCase() == name.toLowerCase()) {
            clanID = clans[i]['id']
        }
    }
    if (clanID == '0') {
        clanID = 'invalid'
    }
    return clanID
}

/**
 * This function gets the clan members of a clan
 * @param {number} ID   the ID of the clan
 * @returns             the clan members json object
 */
async function getClanMembers(ID) {
    var url = `https://api2.ninja.io/clan/${ID}/members`
    const response = await fetch(url)
    const r = await response.json()
    return r
}

/**
 * This function gets the clan leader of a clan
 * @param {object} members the clan members json object
 * @returns                the clan leader name
 * @returns                'no one' if the leader is not found
 */
function getClanLeader(members) {
    var leader = 'no one'
    for (i in members['members']) {
        if (members['members'][i]['role'] == 'leader') {
            leader = members['members'][i]['name']
        }
    }
    return leader
}

/**
 * This function gets the game version of ninja.io
 * @returns the game version, as a string
 */
async function getGameVersion() {
    var url = 'https://ninja.io'
    const response = await fetch(url)
    const r = await response.text()
    const l = r.search('./js/dist/game-dev.js?')
    const v = r.substring(l + 24, l + 29)
    return v
}

/**
 * This function converts milliseconds to a readable format
 * @param {number} ms the milliseconds to convert
 * @returns           the converted time, as a string
 */
function dhm(ms) {
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    const daysms = ms % (24 * 60 * 60 * 1000);
    const hours = Math.floor(daysms / (60 * 60 * 1000));
    const hoursms = ms % (60 * 60 * 1000);
    const minutes = Math.floor(hoursms / (60 * 1000));
    const minutesms = ms % (60 * 1000);
    const sec = Math.floor(minutesms / 1000);
    //if (days != 0) {send=`${days} day/s ago`} else if (hours != 0) {send=`${hours} hour/s ago`} else if (minutes != 0) {send=`${minutes} minute/s ago`} else if (sec != 0) {send=`${sec} second/s ago`} else {send='Sometime ago'}
    return (days != 0) ? `${days} day/s ago`
        : (hours != 0) ? `${hours} hour/s ago`
            : (minutes != 0) ? `${minutes} minute/s ago`
                : (sec != 0) ? `${sec} second/s ago`
                    : 'Sometime ago';
}

const shurikens = "<:GreyShuriken:834903789810745404> <:GreyStarShuriken:834903789836173382> <:RedShuriken:834903789706149929> <:RedStarShuriken:834903789621215302> <:OrangeShuriken:834903789428539490> <:OrangeStarShuriken:834903789668270140> <:YellowShuriken:834903789223673868> <:YellowStarShuriken:834903789751369728> <:GreenShuriken:834903789659095100> <:GreenStarShuriken:834903789604438056> <:BlueShuriken:834903789131530291> <:BlueStarShuriken:1063127625536639028> <:PurpleShuriken:834903789156171787> <:PurpleStarShuriken:834903789265747969> <:PinkShuriken:834903789601161256> <:PinkStarShuriken:834903789600899092>".split(" ")
/**
 * This function converts xp to a level and corresponding shuriken Discord emoji
 * @param {number} xp the xp to convert
 * @returns          the level and corresponding shuriken Discord emoji, as a string. Example: <:GreyShuriken:834903789810745404>1000
 */
function levelMaker(xp) {
    const lvl = Math.min(Math.max(Math.floor(.2 * Math.sqrt(xp / 15.625)), 1), 240)
    const sure = shurikens[Math.floor(lvl / 16)]
    return sure + lvl
}

const rankTitles = "Newbie Novice Rookie Beginner Initiated Competent Adept Skilled Proficient Advanced Expert Elite Champion Master Grandmaster Ninja".split(" ")
/**
 * This function maps a skill index number
 * @param {number} skill the skill to map
 * @returns              the index number, as an integer
 */
function mapSkillToIndex(a) {
    let b = 0;
    500 <= a && 650 > a ? b = 1 : 650 <= a && 800 > a ? b = 2 : 800 <= a && 1001 > a ? b = 3 : 1001 <= a && 1100 > a ? b = 4 : 1100 <= a && 1200 > a ? b = 5 : 1200 <= a && 1300 > a ? b = 6 : 1300 <= a && 1400 > a ? b = 7 : 1400 <= a && 1500 > a ? b = 8 : 1500 <= a && 1600 > a ? b = 9 : 1600 <= a && 1700 > a ? b = 10 : 1700 <= a && 1800 > a ? b = 11 : 1800 <= a && 1900 > a ? b = 12 : 1900 <= a && 2E3 > a ? b = 13 : 2E3 <= a && 2100 > a ? b = 14 : 2100 <= a && (b = 15);
    return b
}
/**
 * This function maps skill to a rank title. Uses mapSkillToIndex internally to get the index number
 * @param {number} skill the skill to map
 * @returns              the rank title, as a string
 */
const mapToRankTitles = skill => rankTitles[mapSkillToIndex(skill)];

/**
 * This function gets the user ID of a user
 * @param {string} name the name of the user
 * @returns             the ID of the user
 * @returns             'badName' if the name is not found
 * @returns             'invalid' if the user is not found
 */
async function getUserID(name) {
    url = `https://api2.ninja.io/user/profile/${encodeURIComponent(name)}/view-name`
    const response = await fetch(url)
    if (response.status == 500) {
        console.log('bad name')
        return 'badName';
    } else if (response.status != 200) {
        return 'invalid';
    } else {
        // create a json object
        const json = await response.json();
        // return the id
        return json['id']
    }


}

module.exports = {
    getAura,
    getProfile,
    getWeaponStats,
    getClanID,
    getClanMembers,
    getGameVersion,
    dhm,
    levelMaker,
    mapToRankTitles,
    getClanProfile,
    getClanLeader,
    getUserID,
    shurikens
}