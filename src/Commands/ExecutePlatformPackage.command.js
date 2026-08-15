const { resolve } = require("path")
const ExecutePackage                 = require("../Helpers/ExecutePackage")
const CreateBinaryInterfaceViaSocket = require("../Helpers/CommunicationInterface/CreateBinaryInterfaceViaSocket")
const ReadJsonFile                   = require("../Helpers/ReadJsonFile")
const InstallLogger                  = require("../Helpers/InstallLogger")
const InstallTypeScriptResolution    = require("../Helpers/InstallTypeScriptResolution")

const ConvertInstanceArgsToArgsResponse = (instanceArguments) => {
    
    const _CreateChunkValid = (argumentName, value) => value ? {[argumentName]: value} : {}
    
    return {
        packagePath                  : instanceArguments.package,
        startupJsonFilePath          : instanceArguments.startupJson,
        ecosystemDefaultJsonFilePath : instanceArguments.ecosystemDefault,
        nodejsProjectDependencies    : instanceArguments.nodejsProjectDependencies,
        verbose                      : instanceArguments.verbose,
        ecosystemDataPath            : instanceArguments.ecosystemData,
        ..._CreateChunkValid("supervisorSocketPath", instanceArguments.supervisorSocket),
        ..._CreateChunkValid("executableName", instanceArguments.executableName),
        ..._CreateChunkValid("commandLineArgs", instanceArguments.commandLineArgs)
    }
}

const ExecutePlatformPackageCommand = async ({
    package,
    startupJson,
    ecosystemDefault,
    nodejsProjectDependencies,
    supervisorSocket,
    ecosystemData,
    awaitFirstConnectionWithLogStreaming,
    executableName,
    commandLineArgs,
    verbose
}) => {
    if(!ecosystemDefault)
        throw "O parâmetro ecosystemDefault é obrigatório"

    if(awaitFirstConnectionWithLogStreaming && !supervisorSocket)
        throw "O parâmetro supervisorSocket é obrigatório caso awaitFirstConnectionWithLogStreaming seja true"

    const ecosystemDefaultParams = ReadJsonFile(ecosystemDefault)
    const { 
        ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES,
        REPOS_CONF_FILENAME_REPOS_DATA
     } = ecosystemDefaultParams
    
    process.env.EXTERNAL_NODE_MODULES_PATH =
        resolve(nodejsProjectDependencies, "node_modules")

    /*
     * Primeira coisa a acontecer com o repositório instalado: a partir daqui
     * `require` sem extensão encontra `.ts`. Precede o logger porque a própria
     * `logger.lib` pode ser TypeScript. Ver source-language-standard.md.
     */
    await InstallTypeScriptResolution({
        ecosystemData,
        ecosystemDefaultParams,
        verbose
    })

    /*
     * Antes de qualquer execução: o package-executor é o ponto por onde TODO
     * pacote sobe, então é aqui que `globalThis.Log` passa a existir para o
     * processo inteiro. Depende do EXTERNAL_NODE_MODULES_PATH acima (o sink de
     * terminal resolve o `colors` por ele) e precisa vir antes da interface de
     * supervisão, que também embrulha o `console.log`.
     */
    await InstallLogger({
        packagePath : package,
        ecosystemData,
        ecosystemDefaultParams,
        verbose
    })

    const startupParams  = ReadJsonFile(startupJson)

    const _Execute = async (comInterface) => {
        await ExecutePackage({ 
            packagePath:package, 
            commandLineArgs,
            executableName,
            startupParams,
            ecosystemDefaultParams,
            onChangeTaskList: (taskList) => comInterface && comInterface.UpdateTaskList(taskList),
            ecosystemData
        })
        comInterface && comInterface.NotifyRunning()
    }

    if(!supervisorSocket){
       await _Execute()
    } else {

        const instanceArguments = {
            package,
            startupJson,
            ecosystemDefault,
            nodejsProjectDependencies,
            supervisorSocket,
            ecosystemData,
            awaitFirstConnectionWithLogStreaming,
            executableName,
            commandLineArgs,
            verbose
        }
        
        const communicationInterface = 
            await CreateBinaryInterfaceViaSocket({
                supervisorSocket,
                ecosystemData,
                awaitFirstConnectionWithLogStreaming,
                ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES,
                REPOS_CONF_FILENAME_REPOS_DATA,
                startupArgumentsResponse: ConvertInstanceArgsToArgsResponse(instanceArguments)
            })

            const originalLog = console.log;

            console.log = function (...args) {
                communicationInterface.SendLog({
                    sourceName: "ExecutePlatformPackageCommand",
                    type: "stdout",
                    message: args.join(" "),
                })
                originalLog.apply(console, args)
            }


            if(awaitFirstConnectionWithLogStreaming){
                communicationInterface
                .AddFirstRequestListener(async () => {
                    await _Execute(communicationInterface)
                })
            } else {
                await _Execute(communicationInterface)
            }
            
    }
}

module.exports = ExecutePlatformPackageCommand
