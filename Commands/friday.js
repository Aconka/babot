const { babaFriday } = require('../Functions/commandFunctions.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { removeCountRuin, functionPostFunnyDOW } = require("../Functions/HelperFunctions/slashFridayHelpers.js");
const { getD1 } = require("../Tools/overrides.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('friday')
		.setDescription('Friday :)'),
	async execute(interaction, bot) {
		await interaction.deferReply();
		var tod = getD1(); //get today
		if (tod.getDay() != 5)
		{
			if (Math.random() < .05)
			{
				await interaction.editReply(await babaFriday(true));
				var message = await interaction.fetchReply();

				setTimeout(function()
				{
					msgs = ["Haha, it's not Friday! Gottem!", "You thought it was Friday? Silly Buddy", "You got Kerpranked, it aint Friday"]
					message.channel.send({ content: msgs[Math.floor(Math.random() * msgs.length)] }).then(msg =>
					{
						interaction.deleteReply();
						setTimeout(function()
						{
							msg.delete();
						}, 5000);
					});
				}, 12000);
			}
			else
			{
				await functionPostFunnyDOW("interaction", interaction, 5);
			}
		}
		else
		{
			var guild = interaction.guild;
			removeCountRuin(interaction.user.id, guild);
			await interaction.editReply(await babaFriday());
		}
		
	},
};