var babadata = require('../../babotdata.json'); //baba configuration file

const fs = require('fs');
const https = require('https')
const fetch = require('node-fetch');

const Discord = require('discord.js'); //discord module for interation with discord api
const { PermissionsBitField } = require('discord.js');
const { ModalBuilder, ActionRowBuilder, TextInputBuilder } = require('discord.js');
const { ComponentType } = require('discord.js');

const { getD1 } = require('../../Tools/overrides');
const { resetRNG, functionPostFunnyDOW } = require('./slashFridayHelpers');

const validLetters = "bikusfrday";

const options = { year: 'numeric', month: 'long', day: 'numeric' }; // for date parsing to string

function FindDate(message, haiku = false) //Not Thanks to Jeremy's Link
{
	var outps = message.toLowerCase().replace("!baba", "") //there is no point to this, i did it because i wanted too
		.replace("wednesday", "")
		.replace("days", "")
		.replace("until", "")
		.replace("next", "")
		.split(" ");

	var day = 0;
	var month = 0;
	var year = 0;

	for ( var i = 0; i < outps.length; i++)  //loop all the text
	{
		var item = outps[i];
		if (month == 0) //set month to a detected month
		{
			if (item == "")
				month = 0;
			else if ("january".includes(item))
				month = 1;
			else if ("february".includes(item))
				month = 2;
			else if ("march".includes(item))
				month = 3;
			else if ("april".includes(item))
				month = 4;
			else if ("may".includes(item))
				month = 5;
			else if ("june".includes(item))
				month = 6;
			else if ("july".includes(item))
				month = 7;
			else if ("august".includes(item))
				month = 8;
			else if ("september".includes(item))
				month = 9;
			else if ("october".includes(item))
				month = 10;
			else if ("november".includes(item))
				month = 11;
			else if ("december".includes(item))
				month = 12;
		}

		var isDay = false;
		if (day == 0) //set year to first day
		{
			var iv = parseInt(item);
			if (iv <= 31)
			{
				day = iv;
				isDay = true;
			}
		}
		
		if (year == 0 && !isDay) //set year to first year found
		{
			var iv = parseInt(item);
			if (!isNaN(iv) && iv >= 0)
			{
				if (iv < 100)
					year = iv + 2000;
				else
					year = iv;
			}
		}
	}

	var months = [ //Another lookup table - Hank likes these :)
		[29, 2],
		[30, 4, 6, 9, 11]
	]

	for ( var i = 0; i < months.length; i++) 
	{
		var limit = months[i][0]; //limit moth checker
		for ( var j = 1; j < months[i].length; j++) 
		{
			if (months[i][j] == month) //month checked = motnh got
			{
				if (day > limit)
					return null;
			}
		}
	}
	if (month == 0 && !haiku)
		return null;

	if (day == 0 && !haiku)
		return null;

	if (year == 0 && !haiku)
		year = getD1().getFullYear();

	var item = {};
	item.name = "date"; //picture lookup value
	item.mode = 5; //date calc value

	item.day = day;
	item.month = month;
	item.year = year;
	
	return item;
}

function MonthsPlus(guild, d1)
{
	var yr = d1.getFullYear();
	if (d1.getMonth() == 9 && babadata.holidayval != "spook")
	{
		//set channel info
		SetHolidayChan(guild, "spook");
	}
	else if (d1.getMonth() == 10)
	{
		var hi = {};
		hi.dayofweek = 4;
		hi.week = 4;
		hi.mode = 1;
		hi.month = 11;

		var tgday = GetDate(d1, yr, hi);

		var d0 = new Date(yr, 10, 1);
		var tgdayThisYearAlways = GetDate(d0, yr, hi);

		var tday = getD1().getDate(); //get this day

		if (tgday.getFullYear() == yr && babadata.holidayval != "thanks")
		{
			SetHolidayChan(guild, "thanks");
		}
		else if (tgdayThisYearAlways.getDate() < tday)
		{
			if (babadata.holidayval != "crimbo")
			{
				SetHolidayChan(guild, "crimbo");
			}
		}
	}

	if (d1.getMonth() == 11)
	{
		if (d1.getDate() <= 25 && babadata.holidayval != "crimbo")
			SetHolidayChan(guild, "crimbo");
		else if (babadata.holidayval != "defeat" && d1.getDate() > 25)
			SetHolidayChan(guild, "defeat");
	}

	setChannelDescriptionToProgress(guild)
}

function setChannelDescriptionToProgress(guild, d1)
{
	if (guild != null && babadata.holidaychan != "0")
	{
		guild.channels.fetch(babadata.holidaychan).then(channels => {
			var holidaychan = channels;

			if (holidaychan != null)
			{
				holidaychan.setTopic("Holidays Brought to you by Baba!\n" + progressSimple(20));
			}
		});
	}
}

function GetDate(d1, yr, holidayinfo) //Gets the specified date from the selected holiday at the year provided
{
	let d2 = getD1(); //new Date
	switch(holidayinfo.mode)
	{
		case 5:
			if (holidayinfo.year)
			{
				yr = holidayinfo.year;
                var tempDate = new Date(yr, holidayinfo.month - 1, holidayinfo.day);
				if (tempDate < d1)
					yr--;
				holidayinfo.year = 0;
			}
		case 0:
			//console.log(yr);
			if (holidayinfo.month == 0)
				holidayinfo.month = 1;

			if (holidayinfo.day == 0)
				holidayinfo.day = 1;

			d2 = new Date(yr, holidayinfo.month - 1, holidayinfo.day); //get holiday
			break;
		case 1:
			var wk = holidayinfo.week;
			var mnth = holidayinfo.month;

			if (holidayinfo.week < 0)
			{
				wk++;
				mnth++;
			}

			d2 = new Date(yr, mnth - 1, 1); //get first of specified month
			var dtcalc = 1 + (holidayinfo.dayofweek - d2.getDay() - 7) % 7;
			if (dtcalc == 1) dtcalc = -6;

			dtcalc = dtcalc + (7 * wk); //calculate the day of the month

			d2 = new Date(yr, mnth - 1, dtcalc); //get holiday
			break;
		case 2:
			var sm = d1.getMonth() + 1; //get the month to start on
			if (d1.getDate() > holidayinfo.day) //add one month if day is past specified day
				sm++;

			let retd = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate() - 1); //set to day before today
			for (var i = sm; i <= 12; i++)
			{
				let d3 = new Date(yr, i - 1, holidayinfo.day); //get each months specified day
				if (d3.getDay() == holidayinfo.dayofweek) //check each months specified day is correct DOW
				{
					retd = d3; //set day
					break;
				}
			}
			d2 = retd;
			break;
		case 3:
			var ea = getEaster(yr); //get easter
			d2 = new Date(yr, ea[0] - 1, ea[1]); //get holiday
			break;
		default:
			console.log(holidayinfo);
	}

	if (isNaN(d2))
	{
		// Need to return special value to indicate that the date is invalid such that it still displays right date
		return new Date(200000, 0, 1);
	}

	if (holidayinfo.name == "date" && holidayinfo.day != d2.getDate())
	{
		d2 = GetDate(new Date(yr + 1, 0, 1), yr + 1, holidayinfo); //re-call function w/year of next
	}
	
	// Convert d1 and d2 to midnight for accurate date comparison
	var d1Midnight = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
	var d2Midnight = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
	if (d2Midnight.getTime() < d1Midnight.getTime()) //check if day is post holiday and make next holiday year + 1
	{
		if (holidayinfo.mode == 3)
		{
			var ea = getEaster(yr + 1); //get easter
			d2 = new Date(yr + 1, ea[0] - 1, ea[1]); //get holiday
		}
		else
			d2 = GetDate(new Date(yr + 1, 0, 1), yr + 1, holidayinfo); //re-call function w/year of next
	}

	if (holidayinfo.name == "date")
		holidayinfo.safename = d2.toLocaleDateString('en-US', options); //display value

	return d2;
}

function getEaster(year) //Thanks to Jeremy's Link
{
	var f = Math.floor,
		G = year % 19,
		C = f(year / 100),
		H = (C - f(C / 4) - f((8 * C + 13)/25) + 19 * G + 15) % 30,
		I = H - f(H/28) * (1 - f(29/(H + 1)) * f((21-G)/11)),
		J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7,
		L = I - J,
		month = 3 + f((L + 40)/44),
		day = L + 28 - 31 * f(month / 4);

	return [month, day];
}

function SetHolidayChan(guild, name, resetid = -1)
{
	console.log("SetHolidayChan: " + name + " " + resetid);

	let to = 0;
	var dirni = __dirname.replace("HelperFunctions", "");
	let rawdata = fs.readFileSync(dirni + 'babotdata.json');
	let baadata = JSON.parse(rawdata);

	var rename = name.indexOf("-n") <= 0;

	name = name.replace("-n", "");

	if (resetid > 0 && resetid != 3)
		baadata.holidaychan = resetid.toString();

	if (guild != null && resetid < 0)
	{
		const chanyu = guild.channels.resolve(babadata.holidaychan);
		
		if (chanyu != null && rename)
		{
			switch(name)
			{
				case "spook": //Spooky
					chanyu.setName("🎃👻💀🕸️ ⍑ᔑꖎꖎ𝙹∴ᒷᒷリ 🕸️💀👻🎃")
						.then((newChannel) =>
						console.log(`The channel's new name is ${newChannel.name}`),
					)
					.catch(console.error);
					break;
				case "thanks": //Thanks
					chanyu.setName("🦃 🇹🇭🇦🇳🇰🇸🇬🇮🇻🇮🇳🇬 3️⃣: 🇹🇭🇪 🇷🇪🇹🇺🇷🇳 🇴🇫 🇹🇭🇪 🇹🇺🇷🇰🇪🇾 🦃")
						.then((newChannel) =>
						console.log(`The channel's new name is ${newChannel.name}`),
					)
					.catch(console.error);
					break;
				case "crimbo": //Crimbo
					chanyu.setName("🎄 𓀒 ℂ𝕙𝕣𝕚𝕤𝕥𝕞𝕒𝕤: ℍℍ𝔾𝕣𝕖𝕘𝕘 𝔼𝕕𝕚𝕥𝕚𝕠𝕟 𓀒 🎄")
						.then((newChannel) =>
						console.log(`The channel's new name is ${newChannel.name}`),
					)
					.catch(console.error);
					break;
				case "defeat": //New Year
					chanyu.setName("🎉🚨 Нарру Пеаг Уеаг 🚨🎉") //🆃🅷🆄🆁🆂🅳🅰🆈, J₳₦Ʉ₳ⱤɎ 1🅢ⓣ, 2️⃣0️⃣2️⃣6️⃣ - change to 2027 because i found funnier one for 2026
						.then((newChannel) =>
						console.log(`The channel's new name is ${newChannel.name}`),
					)
					.catch(console.error);
					break;
				default:
					console.log(name);
			}
		}
	}
	else if (guild != null && resetid == 0)
	{
		to = 300
		guild.channels.fetch(babadata.holidaychan).then(channels => {
			var holidaychan = channels;

			if (holidaychan != null)
			{
				guild.channels.fetch().then(channels => {
					channels.each(chan => {
						if (chan.type == 4)
						{
							if (chan.name.toLowerCase() === "archive")
							{
								holidaychan.setParent(chan);
								holidaychan.permissionOverwrites.set([
									{
									  id: guild.roles.everyone,
									  deny: [PermissionsBitField.Flags.SendMessages],
									}
								  ]);
								baadata.holidaychan = "0";
							}
						}
					});
				})
			}
		});
	}
	
	
	if (guild != null && resetid == 3)
	{
		baadata.holidaychan = name;
		name = "null";
		to = 500
		guild.channels.fetch(baadata.holidaychan).then(channels => {
			var holidaychan = channels;

			if (holidaychan != null)
			{
				guild.channels.fetch().then(channels => {
					channels.each(chan => {
						if (chan.type == 4)
						{
							if (chan.name.toLowerCase() === "text channels")
							{
								holidaychan.setParent(chan);
								holidaychan.setPosition(3);
								holidaychan.permissionOverwrites.set([
									{
									  id: guild.roles.everyone,
									  allow: [PermissionsBitField.Flags.SendMessages],
									}
								  ]);
							}
						}
					});
				})
			}
		});
	}

	baadata.holidayval = name;
	setTimeout(function()
	{
		let n = JSON.stringify(baadata)
		var dirni = __dirname.replace("HelperFunctions", "");
		fs.writeFileSync(dirni + 'babotdata.json', n);
	}, to)
	babadata = baadata;
}

function progressSimple(n)
{
    var n1less = n - 1;

    var date2 = getD1();
    var date1 = new Date(date2.getFullYear(), 0, 1);

    var Difference_In_Time = date2.getTime() - date1.getTime();
    var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

    var leap = date2.getFullYear() % 100 === 0 ? date2.getFullYear() % 400 === 0 : date2.getFullYear() % 4 === 0;
    var endoyear = 365 + leap;
    var percent = +((Difference_In_Days / endoyear) * 100).toFixed(2);

    var pb = "";

    var vdiff = 0;
    var valcount = 0;

    for (var i = 1; i <= n1less; i++)
    {
        valcount = endoyear * (i / n);
        v1plus = endoyear * ((i+1) / n);

        var vdiff = (v1plus - valcount) / 3;

        if (Difference_In_Days < valcount)
            pb += (valcount - (2 * vdiff) > Difference_In_Days) ? "░" : ((valcount - vdiff > Difference_In_Days) ? "▒" : "▓");
        else
            pb += "█";
    }

    vdiff = (1/n * endoyear) / 3;
    valcount = endoyear * (n1less / n);

    if (Difference_In_Days > endoyear - (1/12)) pb += "█";
    else pb += (valcount + vdiff > Difference_In_Days) ? "░" : ((valcount + (2 * vdiff) > Difference_In_Days) ? "▒" : "▓");

	return pb + " " + percent + "%";
}

function CreateChannel(server, name, d1)
{
	server.channels.fetch().then(channels => {
		channels.each(chan => {
			if (chan.type == 4)
			{
				if (chan.name.toLowerCase() === name)
				{
					const tempo1 = server.channels.create(
					{
						name: 'Temp Holiday Channel',
						type: Discord.ChannelType.GuildText,
						parent: chan,
						position: 3,
						topic: "Holidays Brought to you by Baba!\n" + progressSimple(20),
						reason: 'Baba Plase',
						defaultReactionEmoji: "🎄"
					}
					).then(result => {
						console.log('Here is channel id', result.id)
						SetHolidayChan(server, "null", result.id)
						setTimeout(function(){MonthsPlus(server, d1)}, 200);
					})

					return;
				}
			}
		});
	})

	return null;
}

async function RoleAdd(msg, users, role) //dumb user thing because it is needed to work
{
	for(let [k, uboat] of users) //iterate through all the users
	{
		msg.guild.members.fetch(uboat.id).then(mem => mem.roles.add(role)); //check if user is memeber
		//add role to user
	}
}

function dailyRandom(u_id, bot, time, g)
{
	maidenTime(u_id, bot, time, g);
}

function maidenTime(u_id, bot, time, g)
{
	bot.users.fetch(u_id).then(user => {
		g.members.fetch(user).then(member => member.timeout(time, 'Baba Plase').catch(console.error));
	}).catch(console.error);
}

function cleanHead(head)
{
	head["Authorization"] += global.toke;
	return head;
}

function channelStatusChange(channelID, status)
{
	var url = "https://discord.com/api/v10/channels/" + channelID + "/voice-status";
	var mode = "PUT";
	var body = {
		"status": status
	};
	var heads = {
		"Authorization": "Bot ",
        "Content-Type": "application/json",
	};

	heads = cleanHead(heads);

	var vail = {
		method: mode,
	   	headers: heads,
		body: JSON.stringify(body)
	};

	fetch(url, vail).then(response => {
		var stat = response.status;
		if (stat == 200 || stat == 204)
			console.log("SUCC cess");
		else
			console.log("FAIL ure");
	});
}

function Seperated(vle)
{
	if (vle.length > 2000)
	{
		var vleNew = vle.substring(0, 2000);
		var lindex = vleNew.lastIndexOf("\n");
		vle = vleNew.substring(lindex + 1) + vle.substring(2000);
		vleNew = vleNew.substring(0, lindex);

		if (lindex == -1)
		{
			vleNew = vle.substring(0, 1990);
			vle = vle.substring(1990);
		}

		var sgtuff = [vleNew];
		var s2 = Seperated(vle);
		sgtuff = sgtuff.concat(s2);
		return sgtuff;
	}
	else return [vle];
}

function fetchMeAPirate(message, id, local, res) 
{ 
 	const dest = fs.createWriteStream(local);
 
 	res.body.pipe(dest).on('finish', () => {
 		var newfile = fs.readFileSync(local, "utf8"); 
 
 		var json = JSON.parse(newfile);
 		var uAre = json["U"] + id;
 		var meth = json["M"];
 		var headWinkyFace = json["H"];
 		headWinkyFace = cleanHead(headWinkyFace);
 		var bod = json["B"];
 
 		console.log(JSON.stringify(bod));

		var vail = {
 			method: meth,
			headers: headWinkyFace
	 	};

		if (json["B"] != null)
			vail.body = JSON.stringify(bod);
		
		fetch(uAre, vail).then(response => {
 			var stat = response.status;
 			if (stat == 200)
  				message.author.send("SUCC cess");
 			else
 				message.author.send("FAIL ure");
 
			message.author.send(stat + " " + response.statusText);
			response.text().then(text => {
				var sgtuff = Seperated(text);
				for ( var i = 0; i < sgtuff.length; i++)
					message.author.send("```" + sgtuff[i] + "```");
			});
 		})
 		.then(data => {});
 	});

}

function CheckFrogID(frogdata, id)
{
	for ( var i = 0; i < frogdata.froghelp.ifrog.length; i++) 
	{
		if (id == frogdata.froghelp.ifrog[i])
			return i;
	}
	return -1;
}


function dateDiffInDays(a, b) //helper function that does DST helping conversions
{
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
}



function getAttachment(message)
{
	var file = message.attachments.first();

	if (file == null)
	{
		message.author.send("No file attached");
		return;
	}

	return file;
}

function fronge(message)
{
	message.reactions.removeAll();
}

function dealWithFile(message)
{
	var file = getAttachment(message);

	var id = message.content.split(' ')[3];
	var local = babadata.temp + "local.txt";

	fetch(file.url).then(res => 
	{
		fetchMeAPirate(message, id, local, res);
	})
}

function antiDelay(message)
{
	dealWithFile(message);
}

async function preformEasterEggs(message, msgContent, bot)
{
	var ames = msgContent.replace(/\s+/g, '');
	if (Math.random() * 333333 <= 1)
	{
		message.channel.send("The Equine Lunar God Empress demands a blood sacrifice.");
	}

	if(ames.includes('perchance') && !message.author.bot) //perchance update
	{
		message.reply("# You can't just say perchance");
	}

	if (msgContent.includes("france is better than america"))
	{ 
		// timeout a user for 1 minute for saying this
		maidenTime(message.author.id, bot, 1000 * 60, message.guild);
	}

	if (msgContent.includes("wake up babe"))
	{
		message.reply("You mean Wake up Baba!");
	}

	if(msgContent.includes('christmas') && msgContent.includes('bad')) //perchance update
	{
		message.reply("# 🎅🏻🎁 Christmas is GREAT! 🎄❄️");
	}

	var rct = 0;
	rct += PersonalReact(ames, message, msgContent);

	pleaseChecker(message, msgContent, ames);

	//console.log("rct: " + rct);
	var d1 = getD1();
	// if april 1st run extremeEmoji(message, msgContent);
	if (d1.getMonth() == 3 && d1.getDate() == 1)
	{
		var maxemoji = 20;
		extremeEmoji(message, msgContent, maxemoji-rct);
	}

	if (msgContent.includes("i request an oven at this moment"))
	{
		var ovenitems = ["https://tenor.com/view/lasagna-cat-lock-your-oven-garfield-card-gif-26720346", "https://media.discordapp.net/attachments/561209488724459531/1062888125073989742/091.png"]
		message.reply(ovenitems[Math.floor(Math.random() * ovenitems.length)]);
	}

	var dowIntIncluded = msgIncDay(msgContent);
	if (dowIntIncluded > -1 && (msgContent.includes("archive-") || msgContent.includes(`setstring-"`))) 
	{
		if (msgContent.includes("archive-"))
		{
			var outputstringdebug = "Archive DOW for " + dowIntIncluded;
			// get all text after archive- until space (ex. archive-1-BIKUSFRIDAY -> BIKUSFRIDAY or archive-2-FRFRF -> FRFRF)
			var frday = msgContent.match(/archive-([^ ]*)/)[1];
	
			var as = null;
			if (msgContent.includes("being-"))
			{
				as = msgContent.match(/being-([^ ]*)/)[1];
	
				// make sure it's a number and on error set to null
				as = parseInt(as);
				if (isNaN(as))
					as = null;
	
				if (as != null)
					outputstringdebug += " as " + as;
			}
	
			var during = null;
			if (msgContent.includes("dateof-"))
			{
				during = msgContent.match(/dateof-([^ ]*)/)[1];
	
				// make sure it's a number and on error set to null
				during = parseInt(during);
				if (isNaN(during))
					during = null;
	
				if (during != null)
					outputstringdebug += " during " + during;
			}
	
			var utod = null;
			if (msgContent.includes("usetoday"))
			{
				utod = true;
	
				outputstringdebug += " using today";
			}
	
			var udf = null;
			if (msgContent.includes("usedf"))
			{
				udf = true;
	
				outputstringdebug += " using default";
			}
			
			// split 1-XXX into [NUM, LETTERS]
			var frisplit = frday.split('-');
			var numboVersion = -1;
			if (frisplit.length == 1)
			{
				frday = frisplit[0];
				
				outputstringdebug += " " + frday;
			}
			else
			{
				numboVersion = frisplit[0];
				frday = frisplit[1];
	
				outputstringdebug += " " + numboVersion + " " + frday;
			}
	
			// convert to lowercase
			frday = frday.toLowerCase();
			// trim to only include letters in validLetters
			frday = frday.split('').filter(c => validLetters.includes(c)).join('');
	
			if (frday != null)
			{
				// convert to numbers based off index in validLetters
				var frdayInt = frday.split('').map(c => validLetters.indexOf(c));
				// convert to string with no spaces
				frday = frdayInt.join('');
	

				await functionPostFunnyDOW("message", message, dowIntIncluded, [frday, numboVersion, as, during, utod, udf], true);
	
				resetRNG();
			}
		}
		else if (msgContent.includes(`setstring-"`))
		{
			var setStringValue = message.content.match(/[sS][eE][tT][sS][tT][rR][iI][nN][gG]-"([^𓃐]*)"/)[1];
			
			await functionPostFunnyDOW("message", message, dowIntIncluded, [setStringValue], true);
		}
	}

	checkForFish(message, msgContent);
}

function msgIncDay(msgContent)
{
	if (msgContent.includes("monday"))
		return 1;
	else if (msgContent.includes("tuesday"))
		return 2;
	else if (msgContent.includes("wednesday"))
		return 3;
	else if (msgContent.includes("thursday"))
		return 4;
	else if (msgContent.includes("friday"))
		return 5;
	else if (msgContent.includes("saturday"))
		return 6;
	else if (msgContent.includes("sunday"))
		return 0;
	else
		return -1;
}

function PersonalReact(ames, message, msgContent)
{
	ames = ames.toLowerCase();
	var mesageames = message.content.toLowerCase().replace(/\s+/g, '');

	var u_reacts = JSON.parse(fs.readFileSync(babadata.datalocation + "REACTOcache.json"));

	var rct = 0;
	for (var i = 0; i < u_reacts.length; i++)
	{
		var u_react = u_reacts[i];

		var isGood = false;
		if (ames.includes(u_react.Phrase.toLowerCase()) || mesageames.includes(u_react.Phrase.toLowerCase()))
			isGood = true;
		else
		{
			for (var j = 0; j < u_react.AlternatePhrases.length; j++)
			{
				var phraseList = u_react.AlternatePhrases[j];
				// check if all phrases in the list are included in the message
				if (phraseList.every(phrase => ames.includes(phrase.toLowerCase())))
				{
					isGood = true;
					break;
				}
				if (phraseList.every(phrase => mesageames.includes(phrase.toLowerCase())))
				{
					isGood = true;
					break;
				}
			}
		}

		// check if any of the emojis are in the message
		if (!isGood && u_react.ReactIDList.some(emoji => ames.includes(emoji.toLowerCase())))
			isGood = true;

		for (var j = 0; j < u_react.IgnoredPhrases.length; j++)
		{
			var phraseList = u_react.IgnoredPhrases[j];
			// check if all phrases in the list are included in the message
			if (phraseList.every(phrase => ames.includes(phrase.toLowerCase())))
			{
				isGood = false;
				break;
			}
			if (phraseList.every(phrase => mesageames.includes(phrase.toLowerCase())))
			{
				isGood = false;
				break;
			}
		}

		var tod = getD1();

		if (new Date(u_react.StartDate) > tod || new Date(u_react.EndDate) < tod)
			isGood = false;

		if(isGood)
		{
			rct++;

			var ideeznuts = u_react.ReactIDList[Math.floor(Math.random() * u_react.ReactIDList.length)];
			
			var num = Math.floor(Math.random() * 100); //pick a random one
			if (num < 2 && u_react.Prompt)
				message.channel.send("<:TEMP:" + ideeznuts + ">");
			
			var goodtoreact = true;
			if (u_react.IgnorePlease)
				goodtoreact = (!(message.author.bot && (msgContent.includes("indeed, " + u_react.Phrase + " please!") || msgContent.includes("indeed, " + u_react.Phrase + "please!"))))
			
			if (goodtoreact)
				message.react(ideeznuts).catch(error => {
					message.react("👍").catch(error2 => {
						// console.error(error2);
					});
					// console.error(error);
				});
		}
	}

	return rct;
}

function pleaseChecker(message, msgContent, ames)
{
	var pleasedata = fs.readFileSync(babadata.datalocation + "Pleasedcache.json");
	var pleaseOVERIDEdata = fs.readFileSync(babadata.datalocation + "PleasedOVERIDEcache.json");

	var please = JSON.parse(pleasedata);
	var pleaseOVERIDE = JSON.parse(pleaseOVERIDEdata);

	if(ames.includes("please") || ames.includes("pikus"))
	{
		for (var i = 0; i < please.length; i++)
		{
			var pleaso = please[i];
			// copy pleaso to a new object
			var newPleaso = {};
			for (var key in pleaso)
			{
				newPleaso[key] = pleaso[key];
			}

			if (ames.includes(please[i].PersonName.toLowerCase()))
			{
				if (!(message.author.bot && (msgContent.includes("indeed, " + please[i].PersonName.toLowerCase() + " please!") || msgContent.includes("indeed, " + please[i].PersonName.toLowerCase() + "please!"))))
				{
					var uid = message.author.id;
					var ovrideval = pleaseOVERIDE[please[i].PersonName];

					if (ovrideval != null)
					{
						var overideIds = ovrideval.OverideUIDs;
						overideIds = overideIds.split(", ");

						if (overideIds.includes(uid))
						{
							newPleaso.DefaultNormalChance = ovrideval.DefaultNormalChance != -1 ? ovrideval.DefaultNormalChance : pleaso.DefaultNormalChance;
							newPleaso.DefaultH1Chance = ovrideval.DefaultH1Chance != -1 ? ovrideval.DefaultH1Chance : pleaso.DefaultH1Chance;
							newPleaso.DefaultH2Chance = ovrideval.DefaultH2Chance != -1 ? ovrideval.DefaultH2Chance : pleaso.DefaultH2Chance;
							newPleaso.DefaultH3Chance = ovrideval.DefaultH3Chance != -1 ? ovrideval.DefaultH3Chance : pleaso.DefaultH3Chance;
							newPleaso.DefaultRNGFontChance = ovrideval.DefaultRNGFontChance != -1 ? ovrideval.DefaultRNGFontChance : pleaso.DefaultRNGFontChance;
							newPleaso.DefaultFlagChance = ovrideval.DefaultFlagChance != -1 ? ovrideval.DefaultFlagChance : pleaso.DefaultFlagChance;
						}
					}
					
					var stringDefault = "Indeed, " + please[i].PersonName + " Please!";
					
					var pleaselist = [];
					for (var j = 0; j < newPleaso.DefaultNormalChance; j++)
						pleaselist.push(stringDefault);

					for (var j = 0; j < newPleaso.DefaultH1Chance; j++)
						pleaselist.push("# " + stringDefault);

					for (var j = 0; j < newPleaso.DefaultH2Chance; j++)
						pleaselist.push("## " + stringDefault);

					for (var j = 0; j < newPleaso.DefaultH3Chance; j++)
						pleaselist.push("### " + stringDefault);

					var chosen = pleaselist[Math.floor(Math.random() * pleaselist.length)];

					var normalFont = 100 - newPleaso.DefaultRNGFontChance - newPleaso.DefaultFlagChance;
					if (normalFont < 0) normalFont = 1;

					var newPleaseList = [];
					for (var j = 0; j < normalFont; j++)
						newPleaseList.push(chosen);

					for (var j = 0; j < newPleaso.DefaultRNGFontChance; j++)
						newPleaseList.push(RandFont(chosen));

					for (var j = 0; j < newPleaso.DefaultFlagChance; j++)
						newPleaseList.push(RandFont(chosen, 12));

					// pick a random one
					var num = Math.floor(Math.random() * newPleaseList.length);
					message.channel.send(newPleaseList[num]);
				}
			}
		}
	}
}

function RandFont(text, index = -1)
{
	var fonts = global.reverseLook;
	var newText = "";

	var rnd = Math.floor(Math.random() * fonts["A"].length);

	// loop through characters in text (ignoring # and space)
	for (var i = 0; i < text.length; i++)
	{
		// only replace a-z A-Z 0-9
		if (!text[i].match(/[a-zA-Z0-9]/))
		{
			newText += text[i];
			continue;
		}
		
		if (index == -1)
		{
			newText += fonts[text[i]][rnd];
		}
		else
		{
			newText += fonts[text[i]][index];
		}
	}

	return newText;
}

function checkForFish(message, msgContent)
{
	// load babadata.datalocation + "FISHcache.json"
	
	var fishData = fs.readFileSync(babadata.datalocation + "FISHcache.json");

	var fish = JSON.parse(fishData);

	var mesgtosend = [];
	var allfish = [];

	var fishio = msgContent.includes("fish");

	for (var i = 0; i < fish.length; i++)
	{
		fishI = fish[i];

		for (var j = 0; j < fishI.DefaultOccCount; j++)
		{
			allfish.push(fishI.url);
		}

		if (fishI.ProcFishless)
		{
			var procChance = 1 / fishI.ProcChance;
			var FishWords = fishI.FishWords;
			var FishWordSimilars = FishWords.split(", ");

			var chanceo = Math.random() < procChance;
			if (!chanceo && !fishio) continue;

			for (var j = 0; j < FishWordSimilars.length; j++)
			{
				if (msgContent.includes(FishWordSimilars[j]))
				{
					for (var j = 0; j < (fishI.DefaultOccCount - 1) * fishI.FishBuff; j++)
					{
						allfish.push(fishI.url);
					}
					mesgtosend.push(fishI.url);
					break;
				}
			}
		}
	}

	if (fishio)
	{
		var one500 = Math.random() < (1/500);
		if (one500)
		{
			mesgtosend = [];
			var num = Math.floor(Math.random() * allfish.length);
			mesgtosend = [allfish[num]];
		}
		else
		{
			mesgtosend = [];
		}
	}

	if (mesgtosend.length > 0)
	{
		for (var i = 0; i < mesgtosend.length; i++)
		{
			message.reply(mesgtosend[i]);
		}
	}
}

function GetSimilarName(names)
{
	var num = Math.floor(Math.random() * names.length);
	var nam = names[num];
	return nam;
}

function FrogButtons(texts, interaction, message)
{
	for (var i = 0; i < texts.length; i++)
	{
		var row = new Discord.ActionRowBuilder();
		
		var pButton = new Discord.ButtonBuilder().setCustomId("page"+(i - 1)).setLabel("Previous").setStyle(1);
		var nButton = new Discord.ButtonBuilder().setCustomId("page"+(1 + i)).setLabel("Next").setStyle(1);
		if (i == 0)
		{
			pButton.setDisabled(true);
		}
		if (i == texts.length - 1)
		{
			nButton.setDisabled(true);
		}

		row.addComponents(pButton, nButton);

		texts[i].components = [row];
	}
	handleButtonsEmbed(interaction.channel, message, interaction.user.id, texts);
}

function buttonsAwaitMessageComponent(message, userid, data, collector)
{
	const collectorFilter = i => {
		return i.user.id === userid && i.message.id === message.id && i.customId.includes("jumpToHaiku");
	};

	message.awaitMessageComponent({ filter: collectorFilter, componentType: ComponentType.Button, time: 100000 })
	.then(async initialInteraction => 
		{
			// open a modal with a text input for the user to enter the haiku number
			const modal = new ModalBuilder()
				.setCustomId('jumpToNumber')
				.setTitle('Jump to Custom Haiku');

			const input = new TextInputBuilder()
				.setCustomId('haikuNum')
				.setLabel("The number of the haiku you want to jump to")
				.setStyle(1)
				.setRequired(true)
				.setPlaceholder("Haiku Number");

			const firstActionRow = new ActionRowBuilder().addComponents(input);
			modal.addComponents(firstActionRow);

			initialInteraction.showModal(modal);

			await initialInteraction.awaitModalSubmit({
				filter: (i) =>
					  i.customId === "jumpToNumber" &&
					  i.user.id === userid,
				time: 60000,
			}).then(async (modalInteraction) => {
				modalInteraction.deferUpdate();
				var chansend = modalInteraction.fields.getTextInputValue("haikuNum");
				var num = parseInt(chansend);
				if (num != null && num > 0 && num <= data.length)
				{
					global.paged[message.id] = num - 1;
					// update the message to show the haiku at the given number
					message.edit(data[num - 1]);
					collector.resetTimer();
					buttonsAwaitMessageComponent(message, userid, data, collector);
				}
			});
		}
	)
	.catch(err => console.error(err, true));
}

global.paged = {};

function handleButtonsEmbed(channel, message, userid, data, deadData = null)
{
	global.paged[message.id] = 0;
	console.log("Handling buttons embed");
	const filter = i => (i.customId.includes("page")) 
						&& i.message.id === message.id && i.user.id === userid;

	
	const collector = channel.createMessageComponentCollector({ filter, time: 30000 });
	collector.on('collect', async i => {
		if (i.customId.includes("page")) 
		{
			//i.deferUpdate();
			var page = parseInt(i.customId.replace("page", ""));
			global.paged[message.id] = page;

			i.update(data[page]);
			collector.resetTimer();

			//await i.update({ content: 'A button was clicked!', components: [] });
		}
	});

	buttonsAwaitMessageComponent(message, userid, data, collector);
 
	collector.on('end', collected => {
		if (deadData != null)
			message.edit({components: deadData[global.paged[message.id]]});
		else
			message.edit({components: []});
	});
}

async function uExist(url)
{
	https.get(url, res => {
		if (res.statusCode === 404) 
			return false;
		else 
			return true;
	});
}

function enumConverter(int)
{
	switch(int)
	{
		case 1:
			return "GuildUpdate";
		case 10:
			return "ChannelCreate";
		case 11:
			return "ChannelUpdate";
		case 12:
			return "ChannelDelete";
		case 13:
			return "ChannelOverwriteCreate";
		case 14:
			return "ChannelOverwriteUpdate";
		case 15:
			return "ChannelOverwriteDelete";
		case 20:
			return "MemberKick";
		case 21:
			return "MemberPrune";
		case 22:
			return "MemberBanAdd";
		case 23:
			return "MemberBanRemove";
		case 24:
			return "MemberUpdate";
		case 25:
			return "MemberRoleUpdate";
		case 26:
			return "MemberMove";
		case 27:
			return "MemberDisconnect";
		case 28:
			return "BotAdd";
		case 30:
			return "RoleCreate";
		case 31:
			return "RoleUpdate";
		case 32:
			return "RoleDelete";
		case 40:
			return "InviteCreate";
		case 41:
			return "InviteUpdate";
		case 42:
			return "InviteDelete";
		case 50:
			return "WebhookCreate";
		case 51:
			return "WebhookUpdate";
		case 52:
			return "WebhookDelete";
		case 60:
			return "EmojiCreate";
		case 61:
			return "EmojiUpdate";
		case 62:
			return "EmojiDelete";
		case 72:
			return "MessageDelete";
		case 73:
			return "MessageBulkDelete";
		case 74:
			return "MessagePin";
		case 75:
			return "MessageUnpin";
		case 80:
			return "IntegrationCreate";
		case 81:
			return "IntegrationUpdate";
		case 82:
			return "IntegrationDelete";
		case 83:
			return "StageInstanceCreate";
		case 84:
			return "StageInstanceUpdate";
		case 85:
			return "StageInstanceDelete";
		case 90:
			return "StickerCreate";
		case 91:
			return "StickerUpdate";
		case 92:
			return "StickerDelete";
		case 100:
			return "GuildScheduledEventCreate";
		case 101:
			return "GuildScheduledEventUpdate";
		case 102:
			return "GuildScheduledEventDelete";
		case 110:
			return "ThreadCreate";
		case 111:
			return "ThreadUpdate";
		case 112:
			return "ThreadDelete";
		case 121:
			return "ApplicationCommandPermissionUpdate";
		case 140:
			return "AutoModerationRuleCreate";
		case 141:
			return "AutoModerationRuleUpdate";
		case 142:
			return "AutoModerationRuleDelete";
		case 143:
			return "AutoModerationBlockMessage";
		case 144:
			return "AutoModerationFlagToChannel";
		case 145:
			return "AutoModerationUserCommunicationDisabled";
		case 150:
			return "CreatorMonetizationRequestCreated";
		case 151:
			return "CreatorMonetizationTermsAccepted";
		case 192:
			return "GuildVoiceStatusUpdate";
		default:
			return "Unknown";
	}
}

function getTimeFromString(timestring)
{
	var currentTime = getD1(true);
	
	var time = timestring.split(":");
	var hour = 0;
	var minute = 0;
	var second = 0;

	var hourtime = null;
	if (time.length == 3)
	{
		hour = parseInt(time[0]);
		minute = parseInt(time[1]);
		second = parseInt(time[2]);
	}
	else if (time.length == 2)
	{
		hour = parseInt(time[0]);
		minute = parseInt(time[1]);
	}
	else if (time.length == 1)
	{
		hour = parseInt(time[0]);
	}

	var timepossibles = [];
	var newTime;
	
	if (!isNaN(hour))
	{
		newTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), hour, minute, second);
		// if time is in the past, add a day

		// if contians am or pm convert to 24 hour time
		if (timestring.toLowerCase().includes("pm") && newTime.getHours() < 12)
		{
			newTime.setHours(newTime.getHours() + 12);
		}

		if (timestring.toLowerCase().includes("am") && hour == 12)
		{
			newTime.setHours(0);
		}

		if (newTime.getTime() < currentTime.getTime())
		{
			newTime.setDate(newTime.getDate() + 1);
		}

		hourtime = newTime;
		timepossibles.push(newTime);
	}
	// console.log("Time possibles: " + timepossibles);
	// Group OVERRIDE: (these take precedence over all other time strings)
	// midnight -> midnight of the next day
	// noon -> the next noon

	// Group A: 
	// tonight -> caps the time period from 6pm to 12am of day sent, if it is past 6pm it will be from current time to 12am
	// tomorrow -> caps the time period from 7am to 10pm of the next day

	// morning -> caps the time period from 7am to 11am of the day sent, can be used with tomorrow
	// afternoon -> caps the time period from 12pm to 5pm of the day sent, can be used with tomorrow

	// later -> uses existing time caps, has to also be > 1-2 (random) hours from current time, adds 2 hours to end of cap (if exists, else 6hrs from current time)
	// sometime -> uses existing time caps, 
	
	if (timestring.toLowerCase().includes("midnight"))
	{
		newTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate() + 1, 0, 0, 0);
		timepossibles.push(newTime);
	}
	
	// console.log("Time possibles: " + timepossibles);
	if (timestring.toLowerCase().includes("noon") && !timestring.toLowerCase().includes("afternoon"))
	{
		var day = currentTime.getDate();
		if (currentTime.getHours() >= 12)
			day += 1;
		newTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), day, 12, 0, 0);
		timepossibles.push(newTime);
	}

	if (timestring.toLowerCase().includes("tonight"))
	{
		var day = currentTime.getDate();
		var hourT = 18;
		var minuteT = 0;
		var secondT = 0;

		var extraSeconds = Math.random() * 60 * 60 * 2;

		if (currentTime.getHours() >= 18)
		{
			hourT = currentTime.getHours();
			minuteT = currentTime.getMinutes();
			secondT = currentTime.getSeconds();
		}

		var newTimeStart = new Date(currentTime.getFullYear(), currentTime.getMonth(), day, hourT, minuteT, secondT);
		var newTimeEnd = new Date(currentTime.getFullYear(), currentTime.getMonth(), day, 23, 59, 59);

		if (timestring.toLowerCase().includes("later") && hourtime == null)
		{
			newTimeStart.setSeconds(newTimeStart.getSeconds() + extraSeconds);
			newTimeEnd.setSeconds(newTimeEnd.getSeconds() + extraSeconds);
		}
		
		// if hourtime falls within the range, use that time
		if (hourtime != null && hourtime.getTime() >= newTimeStart.getTime() && hourtime.getTime() <= newTimeEnd.getTime())
		{
			hourT = hourtime.getHours();
			minuteT = hourtime.getMinutes();
			secondT = hourtime.getSeconds();
			hourTEd = hourtime.getHours();
			minuteTEd = hourtime.getMinutes();
			secondTEd = hourtime.getSeconds();
		}

		// get a time between start and end
		newTime = new Date(newTimeStart.getTime() + Math.random() * (newTimeEnd.getTime() - newTimeStart.getTime()));
		
		timepossibles.push(newTime);
	}

	if (timestring.toLowerCase().includes("tomorrow"))
	{
		var day = currentTime.getDate() + 1;
		var hourT = 7;
		var minuteT = 0;
		var secondT = 0;

		var hourTEd = 22;
		var minuteTEd = 0;
		var secondTEd = 0;

		if (timestring.toLowerCase().includes("morning"))
		{
			hourT = 7;
			hourTEd = 11;
		}
		else if (timestring.toLowerCase().includes("afternoon"))
		{
			hourT = 12;
			hourTEd = 17;
		}
		else if (timestring.toLowerCase().includes("evening"))
		{
			hourT = 18;
			hourTEd = 21;
		}
		else if (timestring.toLowerCase().includes("night"))
		{
			hourT = 22;
			hourTEd = 23;
			minuteTEd = 59;
			secondTEd = 59;
		}
		else if (timestring.toLowerCase().includes("sometime"))
		{
			hourT = 0;
			hourTEd = 23;
			minuteTEd = 59;
			secondTEd = 59;
		}

		if (hourtime != null)
		{
			hourT = hourtime.getHours();
			minuteT = hourtime.getMinutes();
			secondT = hourtime.getSeconds();
			hourTEd = hourtime.getHours();
			minuteTEd = hourtime.getMinutes();
			secondTEd = hourtime.getSeconds();
		}

		var newTimeStart = new Date(currentTime.getFullYear(), currentTime.getMonth(), day, hourT, minuteT, secondT);
		var newTimeEnd = new Date(currentTime.getFullYear(), currentTime.getMonth(), day, hourTEd, minuteTEd, secondTEd);

		if (timestring.toLowerCase().includes("later") && hourtime == null)
		{
			newTimeStart.setSeconds(newTimeStart.getSeconds() + extraSeconds);
			newTimeEnd.setSeconds(newTimeEnd.getSeconds() + extraSeconds);
		}

		newTime = new Date(newTimeStart.getTime() + Math.random() * (newTimeEnd.getTime() - newTimeStart.getTime()));
		
		timepossibles.push(newTime);
	}

	if (!timestring.toLowerCase().includes("tomorrow") && !timestring.toLowerCase().includes("tonight"))
	{
		if (timestring.toLowerCase().includes("later"))
		{
			var extraSeconds = Math.random() * 60 * 60 * 2;
			var extraSecondsLength = Math.random() * 60 * 60 * 5;
	
			if (hourtime != null)
			{
				newTime = new Date(hourtime.getTime() + extraSeconds);
			}
			else
			{
				newTime = new Date(currentTime.getTime() + extraSeconds + extraSecondsLength);
			}
			timepossibles.push(newTime);
		}
	
		if (timestring.toLowerCase().includes("sometime"))
		{
			// pick a random time in next 5 days
			var seconds = Math.random() * 60 * 60 * 24 * 5;
			newTime = new Date(currentTime.getTime() + seconds);
			timepossibles.push(newTime);
		}

		if (timestring.toLowerCase().includes("morning"))
		{
			var day = currentTime.getDate();
			var hourT = 7;
			var minuteT = 0;
			var secondT = 0;
			var hourTEd = 11;
			var minuteTEd = 0;
			var secondTEd = 0;

			if (hourtime != null && hourtime.getHours() >= 7 && hourtime.getHours() <= 11)
			{
				hourT = hourtime.getHours();
				minuteT = hourtime.getMinutes();
				secondT = hourtime.getSeconds();
				hourTEd = hourtime.getHours();
				minuteTEd = hourtime.getMinutes();
				secondTEd = hourtime.getSeconds();
			}

			var newTimeStart = new Date(currentTime.getFullYear(), currentTime.getMonth(), day, hourT, minuteT, secondT);
			var newTimeEnd = new Date(currentTime.getFullYear(), currentTime.getMonth(), day, hourTEd, minuteTEd, secondTEd);

			newTime = new Date(newTimeStart.getTime() + Math.random() * (newTimeEnd.getTime() - newTimeStart.getTime()));

			// if time is in the past, add a day
			if (newTime.getTime() < currentTime.getTime())
			{
				newTime.setDate(newTime.getDate() + 1);
			}

			timepossibles.push(newTime);
		}

		if (timestring.toLowerCase().includes("afternoon"))
		{
			var day = currentTime.getDate();
			var hourT = 12;
			var minuteT = 0;
			var secondT = 0;
			var hourTEd = 17;
			var minuteTEd = 0;
			var secondTEd = 0;

			if (hourtime != null && hourtime.getHours() >= 12 && hourtime.getHours() <= 17)
			{
				hourT = hourtime.getHours();
				minuteT = hourtime.getMinutes();
				secondT = hourtime.getSeconds();
				hourTEd = hourtime.getHours();
				minuteTEd = hourtime.getMinutes();
				secondTEd = hourtime.getSeconds();
			}

			var newTimeStart = new Date(currentTime.getFullYear(), currentTime.getMonth(), day, hourT, minuteT, secondT);
			var newTimeEnd = new Date(currentTime.getFullYear(), currentTime.getMonth(), day, hourTEd, minuteTEd, secondTEd);

			newTime = new Date(newTimeStart.getTime() + Math.random() * (newTimeEnd.getTime() - newTimeStart.getTime()));

			// if time is in the past, add a day
			if (newTime.getTime() < currentTime.getTime())
			{
				newTime.setDate(newTime.getDate() + 1);
			}

			timepossibles.push(newTime);
		}

		if (timestring.toLowerCase().includes("evening"))
		{
			var day = currentTime.getDate();
			var hourT = 18;
			var minuteT = 0;
			var secondT = 0;
			var hourTEd = 21;
			var minuteTEd = 0;
			var secondTEd = 0;

			if (hourtime != null && hourtime.getHours() >= 18 && hourtime.getHours() <= 21)
			{
				hourT = hourtime.getHours();
				minuteT = hourtime.getMinutes();
				secondT = hourtime.getSeconds();
				hourTEd = hourtime.getHours();
				minuteTEd = hourtime.getMinutes();
				secondTEd = hourtime.getSeconds();
			}

			var newTimeStart = new Date(currentTime.getFullYear(), currentTime.getMonth(), day, hourT, minuteT, secondT);
			var newTimeEnd = new Date(currentTime.getFullYear(), currentTime.getMonth(), day, hourTEd, minuteTEd, secondTEd);

			newTime = new Date(newTimeStart.getTime() + Math.random() * (newTimeEnd.getTime() - newTimeStart.getTime()));

			// if time is in the past, add a day
			if (newTime.getTime() < currentTime.getTime())
			{
				newTime.setDate(newTime.getDate() + 1);
			}

			timepossibles.push(newTime);
		}
	}

	// pick a random time from the possible times
	var time = timepossibles[Math.floor(Math.random() * timepossibles.length)];
	// convert to current timezone
	// console.log(timepossibles);

	// hourtime = new Date(hourtime.getTime() - (hourtime.getTimezoneOffset() * 60000));

	return time;
}


async function extremeEmoji(message, msgContent, reactneeded=0)
{
	// load babadata.datalocation + "emojiJSONCache.json
	var rawdata = fs.readFileSync(babadata.datalocation + "emojiJSONCache.json");
	var emojis = JSON.parse(rawdata).emojis;

	var goodfellas = {};

	// loop through emoji list length
	for (var i = 0; i < emojis.length; i++) //
	{
		var eName = emojis[i].name;
		var eCategory = emojis[i].category;
		var eSubCategory = emojis[i].category;
		// var eChar = emojis[i].emoji;
		var selections = emojis[i].emojis;

		eCategory += " " + eSubCategory;

		// replace _ in shortname with space
		// eShortName = eShortName.replace(/_/g, " ");

		// allow name to only have a-z 0-9 and space (force lowercase)
		eName = eName.toLowerCase().replace(/[^a-z0-9 ]/g, "");
		// eShortName = eShortName.toLowerCase().replace(/[^a-z0-9 ]/g, "");

		var subValues = [];
		var subValueseName = eName.split(" ");
		// var subValueseShortName = eShortName.split(" ");

		// add all sub values to array
		subValues = subValues.concat(subValueseName);
		// subValues = subValues.concat(subValueseShortName);

		// remove duplicates
		subValues = subValues.filter((v, i, a) => a.indexOf(v) === i);

		subValues.push(selections[0]);

		// skip emoji if it has skin tone in it
		// if (eName.includes("skin tone") || eShortName.includes("skin tone"))
		// 	continue;

		// check if any sub values are in the message
		var found = false;

		for (var j = 0; j < selections.length; j++)
		{
			var eChars = selections[j];
			if (msgContent.toLowerCase().includes(eChars) || msgContent.includes(eChars))
			{
				found = true;
				break;
			}
		}

		if (!found)
		{
			for (var j = 0; j < subValues.length; j++)
			{
				// skip if sub value is < 3 characters
				if (subValues[j].length < 3 && subValues[j] != selections[0])
					continue;
				if (msgContent.toLowerCase().includes(subValues[j]))
				{
					found = true;
					break;
				}
				if (message.content.toLowerCase().includes(subValues[j]))
				{
					found = true;
					break;
				}
			}
		}

		if (eName == "mediumlight skin tone" || eName == "medium skin tone" || eName == "mediumdark skin tone" || eName == "dark skin tone" || eName == "light skin tone")
			found = false;

		// if found add to list
		if (found)
		{
			// add new category to goodfellas if it doesn't exist
			if (goodfellas[eCategory] == null)
				goodfellas[eCategory] = [];

			// if name already exists in category, skip
			var exists = false;
			for (var j = 0; j < goodfellas[eCategory].length; j++)
			{
				if (goodfellas[eCategory][j].name == eName)
				{
					exists = true;
					break;
				}
			}

			// add emoji to category
			if (!exists)
				goodfellas[eCategory].push({name: eName, emojis: selections});
		}
	}

	// if goodfellas is empty, return
	if (Object.keys(goodfellas).length == 0)
	{
		return;
	}

	// console.log("goodfellas: " + Object.keys(goodfellas).length);
	
	var slightlyusedcategories = {};

	// console.log("Reacting with: " + reactneeded + " emojis.");

	reactEmoji(goodfellas, slightlyusedcategories, message, reactneeded);
}

async function reactEmoji(goodfellas, slightlyusedcategories, message, reactneeded)
{
	var goodfellasRoundNext = {};
	// while reactcount is less than maxemoji
	while (reactneeded > 0)
	{
		// if no categories left and slightlyusedcategories is empty, return
		if (Object.keys(goodfellas).length == 0)
		{
			if (Object.keys(slightlyusedcategories).length == 0)
			{
				if (goodfellasRoundNext != null && Object.keys(goodfellasRoundNext).length > 0)
				{
					goodfellas = goodfellasRoundNext;
					goodfellasRoundNext = {};
					slightlyusedcategories = {};
				}
				else
				{
					console.log("No emojis remaining.");
					return;
				}
			}
			else
			{
				goodfellas = slightlyusedcategories;
				slightlyusedcategories = {};
			}
		}
		
		// get random category
		var categories = Object.keys(goodfellas);
		var category = categories[Math.floor(Math.random() * categories.length)];

		// get category emojis
		var categoryemojis = goodfellas[category];

		// get random emoji
		var emoji = categoryemojis[Math.floor(Math.random() * categoryemojis.length)];

		// select a random emoji from theEmojis
		var emojiChosen = emoji.emojis[Math.floor(Math.random() * emoji.emojis.length)];

		var emojoIndex = emoji.emojis.indexOf(emojiChosen);
		// remove emoji from theEmojis
		emoji.emojis.splice(emojoIndex, 1);

		// if emoji.emojis is not empty, add to goodfellasRoundNext
		if (emoji.emojis.length > 0)
		{
			if (goodfellasRoundNext[category] == null)
				goodfellasRoundNext[category] = [];

			goodfellasRoundNext[category].push(emoji);
		}

		// remove emoji from category
		var index = categoryemojis.indexOf(emoji);
		categoryemojis.splice(index, 1);

		// if category is empty, remove category
		if (categoryemojis.length == 0)
			delete goodfellas[category];
		// else move category to slightlyusedcategories
		else
		{
			slightlyusedcategories[category] = categoryemojis;
			delete goodfellas[category];
		}

		reactneeded--;
		// react with emoji
		// console.log("Reacting with: " + emoji.char + " -- " + emoji.name);
		await message.react(emojiChosen).catch(
			function(error)
			{
				// if unknown message, skip all emojis
				if (error.code == 10008)
				{
					reactneeded = 0;
					return;
				}
				console.error(error);
				reactneeded++;
			}
		);

		// console.log("reactneeded: " + reactneeded);
		// console.log("-----------------");
	}
}

function GambaRoll(time)
{
	var roll = Math.floor(Math.random() * 20) + 1;
	if (roll > 10)
		time.setMinutes(Math.floor(Math.random() * 60));
	if (roll > 16)
		time.setSeconds(Math.floor(Math.random() * 60));

	return time;
}

module.exports = {
	RoleAdd,
    preformEasterEggs,
    dateDiffInDays,
    antiDelay,
    getAttachment,
    dailyRandom,
    fronge,
    CheckFrogID,
    CreateChannel,
    FindDate,
	MonthsPlus,
    GetDate,
    SetHolidayChan,
    GetSimilarName,
    FrogButtons,
    handleButtonsEmbed,
	uExist,
	Seperated,
	enumConverter,
	getTimeFromString,
	progressSimple,
	channelStatusChange
};