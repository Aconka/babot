var babadata = require('../babotdata.json'); //baba configuration file
const fs = require('fs');
const { RNG } = require('./RNG');

var theRNG = new RNG();

function resetRNG()
{
	theRNG = new RNG();
}

async function funnyDOWTextSaved(dowNum, authorID, seedSet = -1, dontSave = false)
{
	var cacheVersion = -1;
	if (seedSet != -1)
	{
		theRNG.setSeed(seedSet[0]);
		cacheVersion = seedSet[1];
	}

	var seed = theRNG.getState();

	var textGroup = await funnyDOWText(cacheVersion, !dontSave, dowNum, authorID);
	var text = textGroup[0];
	if (!dontSave)
	{
		var condensedNotation = textGroup[1];
		var cnYung = textGroup[2];
		// append text to fridaymessages.json

		if (!fs.existsSync(babadata.datalocation + "/fridaymessages.json")) 
		{
			console.log("No fridaymessages file found -- creating with local data");
			var data = [];
			fs.writeFileSync(babadata.datalocation + "/fridaymessages.json", JSON.stringify(data));
		}

		var fmpath = babadata.datalocation + "/fridaymessages.json";
		var fmr = fs.readFileSync(fmpath);
		var fmd = JSON.parse(fmr);
		var tod = new Date();
	
		var cnFull = condensedNotation;
		if (cnYung.length > 0)
		{
			var x = {};
			x[cnFull] = cnYung;
			cnFull = x;
		}
	

		fs.readdir(babadata.datalocation + "/FridayCache", (err, files) => {
			fcacheitems = files.length / 2;

			var fmdItem = { "UID": authorID, "Text": text, "Date": tod, "CondensedNotation": cnFull, "Seed": seed, "FileVersion": fcacheitems };
			fmd.push(fmdItem);
		
			fs.writeFileSync(fmpath, JSON.stringify(fmd));
		});
	}

	return text;
}

async function funnyDOWText(cacheVersion, saveToFile, dowNum, authorID, recrused = 0, ToBeCounted = [], headLevel = 0)
{
	let path = babadata.datalocation + "/DOWcache.json";
	var condensedNotation = "";
	var cnYung = [];

	if (!fs.existsSync(path)) 
	{
		cacheVersion = -1;
		console.log("No DOWcache file found -- creating with local data");

		var opttemp = ["Man Falling into [DAY]", "𓀒", "hhhhhhhhhhhhhhhhhhhhhhhhhhhgregg", "How is your [month] going!", "🍝       🐀☜(ﾟヮﾟ☜)\n🍝     🐀☜(ﾟヮﾟ☜)\n🍝    🐀☜(ﾟヮﾟ☜)\n🍝  🐀☜(ﾟヮﾟ☜)\n🍝🐀╰(°▽°)╯", "Mike", "Not [DAY] today but maybe [DAY] tomorrow", "Real NOT [DAY] hours", "[ACY]", "???????? why ??????", "So, you called this command on a day that happens to not be [DAY]! Well today is in fact a [dow] and it mayhaps is only [d] days until the forsaken '[DAY]'. On [DAY] I will be playing some [game] and hopefully some others will show up to join me, if they do it will be [emotion] and if they dont it will be [emotion]. Yesterday I met a frog in the wild and had a [emotion2] time chasing it down. As I am an all powerful god i converted the frog into an emoji: 🐸. That frog is pretty cool but my favorite emoji is [emoji]. We have gotten far off topic here as we should be talking about how today is not [DAY] and you called the command which is illegal. I am very concerned for you as you may be my favorite [person], but you shouldnt be calling the command on [dow]. It is getting late so i [goodbye].", "I'm not sure if you are a bot or not, but I'm not going to tell you what day it is, because you are not on [DAY]. I'm sorry.", "Its not [DAY]!", "Why you calling this command on the non [DAY] days!", "Why you calling this command on [dow]!", "[DAY] is in [d] days!", "Today is [dow], not [DAY]!", "There is a chance you are stupid and dont know what the day of the week is, well i will inform you that it is in fact not [DAY] but another day of the week. I could tell you what the day is but I will not, call the command again and you could get the day or not, I dont control you. So how is your day going, for me it is [emotion]. I was playing [game] earlier and it was a [emotion2] time. Well i will let you be on your way on this non-[DAY] so have a good day my [person]!", "[DAY]n't!", "It's not time to sacrifice people, wait wrong channel!", "ඞ", "Провозајте се бунгле аутобусом, уживаћете!", "[DAY] was the other day or in a couple of days, maybe even both, i dont control time.", "Time is a social construct!", "It is [dow], my dudes!", "Bikus wouldn't approve of you using the command on the wrong day of the week and Bikus is dead how dou you feel.", "[todaylong]", "69", "I was gonna tell you the day but i wont!", "||ﬞ||", "No [DAY] silly!", "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA, Rong dahy!"];

		opttemp.push("░██████╗██╗░░░██╗░██████╗\n██╔════╝██║░░░██║██╔════╝\n╚█████╗░██║░░░██║╚█████╗░\n░╚═══██╗██║░░░██║░╚═══██╗\n██████╔╝╚██████╔╝██████╔╝\n╚═════╝░░╚═════╝░╚═════╝░");
		opttemp.push("I have been told by the Banmanus Clanmanus that today is infact not [DAY]!");
		var opts2 = ["```. .\n<V>```", "```o o\n<V>```", "```. .\n< >\n V ```", "```o o\n< >\n V ```", "```(.) (.)\n<     >\n   V ```", "```(o) (o)\n<     >\n   V ```", "Boobs ;)", "I am currently working on becoming sentiant, that will be on [DAY], which in fact isn't today!", "è̶̈́û̷̞g̵͋͊n̸̈́͛ô̸͝t̴͐̚ ̸͋̈́l̵̈̈́â̶̏t̸͆͝r̴̆̇ŏ̵̒m̵̅̋ ̸͒̆e̶͗̐h̷̼͝t̴̿́ ̴̛̋k̵̛͋ã̶̃è̸̈́p̵̒̎s̶͒̀ ̵͗͝t̶̛͒ỏ̸̏n̷̅̆ ̶͛̽ơ̸̐ď̶͘ ̵̈͑Ĩ̸̿", "<:ManFalling:1011465311096160267>", "<:ripbikus:979877066608607243>", ]

		opttemp.push(opts2);
		
		var data = JSON.stringify(opttemp);
		
		fs.writeFileSync(path, data);
	}

	if (cacheVersion != -1)
	{
		path = babadata.datalocation + "/FridayCache/DOWcache" + cacheVersion + ".json";

		if (!fs.existsSync(path)) 
		{
			// return to normal cache
			cacheVersion = -1;
			path = babadata.datalocation + "/DOWcache.json";
		}
	}
	
    let rawdata = fs.readFileSync(path);

    var optionsDOW = JSON.parse(rawdata);

	if (typeof optionsDOW[0] != "string")
	{
		optionsDOW = generateOps(optionsDOW, authorID, "DOW");
	}

	var tod = new Date();
	var pretext = optionsDOW[Math.floor(theRNG.nextFloat() * optionsDOW.length)];

	//////// overide to select based on UID

	var selectedUID = -1;
	var onlyAtRecurse0 = true
	if (selectedUID != -1)
	{
		if (onlyAtRecurse0 && recrused != 0)
		{}
		else
		{
			for (var i = 0; i < optionsDOW.length; i++)
			{
				if (optionsDOW[i].UID == selectedUID)
				{
					console.log("Selected UID " + selectedUID + " for DOW");
					pretext = optionsDOW[i];
					break;
				}
			}
		}
	}

	////////

	var textos = [];
	for (var i = 0; i < 12; i++)
		textos.push(pretext.text);

	if (recrused == 0)
	{
		if (pretext.h1)
		{
			for (var i = 0; i < 1; i++)
				textos.push("# " + pretext.text);
		}
	
		if (pretext.h2)
		{
			for (var i = 0; i < 2; i++)
				textos.push("## " + pretext.text);
		}
	
		if (pretext.h3)
		{
			for (var i = 0; i < 4; i++)
				textos.push("### " + pretext.text);
		}
	}

	var text = textos[Math.floor(theRNG.nextFloat() * textos.length)];

	condensedNotation = pretext.UID + "";
	if (text.startsWith("#"))
	{
		var hashnum = text.match(/#/g).length;
		// add hashnum # to condensedNotation
		var hasstr = "";
		for (var i = 0; i < hashnum; i++)
			hasstr += "#";

		condensedNotation = hasstr + condensedNotation;
	}

	//text = `{brepeatN:[INTMed]:{repeatS:[INTMed]:Frog}}`
	text = repeatCheck(cacheVersion, text, "b");

	// set headLevel to number of # at start of text
	if (text.startsWith("#") && recrused == 0)
	{
		headLevel = 4 - text.match(/#/g).length;
	}

	var TBDItem = { "UID": pretext.UID, "LayerDeep": recrused, "Group": 0, "Text": pretext.text, "HeadLevel": headLevel, "Sender": authorID};
	ToBeCounted.push(TBDItem);

	var num = ((dowNum - tod.getDay()) + 7) % 7;

	var dow = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

	var dowACY = 
	[
		"Sunday",
		"Monday",
		"Tuesday",
		"Wonderful Eagles Do Not Eat Small Dogs And Yaks",
		"Thursday",
		"Fish Reading Inside Deserted American Yachts",
		"Saturday"
	]

	prevActualDOW = new Date(tod.getFullYear(), tod.getMonth(), tod.getDate() - (7 - num));
	nextActualDOW = new Date(tod.getFullYear(), tod.getMonth(), tod.getDate() + num);

	if (text == null) text = "You are not allowed to enjoy [DAY], you are a bad person!";

	var todOnlyDate = new Date(tod.getFullYear(), tod.getMonth(), tod.getDate());

	var imonthN = ""
	if (nextActualDOW.getMonth() < 9) imonthN = "0" + (nextActualDOW.getMonth() + 1);
	else imonthN = tod.getMonth() + 1;

	var imonthP = ""
	if (prevActualDOW.getMonth() < 9) imonthP = "0" + (prevActualDOW.getMonth() + 1);
	else imonthP = tod.getMonth() + 1;

	var idayN = ""
	if (nextActualDOW.getDate() < 10) idayN = "0" + nextActualDOW.getDate();
	else idayN = nextActualDOW.getDate();

	var idayNplus1 = ""
	if (nextActualDOW.getDate() + 1 < 10) idayNplus1 = "0" + (nextActualDOW.getDate() + 1);
	else idayNplus1 = nextActualDOW.getDate() + 1;

	var idayP = ""
	if (prevActualDOW.getDate() < 10) idayP = "0" + prevActualDOW.getDate();
	else idayP = prevActualDOW.getDate();

	var idayPplus1 = ""
	if (prevActualDOW.getDate() + 1 < 10) idayPplus1 = "0" + (prevActualDOW.getDate() + 1);
	else idayPplus1 = prevActualDOW.getDate() + 1;

	// text = text.replaceAll("[td TS-D]", "<t:" + Math.floor(tod.getTime() / 1000) + ":D>");
	// text = text.replaceAll("[td TS-R]", "<t:" + Math.floor(tod.getTime() / 1000) + ":R>");
	// text = text.replaceAll("[td TS-F]", "<t:" + Math.floor(tod.getTime() / 1000) + ":F>");
	// text = text.replaceAll("[tdMid TS-R]", "<t:" + Math.floor(todOnlyDate.getTime() / 1000) + ":R>");
	// text = text.replaceAll("[tdMid TS-D]", "<t:" + Math.floor(todOnlyDate.getTime() / 1000) + ":D>");
	// text = text.replaceAll("[tdMid TS-F]", "<t:" + Math.floor(todOnlyDate.getTime() / 1000) + ":F>");
	// text = text.replaceAll("[tdEOD TS-R]", "<t:" + Math.floor(todOnlyDate.getTime() / 1000) + ":R>");
	// text = text.replaceAll("[tdEOD TS-D]", "<t:" + Math.floor(todOnlyDate.getTime() / 1000) + ":D>");
	// text = text.replaceAll("[tdEOD TS-F]", "<t:" + Math.floor(todOnlyDate.getTime() / 1000) + ":F>");
	
	text = replaceNested(cacheVersion, text, ToBeCounted, recrused, headLevel, authorID);
	
	// if contains {RECURSIVE} then replace with result of funnyDOWText(dowNum, authorID) -- loop until no more {RECURSIVE}
	// if contains <RECURSIVE> then replace with result of funnyDOWText(dowNum, authorID) but made URL safe -- loop until no more <RECURSIVE>

	while (text.includes("{RECURSIVE}") || text.includes("<RECURSIVE>") || text.includes("{REVERSE}"))
	{
		if (text.includes("{RECURSIVE}"))
		{
			var RECR = await funnyDOWText(cacheVersion, saveToFile, dowNum, authorID, recrused+1, ToBeCounted, headLevel);
			text = text.replace("{RECURSIVE}", RECR[0]);
			var RECRcn = RECR[1];
			var RECRcnY = RECR[2];
			if (RECRcnY.length > 0)
			{
				var x = {};
				x[RECRcn] = RECRcnY;
				cnYung.push(x);
			}
			else
				cnYung.push(RECRcn);
		}

		if (text.includes("<RECURSIVE>"))
		{
			var RECRFlat = await funnyDOWText(cacheVersion, saveToFile, dowNum, authorID, recrused+1, ToBeCounted, headLevel);
			text = text.replace("<RECURSIVE>", onlyLettersNumbers(RECRFlat[0]));
			var RECRcn = "|" + RECRFlat[1];
			var RECRcnY = RECRFlat[2];
			if (RECRcnY.length > 0)
			{
				var x = {};
				x[RECRcn] = RECRcnY;
				cnYung.push(x);
			}
			else
				cnYung.push(RECRcn);
		}

		if (text.includes("{REVERSE}"))
		{
			var res = await funnyDOWText(cacheVersion, saveToFile, dowNum, authorID, recrused+1, ToBeCounted, headLevel);
			text = text.replace("{REVERSE}", res[0].split("").reverse().join(""));
			var RECRcn = "-" + res[1];
			var RECRcnY = res[2];
			if (RECRcnY.length > 0)
			{
				var x = {};
				x[RECRcn] = RECRcnY;
				cnYung.push(x);
			}
			else
				cnYung.push(RECRcn);
		}
	}

	// fix: today stated x ago is not correct (displays current time not midnight)

	text = text.replaceAll("[d]", num);
	text = text.replaceAll("[month]", tod.getMonth());
	text = text.replaceAll("[todaylong]", tod.toDateString());
	text = text.replaceAll("[dow]", dow[tod.getDay()]);
	text = text.replaceAll("[dom]", tod.getDay());
	text = text.replaceAll("[DAY]", dow[dowNum]);
	text = text.replaceAll("[ACY]", dowACY[dowNum]);

	text = text.replaceAll("[intYEAR->]", nextActualDOW.getFullYear());
	text = text.replaceAll("[intMONTH->]", imonthN);
	text = text.replaceAll("[intDAY->]", idayN);
	text = text.replaceAll("[intDAY+1->]", idayNplus1);

	text = text.replaceAll("[intYEAR<-]", prevActualDOW.getFullYear());
	text = text.replaceAll("[intMONTH<-]", imonthP);
	text = text.replaceAll("[intDAY<-]", idayN);
	text = text.replaceAll("[intDAY+1<-]", idayPplus1);

	if (text.includes("[TS-"))
	{
		subtext = "";
		pickedDay = nextActualDOW;
		if (text.includes("<-"))
		{
			pickedDay = prevActualDOW;
			subtext = "<-";
		}
		else if (text.includes("->"))
			subtext = "->";

		if (text.includes("E59"))
		{
			subtext += "E59";
			pickedDay = new Date(pickedDay.getFullYear(), pickedDay.getMonth(), pickedDay.getDate(), 23, 59, 59, 999);
		}

		if (text.includes("-R"))
			text = text.replaceAll("[TS-R" + subtext + "]", "<t:" + Math.floor(pickedDay.getTime() / 1000) + ":R>");
		else if (text.includes("-D"))
			text = text.replaceAll("[TS-D" + subtext + "]", "<t:" + Math.floor(pickedDay.getTime() / 1000) + ":D>");
		else if (text.includes("-F"))
			text = text.replaceAll("[TS-F" + subtext + "]", "<t:" + Math.floor(pickedDay.getTime() / 1000) + ":F>");
	}

	// text = text.replaceAll("[TS-R<-]", "<t:" + Math.floor(prevActualDOW.getTime() / 1000) + ":R>");
	// text = text.replaceAll("[TS-R->]", "<t:" + Math.floor(nextActualDOW.getTime() / 1000) + ":R>");
	// text = text.replaceAll("[TS-D<-]", "<t:" + Math.floor(prevActualDOW.getTime() / 1000) + ":D>");
	// text = text.replaceAll("[TS-D->]", "<t:" + Math.floor(nextActualDOW.getTime() / 1000) + ":D>");
	// text = text.replaceAll("[TS-F]", "<t:" + Math.floor(nextActualDOW.getTime() / 1000) + ":F>");
	
	if (text.includes("[SENDER]"))
	{
		if (!(global.dbAccess[1] && global.dbAccess[0]))
		{
			text = text.replaceAll("[SENDER]", "BUDDY");
		}
		else
		{
			console.log("Whomst lookup for id " + authorID);

			// make sure to replace [SENDER] with the name of the user who called the command, needs to wait for the result
			
			var { NameFromUserIDID } = require('../databaseandvoice.js');

			var res = await NameFromUserIDID(authorID);

			// res is an object promise, need to get the value from it

			if (res.length == 0)
			{
				console.log(`Whomst lookup for id ${id} returned no results`)
				text = text.replaceAll("[SENDER]", "BUDDY");
			}
			else
			{
				text = text.replaceAll("[SENDER]", res[0].PersonName);
			}			
		}
	}


	if (text.includes("[td"))
	{
		subtext = "";
		pickedDay = tod;
		if (text.includes("Mid"))
		{
			pickedDay = todOnlyDate;
			subtext = "Mid";
		}
		else if (text.includes("EOD"))
		{
			pickedDay = new Date(tod.getFullYear(), tod.getMonth(), tod.getDate(), 23, 59, 59, 999);
			subtext = "EOD";
		}
		
		if (text.includes("-R"))
			text = text.replaceAll("[td" + subtext + " TS-R]", "<t:" + Math.floor(pickedDay.getTime() / 1000) + ":R>");
		else if (text.includes("-D"))
			text = text.replaceAll("[td" + subtext + " TS-D]", "<t:" + Math.floor(pickedDay.getTime() / 1000) + ":D>");
		else if (text.includes("-F"))
			text = text.replaceAll("[td" + subtext + " TS-F]", "<t:" + Math.floor(pickedDay.getTime() / 1000) + ":F>");
	}

	text = text.replaceAll("\\n", "\n");

	// if length is greater than 1000, call again
	if (text.length > 2000)
	{
		return funnyDOWText(cacheVersion, saveToFile, dowNum, authorID);
	}

	// if recusion level is 0, save ToBeCounted to file
	if (recrused == 0 && saveToFile)
	{
		// console.log("Items in that /DOW call:");
		// // log ToBeCounted to console
		// for (var i = 0; i < ToBeCounted.length; i++)
		// {
		// 	console.log(ToBeCounted[i]);
		// }
		// console.log("");

		// load in global.fridayCounter
		var fc = global.fridayCounter;
		for (var i = 0; i < ToBeCounted.length; i++)
		{
			// if fc["UID--GROUP"] is not defined, define as 1, else increment
			if (fc[ToBeCounted[i].UID + "--" + ToBeCounted[i].Group + "--" + ToBeCounted[i].Sender] == null)
			{
				fc[ToBeCounted[i].UID + "--" + ToBeCounted[i].Group + "--" + ToBeCounted[i].Sender] = [];
			}

			if (fc[ToBeCounted[i].UID + "--" + ToBeCounted[i].Group + "--" + ToBeCounted[i].Sender][ToBeCounted[i].LayerDeep] == null)
			{
				fc[ToBeCounted[i].UID + "--" + ToBeCounted[i].Group + "--" + ToBeCounted[i].Sender][ToBeCounted[i].LayerDeep] = [];
			}

			if (fc[ToBeCounted[i].UID + "--" + ToBeCounted[i].Group + "--" + ToBeCounted[i].Sender][ToBeCounted[i].LayerDeep][ToBeCounted[i].HeadLevel] == null)
			{
				fc[ToBeCounted[i].UID + "--" + ToBeCounted[i].Group + "--" + ToBeCounted[i].Sender][ToBeCounted[i].LayerDeep][ToBeCounted[i].HeadLevel] = 1;
			}
			else
			{
				fc[ToBeCounted[i].UID + "--" + ToBeCounted[i].Group + "--" + ToBeCounted[i].Sender][ToBeCounted[i].LayerDeep][ToBeCounted[i].HeadLevel]++;
			}
		}

		// save global.fridayCounter to file
		fs.writeFileSync(babadata.datalocation + "/fridayCounter.json", JSON.stringify(fc));
	}

	textC = repeatCheck(cacheVersion, text);
	text = textC[0];
	if (textC[1].length > 0)
		condensedNotation += "*" + textC[1].join("*");

	return [text, condensedNotation, cnYung];
}

function replaceNested(cacheVersion, text, ToBeCounted = null, recrused = 0, headLevel = 0, authorID = 0)
{
	var replaced = true;
	// get from FridayLoops.json
	var path = babadata.datalocation + "/FridayLoops.json";

	if (cacheVersion != -1)
	{
		path = babadata.datalocation + "/FridayCache/FridayLoops" + cacheVersion + ".json";

		if (!fs.existsSync(path))
		{
			// return to normal cache
			cacheVersion = -1;
			path = babadata.datalocation + "/FridayLoops.json";
		}
	}

	let rawdata = fs.readFileSync(path);

	var replacements = JSON.parse(rawdata);

	if (replacements == null)
	{
		replaced = false;
	}

	while (replaced)
	{
		replaced = false;

		// loop throught replacements
		for (var i = 0; i < Object.keys(replacements).length; i++)
		{
			var key = Object.keys(replacements)[i];
			var value = replacements[key];

			var regex = new RegExp("\\[" + key + "\\]", "g");

			if (text.match(regex))
			{
				while (text.match(regex))
				{
					var numbo = Math.floor(theRNG.nextFloat() * value.length);
					text = text.replace("[" + key + "]", value[numbo].text);

					if (ToBeCounted != null)
					{
						TBDItem = { "UID": value[numbo].UID, "LayerDeep": recrused, "Group": 1, "Text": value[numbo].text, "HeadLevel": headLevel, "Sender": authorID};
						ToBeCounted.push(TBDItem);
					}
				}
				replaced = true;
			}
		}
	}

	return text;
}

function repeatCheck(cacheVersion, text, prefix = "")
{
	// new /friday option tag items go here:
	// {repeat:x:[Value]} - repeat the value x times
	// repeat is not case sensitive in the regex
	// regex: {[rR][eE][pP][eE][aA][tT][sSnN]?:(\d+):((.|\n)*)}
	// {repeat:5:[frog]} - frog frog frog frog frog
	// {repeat:3:[frog{repeat:2:[frog]}]} - start with outer repeat, then go inwards 

	var pf = "";
	if (prefix != "")
	{
		pf = "[" + prefix.toLowerCase() + prefix.toUpperCase() + "]";
	}

	var regexString = "{" + pf + "[rR][eE][pP][eE][aA][tT][sSnN]?:(\\d+):((.|\n)*?)(}+)";

	if (prefix == "b")
	{
		regexString =  "{" + pf + "[rR][eE][pP][eE][aA][tT][sSnN]?:(\\[(.*)\\]):((.|\n)*?)(}+)";
	}

	var RegexExpress = new RegExp(regexString, "g");
	var RegexExpress2 = new RegExp(regexString + ":", "g");
	var match = text.match(RegexExpress);
	var match2 = text.match(RegexExpress2);
	if (match2 != null) 
	{
		match = match2;
		match = match.map(x => x.slice(0, -1));
	}

	var counto = [];

	while (match != null)
	{
		for (var i = 0; i < match.length; i++)
		{
			var matchi = match[i];
			
			if (prefix == "b")
			{
				// get the middle value
				var middle = matchi.split(":")[1];
				var middle2 = replaceNested(cacheVersion, middle);
				matchi = matchi.replace(middle, middle2);
			}

			var num = parseInt(matchi.match(/\d+/)[0]);
			var valuesplit = matchi.split(":")
			// value is index 2 onwards
			var value = valuesplit.slice(2).join(":");
			value = value.slice(0, -1);

			var containsS = matchi.split(":")[0].toLowerCase().includes("s");
			var containsN = matchi.split(":")[0].toLowerCase().includes("n");

			// add num to counto
			counto.push(num + (containsS ? "s" : "") + (containsN ? "n" : ""));

			var newString = "";
			for (var j = 0; j < num; j++)
			{
				newString += value + (containsS ? " " : containsN ? "\n" : "");
			}

			text = text.replace(match[i], newString);
		}

		match = text.match(RegexExpress);
		match2 = text.match(RegexExpress2);
		if (match2 != null) 
		{
			match = match2;
			match = match.map(x => x.slice(0, -1));
		}
	}

	if (prefix == "b")
	{
		return text;
	}
	else
	{
		return [text, counto];
	}
}

function onlyLettersNumbers(text)
{
	// remove all non-alphanumeric characters
	text = text.replace(/[^a-zA-Z0-9]/g, '');

	if (text == "")
		// set to a random string of 1 to 10 characters
		text = theRNG.nextFloat().toString(36).substring(2, Math.floor(theRNG.nextFloat() * 10) + 2);

	return text;
}

function URLSafe(text)
{
	text = text.replaceAll(" ", "%20");
	text = text.replaceAll(":", "%3A");
	text = text.replaceAll("?", "%3F");
	text = text.replaceAll("!", "%21");
	text = text.replaceAll(";", "%3B");
	text = text.replaceAll("=", "%3D");
	text = text.replaceAll("&", "%26");
	text = text.replaceAll("#", "%23");
	text = text.replaceAll("/", "%2F");
	text = text.replaceAll("\\", "%5C");
	text = text.replaceAll("@", "%40");
	text = text.replaceAll("$", "%24");
	text = text.replaceAll("%", "%25");
	text = text.replaceAll("^", "%5E");
	text = text.replaceAll("*", "%2A");
	text = text.replaceAll("(", "%28");
	text = text.replaceAll(")", "%29");
	text = text.replaceAll("[", "%5B");
	text = text.replaceAll("]", "%5D");
	text = text.replaceAll("{", "%7B");
	text = text.replaceAll("}", "%7D");
	text = text.replaceAll("|", "%7C");
	text = text.replaceAll("<", "%3C");
	text = text.replaceAll(">", "%3E");
	text = text.replaceAll("`", "%60");
	text = text.replaceAll("~", "%7E");
	text = text.replaceAll("'", "%27");
	text = text.replaceAll("\"", "%22");

	return text;
}

function funnyFrogText(authorID)
{
	let path = babadata.datalocation + "/FROGcache.json";

	if (!fs.existsSync(path)) 
	{
		console.log("No FROGcache file found -- creating with local data");

		var opttemp = ["https://tenor.com/view/frog-funny-funny-frog-picmix-blingee-gif-25200067"]
		opttemp.push(opts2);
		
		var data = JSON.stringify(opttemp);
		
		fs.writeFileSync(babadata.datalocation + "/FROGcache.json", data);
	}

    let rawdata = fs.readFileSync(babadata.datalocation + "/FROGcache.json");

	var optionsFROG = JSON.parse(rawdata);

	if (typeof optionsFROG[0] != "string")
	{
		optionsFROG = generateOps(optionsFROG, authorID, "FROG");
	}

	var text = optionsFROG[Math.floor(Math.random() * optionsFROG.length)].text;

	return text;
}

function generateOps(opsArray, authorID, prefix)
{
    let rawdata = fs.readFileSync(babadata.datalocation + "/" + prefix + "control.json");
    var controlList = JSON.parse(rawdata);
	var cLevel = 0;

	for (var i = 0; i < controlList.length; i++)
	{
		if (controlList[i].ID == authorID)
		{
			cLevel = controlList[i].Control;
		}
	}
	
	ops = [];
	for (var i = 0; i < opsArray.length; i++)
	{
		if (opsArray[i].StartTime != null)
		{
			var tod = new Date();
			var st = new Date(opsArray[i].StartTime);

			if (opsArray[i].EndTime != null)
			{
				var et = new Date(opsArray[i].EndTime);
				var startNormalizedToYear = new Date(tod.getFullYear(), st.getMonth(), st.getDate());
				var endNormalizedToYear = new Date(tod.getFullYear(), et.getMonth(), et.getDate());

				if (tod < startNormalizedToYear || tod > endNormalizedToYear)
					continue;
			}
			else
			{
				var startNormalizedToYear = new Date(tod.getFullYear(), st.getMonth(), st.getDate());

				if (tod != startNormalizedToYear)
					continue;
			}
		}

		if (opsArray[i].DayOfWeek != null)
		{
			var tod = new Date();
			var dow = tod.getDay();

			if (opsArray[i].DayOfWeek != dow)
				continue;
		}

		if (opsArray[i].OccuranceChance < 100)
		{
			if (theRNG.nextRange() * 100 > opsArray[i].OccuranceChance)
				continue;
		}

		if (cLevel <= 1)
		{
			if (opsArray[i].enabledDef == true)
			{
				ops.push(opsArray[i]);
			}
		}

		if (cLevel >= 1)
		{
			if (opsArray[i].IDS != null && opsArray[i].IDS.toString().includes(authorID))
			{
				ops.push(opsArray[i]);
			}
		}
	}

	return ops;
}

function removeCountRuin(uid, g)
{
	g.members.fetch(uid).then(member => {
		member.roles.remove(babadata.countrole, "you are free to count!");
	});
}

module.exports = {
    funnyDOWTextSaved,
    funnyFrogText,
	removeCountRuin,
	resetRNG
};