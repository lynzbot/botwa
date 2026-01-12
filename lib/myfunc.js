const chalk = require('chalk')
const fs = require('fs')


exports.sleep = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}


let file = require.resolve(__filename)
fs.watchFile(file, () => {
	fs.unwatchFile(file)
	console.log(chalk.redBright(`Update ${__filename}`))
	delete require.cache[file]
	require(file)
})
