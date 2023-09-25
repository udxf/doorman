/** @type {import('discord.js').ApplicationCommand} */
module.exports = {
	type: 2,
	name: 'Close for User',
	execute: require('./close').execute
}