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

	/*
	 * TODO sinal que TERMINA o processo por padrão precisa estar aqui, senão o
	 * arquivo de socket sobrevive ao dono e vira lixo permanente no diretório de
	 * supervisão — cada órfão custa uma tentativa de reconexão a cada 4 s, para
	 * sempre, em todo processo que supervisiona o host.
	 *
	 * SIGHUP era o buraco mais fácil de cair: é o que chega quando o terminal
	 * que lançou a instância fecha, e a ação padrão dele é matar o processo sem
	 * passar por `exit`. SIGQUIT vem do Ctrl-\.
	 *
	 * O que continua fora do alcance de qualquer processo é SIGKILL, o OOM
	 * killer e a queda da máquina. Para esses, a limpeza é do supervisor:
	 * `CreateOrphanSocketReconciler`, no instance-supervisor.service.
	 */
	const SINAIS_DE_ENCERRAMENTO = ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGQUIT']

	SINAIS_DE_ENCERRAMENTO.forEach((sinal) => {
		process.on(sinal, () => {
			_CleanUpSocketFileSync()
			process.exit(0)
		})
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