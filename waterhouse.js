const winston = require('winston');
const Discord = require('discord.io');
const whois = require('whois')
const auth=require('./auth.json');

const options = {
    file: {
        level: 'info',
        filename: `waterhouse-app.log`,
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: false,
    },
    console: {
        level: 'debug',
        handleExceptions: true,
        json: false,
        colorize: true,
    },
};

const logger = winston.createLogger({
    transports: [
        new winston.transports.File(options.file),
        new winston.transports.Console(options.console)
    ],
    exitOnError: false, // do not exit on handled exceptions
});

whois.lookup('google.com', function(err, data) {
    console.log(data)
})

// Initialize Discord Bot
var bot = new Discord.Client({
    token: auth.token,
    autorun: true
});

bot.on('ready', function() {
    console.log('Logged in as %s - %s\n', bot.username, bot.id);
});

bot.on('message', function(user, userID, channelID, message, event) {
        var msg = "".concat(user," : ",userID," : ",message);
        logger.info(msg);
        var msgset=message.split(" ");

        if(authz(user,userID) == "member"){
        switch(msgset[0])
         {
         case "!help":
                //code block
                bot.sendMessage({
            to: channelID,
            message: "*Welcome to waterhouse-bot 0.1*\n\
  sticker squad member\n\
  attempt number 3\n\
  _ _ __ _ __ _ __ _ __ _ __ _ __ _ __ _ __ _ __ _ __ _ __ _ __ _ __ _ __ _ __ _ __ _ __ _ _\n\
  **waterhouse utilities:**\n\
  **!ping** - test response time bot-to-server\n\
  **!showlog** [number]- show the last [number] of requests def: 20\n\
  **!scan-host** <hostname|ip>- initiate nmap 100 scan -> dbx\n\
  **!fetch-url** <url> - grab a url, and perform some simple recon -> dbx\n\
  **!fetch-cert** <host> [port]  - perform some simple recon -> dbx\n\
  **!store-flag** <flagname> <base64> - where you put flags\n\
  **!show-flag** <flagname> - returns the [base64] of the flag.\n\
  **!list-flags** - list stored flags.\n\
  **!whois** [hostname] - return the whois record for the hostname\n\
_ _ __ _ __ _ __ _ __ _ __ _ __ _ __ _ __ _ __ _ __ _ __ _ __ _ __ _ __ _ __ _ __ _ __ _ _"
        });
                break;
     case "!ping":
        sping(msgset[1],channelID);
        //code block
        break;
     case "!whois":
        //code block
        break;
    case "!nmap":
        nmap(msgset[1],channelID);
        break;
    case "!show-log":
        //code block
        showlog(msgset[1],channelID);
        break;
     case "!gcrack":
        //code block
        break;
     case "!fetch-pem":
        fetchpem(msgset[1],channelID);
        break;
     case "!fetch-url":
        fetchurl(msgset[1],channelID);
        //code block
        break;
     case "!fetch-cert":
        //code block
        fetchcn(msgset[1],channelID);
        break;
     case "!store-flag":
        //code block
        break;
     case "!pounce":
        //code block
        break;
     default:
        //code block
         }
        if (message[0] === "!fetch") {

        }
} else {
        if (msgset[0] == "!register"){
                sendmsg("registration request logged..",channelID);
        }
}
});


// -- Stuff below this line should really go in a library--

function sendmsg(msg,channelID,log=true){
    bot.sendMessage({
        to: channelID,
        message: msg
        });
        var msg=msg.split('`').join('');
        if (log == true){
                logger.info("".concat("sending:",msg));
        }
}

function authz(user, userID){
    var config = require('./auth.json');
    for (var i = 0; i < config.users.length; i++) {
        var u = config.users[i].name;
        var uID = config.users[i].userID;
        if(user === u && userID == uID){
            console.log("User %s matched auth table as an: %s\n",config.users[i].name,config.users[i].role);
            return config.users[i].role;
        }
    }
}
//console.log(authz("mycroft","329873307174305795"));

function sping(hostname,channelID){
    var templog="";
    var tcpp = require('tcp-ping');
    tcpp.ping({ address: hostname } , function(err, data) {
        //logger.info(data);
        //console.log(data.avg);
        var avgstr=(Math.round(data.avg * 10) / 10).toFixed(2);
        var maxstr=(Math.round(data.max * 10) / 10).toFixed(2);
        sendmsg("".concat("```ping of ",hostname," max:",String(maxstr),"ms,avg:",String(avgstr),"ms```"),channelID);
    });
}

function getlog(){
return new Promise(function(resolve, reject) {
var fs = require('fs');
fs.readFile('waterhouse-app.log', function(err, data) {
    if(err) throw err;
    var array = data.toString().split("\n");
        array = array;
    /*for(i in array) {
        console.log(array[i]);
    }*/
    resolve(array);
});
})
}

function showlog(count, channelID){
console.log("showlog begins");
getlog().then(function(array){
        if(array.length > count) {
                var len=array.length;
                var lowc=len-count;
                var smsg=array.slice((lowc-1),len);
                smsg.toString("\n");
                //console.log("your message length:",smsg.length);
                sendmsg("".concat('```',smsg,'```'),channelID,log=false);
        }
        else {
                var smsg=array.toString("\n");
                //console.log(smsg.length);
                sendmsg("".concat('```',smsg,'```'),channelID,log=false);
        }
}).catch(function(err){
        sendmsg("error reading logs...",channelID);
        sendmsg("err:",err.toString());
        console.log(err);
  // do something with the error
});
}

const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function nmap(hostname,channelID) {
    var cmd = "".concat('nmap -Pn --top-ports 99 -oX ',hostname,'.xml ',hostname);
  const { stdout, stderr } = await exec(cmd);
  console.log('stdout:', stdout);
  sendmsg("".concat('```',stdout,'```'),channelID,log=false);

}

async function fetchurl(url,channelID) {
        var cmd = "".concat('lynx --dump ',url,' | head -n25');
        const { stdout, stderr } = await exec(cmd);
        console.log('stdout:', stdout);
        sendmsg("".concat('```',stdout,'```'),channelID,log=false);
}

async function fetchpem(hostname,channelID) {
        var cmd = "".concat('echo -n | openssl s_client -connect ', hostname,":443 | sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p'");
        const { stdout, stderr } = await exec(cmd);
        console.log('stdout:', stdout);
        sendmsg("".concat('```',stdout,'```'),channelID,log=false);
}
async function fetchcn(hostname,channelID) {
        var cmd = "".concat("echo -n | openssl s_client -connect ", hostname,":443 | sed -ne '/-END CERTIFICATE-/,/Verification:/p'")
        const { stdout, stderr } = await exec(cmd);
        console.log('stdout:', stdout);
        sendmsg("".concat('```',stdout,'```'),channelID,log=false);
}

//console.log(nmap());
/*var lineReader = require('readline').createInterface({
  input: require('fs').createReadStream('waterhouse-app.log')
});
var lns=0;
var log=[];
lineReader.on('line', function (line) {
    log[lns]=line;
    lns++;
//    console.log("".concat(String(lns),":"), line);
});
*/
/*var strmsg=[];
    for (var i = 0; i < count; i++) {
        if (log.length < count) {
                console.log(log[i]);
                sendmsg(log[i],channelID);
        }else{
        strmsg+="".concat(log[log.length-(count-i)]);
        }
    }
    console.log(strmsg);
    sendmsg("".concat("length:",String(log.length)),channelID);
}
/*
bot.on('message', function (user, userID, channelID, message, event) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
        args = args.splice(1);
        switch(cmd) {
            // !ping
            case 'ping':
            break;
            // Just add any case commands if you want to..
         }
     }
});
*/

