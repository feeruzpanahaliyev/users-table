import {MongoClient, ServerApiVersion} from "mongodb";

const uri = process.env.MONGO_URI || "";

const client = new MongoClient(uri, {
    serverApi : {
        version: ServerApiVersion.v1, 
        strict: true,
        deprecationErrors: true,
    },
});

try {
    await Client.connect();
    await Client.db("admin").command({ping: 1});
    console.log("Pinged your deployment. You successfullly connected to MongoDB!");
} catch (err) {
    console.error(err);
}

let db = Client.db("9sers-db");

export default db;