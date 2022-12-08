const { version } = require('discord.js');
const fetch  = require('node-fetch');

async function getAura(type, NID){
    var url = ''
    if (type == 'name') {
        url = `https://api.ninja.io/user/profile/${NID}/view-name`
    } else if (type == 'ID') {
        url = `https://api.ninja.io/user/profile/${NID}/view`
    }
    const response = await fetch(url)
    if (response.status == 500) {
        return 16645629;
    } else{
        const profile = await response.json()
        const custom = profile['customization']
        if (Object.getOwnPropertyNames(custom).length != 0) {
            const orb = custom['orb']['data']
            if (orb != {}) {
                const color = orb['energy']
                return parseInt(color, 0)
            } else {return 16645629}
        } else {return 16645629}
    }
}

async function getProfile(type, NID){
    var url = ''
    if (type == 'name') {
        url = `https://api.ninja.io/user/profile/${NID}/view-name`
    } else if (type == 'ID') {
        url = `https://api.ninja.io/user/profile/${NID}/view`
    }
    const response = await fetch(url)
    if (response.status == 500) {
        return 'invalid';
    } else{
       return await response.json();
    }
}

async function getWeaponStats(ID){
    var url = `https://api.ninja.io/user/${ID}/weapon-stats`
    const response = await fetch(url)
    if (response.status == 500) {
        return 'invalid';
    } else{
       return await response.json();
    }
}

async function getClanStats(ID){
    var url = `https://api.ninja.io/clan/${ID}/clan-id`
    const response = await fetch(url)
    const r = await response.json()
    if (response.status == 500) {
        return 'invalid';
    } else{
        if (r['error'] == 'Clan does not exist.'){
            return 'invalid'
        } else{
            return r
        }
    }
}

async function getClanID(name){
    var url = `https://api.ninja.io/clan/list`
    const response = await fetch(url)
    r = await response.json()
    var clans = r['clans']
    var clanID = '0'
    for (i in clans){
        if (clans[i]['name'] == name){
            clanID = clans[i]['id']
        }
    }
    if (clanID == '0'){
        clanID = 'invalid'
    }
    return clanID
}

async function getClanMembers(ID){
    var url = `https://api.ninja.io/clan/${ID}/members`
    const response = await fetch(url)
    const r = await response.json()
    return r
}

async function getGameVersion(){
    var url = 'https://ninja.io'
    const response = await fetch(url)
    const r = await response.text()
    const l = r.search('./js/dist/game-dev.js?')
    const v = r.substring(l+24, l+29)
    return v
}


module.exports = {
    getAura,
    getProfile,
    getWeaponStats,
    getClanStats,
    getClanID,
    getClanMembers,
    getGameVersion
}
