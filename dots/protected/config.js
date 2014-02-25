/**
 * Chilly Config
 */
module.exports = {
    /**
     * Core config
     */
    core: {
        httpStaticCache: 24*60*60*1000, // cache static files for one day
        port: 3000, // run server on port 3000
        debug: false, // enable debug mode
        sessionSecret: 'VxbfIsdxxuxvl2NqWh01', // choose a random string
        clientTimeout: 0.15*60*1000, // if no requests were made in the last 2 minutes, consider the client dropped
        garbageCollectorInterval: 0.15*60*1000 // remove inactive clients every 2 mins
    },
    /**
     * Game config
     */
    game: {
    }
};