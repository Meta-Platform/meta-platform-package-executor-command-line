const { spawn } = require('child_process')

const ExecuteDebugMode = (scriptPath, args) => {

    const debugProcess = spawn(
        'node',
        [
            '--inspect-brk',
            scriptPath,
            ...args
        ], {
        stdio: 'inherit'
    })

    debugProcess.on('error', (err) => {
        console.error(`Falha ao iniciar o processo de depuração: ${err.message}`)
    })

}


module.exports = ExecuteDebugMode