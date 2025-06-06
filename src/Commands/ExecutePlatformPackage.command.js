const { resolve } = require("path")
const EventEmitter = require('events')

const ExecutePackage                 = require("../Helpers/ExecutePackage")
const CreateBinaryInterfaceViaSocket = require("../Helpers/CommunicationInterface/CreateBinaryInterfaceViaSocket")
const PrintDataLog                   = require("../Helpers/PrintDataLog")
const ReadJsonFile                   = require("../Helpers/ReadJsonFile")

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
    const loggerEmitter = new EventEmitter()
    if(verbose) loggerEmitter.on("log", (dataLog) => PrintDataLog(dataLog))

    console.log(ecosystemDefault)
    
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

    const startupParams  = ReadJsonFile(startupJson)

    const _Execute = async (comInterface) => {
        await ExecutePackage({ 
            packagePath:package, 
            commandLineArgs,
            executableName,
            startupParams,
            ecosystemDefaultParams,
            loggerEmitter,
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
