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
        url = `https://api.ninja.io/clan/${NID}/members`
    }
    const response = await fetch(url)
    if (response.status == 500) {
        return 'invalid';
    } else{
       return await response.json();
    }
}

async function getClanProfile(NID){
   url = `https://api.ninja.io/clan/${NID}/clan-id`
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


async function getWeaponStats(ID){
    var url = `https://api.ninja.io/user/${ID}/weapon-stats`
    const response = await fetch(url)
    if (response.status == 500) {
        return 'invalid';
    } else{
       return await response.json();
    }
}

async function getClanID(name){
    var url = `https://api.ninja.io/clan/list`
    const response = await fetch(url)
    r = await response.json()
    var clans = r['clans']
    var clanID = '0'
    for (i in clans){
        if (clans[i]['name'].toLowerCase() == name.toLowerCase()){
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

function getClanLeader(members){
      var leader = 'no one'
      for (i in members['members']){
         if (members['members'][i]['role'] == 'leader'){
            leader = members['members'][i]['name']
         }
      }
      return leader
}

async function getGameVersion(){
    var url = 'https://ninja.io'
    const response = await fetch(url)
    const r = await response.text()
    const l = r.search('./js/dist/game-dev.js?')
    const v = r.substring(l+24, l+29)
    return v
}

function dhm(ms) {
	const days = Math.floor(ms / (24*60*60*1000));
	const daysms = ms % (24*60*60*1000);
	const hours = Math.floor(daysms / (60*60*1000));
	const hoursms = ms % (60*60*1000);
	const minutes = Math.floor(hoursms / (60*1000));
	const minutesms = ms % (60*1000);
	const sec = Math.floor(minutesms / 1000);
	var send = ``
	if (days != 0) {send=`${days} day/s ago`} else if (hours != 0) {send=`${hours} hour/s ago`} else if (minutes != 0) {send=`${minutes} minute/s ago`} else if (sec != 0) {send=`${sec} second/s ago`} else {send='Sometime ago'}
	return send
  }

const shurikens = "<:GreyShuriken:834903789810745404> <:GreyStarShuriken:834903789836173382> <:RedShuriken:834903789706149929> <:RedStarShuriken:834903789621215302> <:OrangeShuriken:834903789428539490> <:OrangeStarShuriken:834903789668270140> <:YellowShuriken:834903789223673868> <:YellowStarShuriken:834903789751369728> <:GreenShuriken:834903789659095100> <:GreenStarShuriken:834903789604438056> <:BlueShuriken:834903789131530291>".split(" ")
function levelMaker(xp) {
	const lvl = Math.min(Math.max(Math.floor(.2 * Math.sqrt(xp / 15.625)), 1), 160)
	const sure = shurikens[Math.floor(lvl/16)]
	return sure+lvl
}

const rankTitles="Newbie Beginner Novice Initiated Trained Competent Adept Skilled Proficient Advanced Expert Elite Champion Master Grandmaster Ninja".split(" ")
function mapToRankTitles(skill) {
	return 49500<=skill?rankTitles[rankTitles.length-1]:rankTitles[Math.floor(1/30*(Math.sqrt(6*skill+11025)-135))+1]
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
   getClanLeader
}
