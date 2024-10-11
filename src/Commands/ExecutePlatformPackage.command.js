const { resolve } = require("path")
const EventEmitter = require('events')

const ExecutePackage                 = require("../Helpers/ExecutePackage")
const CreateBinaryInterfaceViaSocket = require("../Helpers/CommunicationInterface/CreateBinaryInterfaceViaSocket")
const PrintDataLog                   = require("../Helpers/PrintDataLog")
const ReadJsonFile                   = require("../Helpers/ReadJsonFile")

const DEPENDENCY_LIST = require("../Configs/dependencies.json")

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

    if(awaitFirstConnectionWithLogStreaming && !supervisorSocket)
        throw "O parâmetro supervisorSocket é obrigatório caso awaitFirstConnectionWithLogStreaming seja true"

    const ecosystemDefaultParams = ReadJsonFile(ecosystemDefault)
    const { ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES } = ecosystemDefaultParams
    
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
            ecosystemData,
            DEPENDENCY_LIST
        })
        comInterface && comInterface.NotifyRunning()
    }

    if(!supervisorSocket){
       await _Execute()
    } else {

        const communicationInterface = 
            await CreateBinaryInterfaceViaSocket({
                supervisorSocket,
                ecosystemData,
                ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES,
                DEPENDENCY_LIST,
                awaitFirstConnectionWithLogStreaming
            })

            loggerEmitter.on("log", (dataLog) => communicationInterface.SendLog(dataLog))

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