const { resolve } = require("path")
const EventEmitter = require('events')

const ExecutePackage                 = require("../Helpers/ExecutePackage")
const CreateBinaryInterfaceViaSocket = require("../Helpers/CommunicationInterface/CreateBinaryInterfaceViaSocket")

const PrintDataLog = require("../Helpers/PrintDataLog")
const ReadJsonFile       = require("../Helpers/ReadJsonFile")

const DEPENDENCY_LIST = require("../Configs/dependencies.json")

const ExecutePlatformPackageCommand = async ({
    packageRelativePath,
    startupJsonFileRelativePath,
    platformParamsJsonFileRelativePath,
    nodejsProjectDependenciesRelativePath,
    socketRelativePath,
    awaitFirstConnectionWithLogStreaming,
    executableName,
    commandLineArgs,
    verbose
}) => {

    if(awaitFirstConnectionWithLogStreaming && !socketRelativePath)
        throw "O parâmetro socketPath é obrigatório caso awaitFirstConnectionWithLogStreaming seja true"

    currentWorkingDirectory = process.cwd()

    const packagePath                = resolve(currentWorkingDirectory, packageRelativePath)
    const startupJsonFilePath        = resolve(currentWorkingDirectory, startupJsonFileRelativePath)
    const platformParamsJsonFilePath = resolve(currentWorkingDirectory, platformParamsJsonFileRelativePath)
    const socketPath                 = socketRelativePath && resolve(currentWorkingDirectory, socketRelativePath)

    const platformParams = ReadJsonFile(platformParamsJsonFilePath)

    const loggerEmitter = new EventEmitter()

    if(verbose) loggerEmitter.on("log", (dataLog) => PrintDataLog(dataLog))
    
    process.env.EXTERNAL_NODE_MODULES_PATH = 
        resolve(currentWorkingDirectory, nodejsProjectDependenciesRelativePath, "node_modules")

    const startupParams  = ReadJsonFile(startupJsonFilePath)

    const _Execute = async (comInterface) => {
        await ExecutePackage({ 
            packagePath, 
            commandLineArgs,
            executableName,
            startupParams,
            platformParams,
            loggerEmitter,
            onChangeTaskList: (taskList) => comInterface && comInterface.UpdateTaskList(taskList),
            DEPENDENCY_LIST
        })
        comInterface && comInterface.NotifyRunning()
    }

    if(!socketPath){
       await _Execute()
    } else {
        const { 
            ECO_DIRPATH_MAIN_REPO
         } = platformParams

        const communicationInterface = 
            await CreateBinaryInterfaceViaSocket({
                socketPath,
                ECO_DIRPATH_MAIN_REPO,
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