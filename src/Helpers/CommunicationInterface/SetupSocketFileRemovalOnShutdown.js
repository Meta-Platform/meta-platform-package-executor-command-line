const fs = require('fs')

const SetupSocketFileRemovalOnShutdown = () => {

	const _CleanUpSocketFileSync = () => {
		try {
			if (fs.existsSync(process.env.SOCKET_PATH)) {
				fs.unlinkSync(process.env.SOCKET_PATH)
			}
		} catch (error) {}
	}

	process.on('exit', _CleanUpSocketFileSync)
	process.on('SIGINT', () => {
		_CleanUpSocketFileSync()
		process.exit(0)
	})
	process.on('SIGTERM', () => {
		_CleanUpSocketFileSync()
		process.exit(0)
	})
	process.on('uncaughtException', (err) => {
		console.error('Houve uma exceção não capturada:', err)
		_CleanUpSocketFileSync()
		process.exit(1)
	})

}

module.exports = SetupSocketFileRemovalOnShutdown