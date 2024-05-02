const { MongoClient } = require('mongodb');
const fetch = require('node-fetch');

const url = 'mongodb://localhost:27017';
const db_name = 'ninjaio';
const collection_lb = 'leaderboard';

const mongo = new MongoClient(url);

const leaderboardCollection = mongo.db(db_name).collection(collection_lb);

const connectToDatabase = async () => {
    try {
        await mongo.connect();
        console.log(`Connected to the ${dbname} database.`);
    } catch (err) {
        console.log(`Error connecting to the database: ${err}`);
    }
};

const main = async () => {
    try {
        await connectToDatabase();
        let result = await leaderboardCollection.insertOne();
        console.log('Yay');
    } catch (err) {
        console.error(`Error: ${err}`)
    } finally {
        await client.close();
    }
}

// db structure for reference
const mockup = [
    {
        weaponName: 'rpg',
        weaponId: 8,
        currentTotalKills: 23115615,
        lastUpdated: new Date(),
        rankingsArchive: [
            {
                date: new Date(),
                totalKills: 23115615,
                rankings: [
                    { name: 'DarkMaster', accountId: 40008, kills: 54176 },
                    { name: 'Basil', accountId: 75701, kills: 35484 },
                    // etc
                ]
            },
            {
                date: new Date(),
                totalKills: 23115615,
                rankings: [
                    { name: 'DarkMaster', accountId: 40008, kills: 54176 },
                    { name: 'Basil', accountId: 75701, kills: 35484 },
                    // etc
                ]
            }
        ]
    }
]