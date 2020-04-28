let CONFIG = {};

CONFIG.localPort = 3000;
CONFIG.port = process.env.PORT || CONFIG.localPort;
CONFIG.publicDir = 'www';

module.exports = CONFIG;
