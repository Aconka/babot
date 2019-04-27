var Discord = require('discord.js'); //discord stuff
var auth = require('./bauth.json'); //auth for discord

// Initialize Discord Bot
var bot = new Discord.Client();
var savedRoles = new Collection();

bot.login(auth.token); //login

//not sure what this does but it was in jeremy's code so
bot.on('ready', function (evt) 
{
    console.log('Connected');
});

//stuff when message is recived.
bot.on('message', message => 
{
    if(message.content.includes('@560872746087743528')) 
    {
      message.channel.send('BABA IS ADMIN');
    }
});

//stuff when a member is kicked/leaves
bot.on('guildMemberRemove', member=>
{
    savedRoles.set(member.id, member.roles);//add the roles of the guild member to a map with the guild member ID being the key
});

//stuff when a member joins
bot.on('guildMemberAdd', member =>
{
    if(savedRoles.has(member.id)){
        member.addRoles(savedRoles.get(member.id));
    }
    else
        console.log("no roles detected for new user");
});

//not sure what this does also but it was in jeremy's code so
var cleanupFn = function cleanup() 
{
    console.log("Logging off");
    bot.destroy();
}

process.on('SIGINT', cleanupFn);
process.on('SIGTERM', cleanupFn);
