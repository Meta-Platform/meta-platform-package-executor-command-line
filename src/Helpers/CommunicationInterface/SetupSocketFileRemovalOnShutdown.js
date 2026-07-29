const fs = require('fs')

const SetupSocketFileRemovalOnShutdown = (socketFilePath) => {

	const _CleanUpSocketFileSync = () => {
		try {
			if (fs.existsSync(socketFilePath)) {
				fs.unlinkSync(socketFilePath)
			}
		} catch (error) {}
	}

	/* Registra a exceção original sem jamais lançar: se o `Log` global não
	 * existir (ou falhar), sobra o stderr, que não pode faltar. */
	const _ReportFatalError = (err) => {
		try {
			if (globalThis.Log && typeof globalThis.Log.fatal === "function") {
				globalThis.Log.fatal("SetupSocketFileRemovalOnShutdown", 'Houve uma exceção não capturada:', err)
				return
			}
		} catch (error) {}

		try {
			process.stderr.write(`[SetupSocketFileRemovalOnShutdown] Houve uma exceção não capturada: ${(err && err.stack) || err}\n`)
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
	/*
	 * Handler de última instância: a limpeza do socket é a obrigação deste
	 * módulo, o log é acessório. Por isso a ordem é limpar PRIMEIRO e só depois
	 * registrar — e o registro nunca pode derrubar o processo por conta própria.
	 *
	 * `globalThis.Log` é instalado pelo package-executor a partir da
	 * `logger.lib`, mas essa instalação pode falhar (EssentialRepo anterior à
	 * lib) e o processo segue sem ele. Um handler que assume o `Log` transforma
	 * qualquer exceção não capturada num `ReferenceError` e esconde a causa
	 * original.
	 */
	process.on('uncaughtException', (err) => {
		_CleanUpSocketFileSync()
		_ReportFatalError(err)
		process.exit(1)
	})

}

module.exports = SetupSocketFileRemovalOnShutdown