const stats = require('../commands/stats');

let fetch;
import('node-fetch').then(module => {
    fetch = module.default;
});

// user_class.js
class user_class {
    // private variables
    #ID;
    #current_name;
    #status;
    #date_created;
    #date_last_seen;
    #socials_youtube = null;
    #socials_twitch = null;
    #customizations = {};
    #data = {};

    #level;
    #shuriken;
    #aura;
    #title;
    #top_weapon;
    #top_weapon_kills;
    current_epoch;

    // public variables
    change_available = false;



    constructor(ID, ID_type) {
        ID_type = ID_type.toLowerCase();

        // set and preliminary validation of the ID/name
        switch (ID_type) {
            case 'id':
                // verify that the ID is a number
                if (isNaN(ID)) {
                    throw new Error('ID NaN');
                } else {
                    this.#ID = ID;
                }
                break;
            case 'name':
                // verify that the ID 3-18 characters long
                if (ID.length < 3 || ID.length > 18) {
                    throw new Error('name length');
                } else {
                    this.#current_name = ID;
                }
                break;
            default:
                throw new Error('ID_type invalid');
        }

        this.#initialize_profile_data(ID_type);
    }

    async #initialize_profile_data(ID_type) {
        try {
            const raw_profile_data = await this.#get_profile_data(ID_type);
            if (raw_profile_data === 'badName') {
                throw new Error('name not found');
            } else if (raw_profile_data === 'invalid') {
                throw new Error('Non 500 or 200 status');
            }
            // parse the profile data
            this.#parse_profile_data(raw_profile_data);

            // once profile data is parsed, get weapon data
            this.#initialize_user_weapon_data();
        } catch (error) {
            console.error(error);
        }
    }

    async #get_profile_data(ID_type) {
        const url = (ID_type == 'name') ? `https://api2.ninja.io/user/profile/${this.#current_name}/view-name` : `https://api2.ninja.io/user/profile/${this.#ID}/view`;
        const response = await fetch(url);
        return response.status == 500 ? 'bad_name'  // name not found. ie slim application error
            : response.status != 200 ? 'invalid'    // all other errors
                : await response.json();
    }

    #parse_profile_data(raw_profile_data) {
        // set the private variables
        this.#ID = this.#ID || raw_profile_data['id'];                                  // set ID, once
        this.#current_name = raw_profile_data['name'];                                  // set name, always
        this.#status = raw_profile_data['status'];                                      // set status, always

        // parse the dates into epoch from UTC+1
        this.#date_last_seen = raw_profile_data['seen'];                                // set date last seen, always
        this.#date_last_seen = this.#date_last_seen.replace(' ', 'T') + '.000Z';        // convert to ISO string
        this.#date_last_seen = new Date(this.#date_last_seen).getTime() + 3600000;      // convert to epoch from UTC+1
        this.#date_created = this.#date_created || new Date(raw_profile_data['created'].replace(' ', 'T') + '.000Z').getTime() + 3600000; // set date created, once. condensed version of above 3 lines

        this.#customizations = raw_profile_data['customization'];                       // set customizations, always

        // extract youtube and twitch URLs from the social array
        const socials = raw_profile_data['social'] || [];
        socials.forEach(social => {
            if (social.type === 'youtube') {
                this.#socials_youtube = social.url;
            } else if (social.type === 'twitch') {
                this.#socials_twitch = social.url;
            }
        });

        // current date at run in epoch
        this.current_epoch = new Date().getTime();

        // save the profile data, indexed by epoch, and retaining prior data
        this.#data = {
            ...this.#data,
            [this.current_epoch]: {
                name: raw_profile_data['name'],
                kills: raw_profile_data['kills'],
                deaths: raw_profile_data['deaths'],
                caps: raw_profile_data['caps'],                     // flags captures
                experience: raw_profile_data['experience'],         // xp
                rating: raw_profile_data['rating'],                 // gecko 2 rating
                ranking: raw_profile_data['ranking'],               // level rank
                skill_ranking: raw_profile_data['skill_ranking'],   // skill rank
                clan_id: raw_profile_data['clan_id'],               // clan ID
                clan_name: raw_profile_data['clan_name'],           // clan name
                clan_role: raw_profile_data['clan_role'],           // clan role
            },
        }

        // data not worth saving long term
        this.#level = this.map_experience_to_level(raw_profile_data['experience']);
        this.#shuriken = this.map_level_to_shuriken(this.#level);
        this.#title = this.map_skill_to_rank_title(raw_profile_data['rating']);

    }


    async #initialize_user_weapon_data() {
        try {
            const raw_weapon_data = await this.get_user_weapon_stats(this.#ID);
            if (raw_weapon_data === 'invalid') {
                throw new Error('invalid weapon data');
            }
            this.#parse_weapon_data(raw_weapon_data);

            // change available
            this.change_available = true;
        } catch (error) {
            console.error(error);
        }
    }

    async get_user_weapon_stats(ID) {
        const url = `https://api2.ninja.io/user/${this.#ID}/weapon-stats`;
        const response = await fetch(url);
        return response.status == 500 ? 'bad_name'  // name not found. ie slim application error
            : response.status != 200 ? 'invalid'    // all other errors
                : await response.json();
    }

    #weapons_dict = {
        '-1': 'Fists',
        '1': 'Shotgun',
        '2': 'SMG',
        '3': 'M79',
        '4': 'Barrett',
        '5': 'Shock Rifle',
        '6': 'Pulse Gun',
        '7': 'Flamer',
        '8': 'RPG',
        '9': 'Rifle',
        '10': 'Lasergun',
        '12': 'AK-47',
        '20': 'Hand Grenade',
        '21': 'Cluster Grenade',
        '23': 'Shuriken',
        '24': 'Deagles',
        '25': 'Snowballs',
        '26': 'Minigun',
        '27': 'X75',
        '28': 'MAC-10',
        '29': 'Bow',
        '30': 'Avenger',
        '31': 'Carbine',
        '204': 'Chainsaw',
        '213': 'Link Gun',
        '33': 'Boomerang',
        '35': 'Uzi',
        '34': 'M60'
    }

    #parse_weapon_data(raw_weapon_data) {

        // create a dictionary with the weapon id as the key and the number of kills as the value, the info is formatted like
        // [{id: 1, kills: 100}, {id: 2, kills: 200}, ...]
        const weapon_stats = {
            '-1': 0,
            '1': 0,
            '2': 0,
            '3': 0,
            '4': 0,
            '5': 0,
            '6': 0,
            '7': 0,
            '8': 0,
            '9': 0,
            '10': 0,
            '12': 0,
            '20': 0,
            '21': 0,
            '23': 0,
            '24': 0,
            '25': 0,
            '26': 0,
            '27': 0,
            '28': 0,
            '29': 0,
            '30': 0,
            '31': 0,
            '33': 0,
            '35': 0,
            '34': 0,
            '204': 0,
            '213': 0
        };
        raw_weapon_data.forEach(weapon => {
            weapon_stats[weapon['id']] = weapon['kills'];
        });


        // adds the weapon_dict to the data object
        this.#data = {
            ...this.#data,
            [this.current_epoch]: {
                ...this.#data[this.current_epoch],
                weapons: weapon_stats
            }
        }

        this.#top_weapon = 0;
        this.#top_weapon_kills = 0;
        // iterate through the weapon_stats object and find the weapon with the most kills
        for (const [key, value] of Object.entries(weapon_stats)) {
            if (value > this.#top_weapon_kills) {
                this.#top_weapon = key;
                this.#top_weapon_kills = value;
            }
        }
    }


    /**
     * Returns the level from experience
     * @param {int} experience
     * @returns {int} level
     */
    map_experience_to_level(experience) {
        const level = Math.min(Math.max(Math.floor(.2 * Math.sqrt(experience / 15.625)), 1), 240);
        return level;
    }

    /**
     * Returns the corresponding shuriken for the level
     * @param {int} level 
     * @returns current shuriken
     */
    map_level_to_shuriken(level) {
        const shurikens = "<:GreyShuriken:834903789810745404> <:GreyStarShuriken:834903789836173382> <:RedShuriken:834903789706149929> <:RedStarShuriken:834903789621215302> <:OrangeShuriken:834903789428539490> <:OrangeStarShuriken:834903789668270140> <:YellowShuriken:834903789223673868> <:YellowStarShuriken:834903789751369728> <:GreenShuriken:834903789659095100> <:GreenStarShuriken:834903789604438056> <:BlueShuriken:834903789131530291> <:BlueShuriken:834903789131530291> <:BlueStarShuriken:1063127625536639028> <:PurpleShuriken:834903789156171787> <:PurpleStarShuriken:834903789265747969> <:PinkShuriken:834903789601161256> <:PinkStarShuriken:834903789600899092>".split(" ")
        return shurikens[Math.floor(level / 16)];
    }

    map_skill_to_rank_title(skill) {
        const rankTitles = "Newbie Novice Rookie Beginner Initiated Competent Adept Skilled Proficient Advanced Expert Elite Champion Master Grandmaster Ninja".split(" ")
        let b;
        500 <= skill && 650 > skill ? b = 1 : 650 <= skill && 800 > skill ? b = 2 : 800 <= skill && 1001 > skill ? b = 3 : 1001 <= skill && 1100 > skill ? b = 4 : 1100 <= skill && 1200 > skill ? b = 5 : 1200 <= skill && 1300 > skill ? b = 6 : 1300 <= skill && 1400 > skill ? b = 7 : 1400 <= skill && 1500 > skill ? b = 8 : 1500 <= skill && 1600 > skill ? b = 9 : 1600 <= skill && 1700 > skill ? b = 10 : 1700 <= skill && 1800 > skill ? b = 11 : 1800 <= skill && 1900 > skill ? b = 12 : 1900 <= skill && 2E3 > skill ? b = 13 : 2E3 <= skill && 2100 > skill ? b = 14 : 2100 <= skill && (b = 15);
        return rankTitles[b];
    }

    comma_format(number) {
        return new Intl.NumberFormat().format(number);
    }

    /**
     * Returns the formatted printout of the user's profile
     * @param {} 
     * @returns formatted_data
     */
    print_profile() {
        // in this.#data find the most recent epoch key
        const most_recent_epoch = Object.keys(this.#data).reduce((a, b) => Math.max(a, b), 0);
        const clan_info = this.#data[most_recent_epoch]['clan_id'] ? `${this.#data[most_recent_epoch]['clan_role']} of ${this.#data[most_recent_epoch]['clan_name']}(${this.#data[most_recent_epoch]['clan_id']})\n` : 'Freelancer\n';
        const formatted_data =
            "**Name:** `" + this.#current_name + "`\n" +
            "**ID:** " + this.#ID + "\n" +
            "**Status:** " + this.#status + "\n" +
            "**Level:** " + this.#shuriken + this.#level + "\n" +
            "**Exp:** " + this.comma_format(this.#data[most_recent_epoch]['experience']) + "\n" +
            "**Level Rank:** " + this.comma_format(this.#data[most_recent_epoch]['ranking']) + "\n" +
            "**Kills:** " + this.comma_format(this.#data[most_recent_epoch]['kills']) + "\n" +
            "**Deaths:** " + this.comma_format(this.#data[most_recent_epoch]['deaths']) + "\n" +
            "**K/D Ratio:** " + (Math.round(1000 * (parseInt(this.#data[most_recent_epoch]['kills']) / parseInt(this.#data[most_recent_epoch]['deaths']))) / 1000 || 0) + "\n" +
            "**Flag Captures:** " + this.comma_format(this.#data[most_recent_epoch]['caps']) + "\n" +
            "**Title:** " + this.#title + "\n" +
            "**Skill Points:** " + this.comma_format(this.#data[most_recent_epoch]['skill']) + "\n" +
            "**Skill Rank:** " + this.comma_format(this.#data[most_recent_epoch]['skill_ranking']) + "\n" +
            "**Top Weapon:** " + this.#weapons_dict[this.#top_weapon] + " - " + this.comma_format(this.#top_weapon_kills) + " kills\n" +
            "Created on <t:" + (this.#date_created / 1000) + ":D>\n" +
            "Last seen <t:" + (this.#date_last_seen / 1000) + ":R>\n" +
            clan_info;
        return formatted_data;
    }

}

module.exports = user_class;