const { resolve } = require("path")
const EventEmitter = require('events')

const ExecutePackage                 = require("../Helpers/ExecutePackage")
const CreateBinaryInterfaceViaSocket = require("../Helpers/CommunicationInterface/CreateBinaryInterfaceViaSocket")

const PrintDataLog = require("../Helpers/PrintDataLog")
const ReadJsonFile       = require("../Helpers/ReadJsonFile")

const DEPENDENCY_LIST = require("../Configs/dependencies.json")

const ExecutePlatformPackageCommand = async ({
    package,
    startupJson,
    ecosystemDefault,
    nodejsProjectDependencies,
    socket,
    ecosystemData,
    awaitFirstConnectionWithLogStreaming,
    executableName,
    commandLineArgs,
    verbose
}) => {

    if(awaitFirstConnectionWithLogStreaming && !socket)
        throw "O parâmetro socket é obrigatório caso awaitFirstConnectionWithLogStreaming seja true"

    currentWorkingDirectory = process.cwd()

    const ecosystemDefaultParams = ReadJsonFile(ecosystemDefault)

    const loggerEmitter = new EventEmitter()

    if(verbose) loggerEmitter.on("log", (dataLog) => PrintDataLog(dataLog))
    
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
            ecosystemData,
            loggerEmitter,
            onChangeTaskList: (taskList) => comInterface && comInterface.UpdateTaskList(taskList),
            DEPENDENCY_LIST
        })
        comInterface && comInterface.NotifyRunning()
    }

    if(!socket){
       await _Execute()
    } else {

        const communicationInterface = 
            await CreateBinaryInterfaceViaSocket({
                socket,
                ecosystemData,
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