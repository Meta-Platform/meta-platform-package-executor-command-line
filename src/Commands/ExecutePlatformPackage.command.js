const path = require("path")
const EventEmitter = require('events')

const ExecutePackage                 = require("../Helpers/ExecutePackage")
const CreateBinaryInterfaceViaSocket = require("../Helpers/CommunicationInterface/CreateBinaryInterfaceViaSocket")

const CreatePrintDataLog = require("../Helpers/CreatePrintDataLog")
const ReadJsonFile       = require("../Helpers/ReadJsonFile")

const DEPENDENCY_LIST = require("../Configs/dependencies.json")

const ExecutePlatformPackageCommand = async ({
    packageRelativePath,
    startupJsonFileRelativePath,
    platformParamsJsonFileRelativePath,
    nodejsProjectDependenciesRelativePath,
    awaitFirstConnectionWithLogStreaming
}) => {
    const packagePath                = path.resolve(process.cwd(), packageRelativePath)
    const startupJsonFilePath        = path.resolve(process.cwd(), startupJsonFileRelativePath)
    const platformParamsJsonFilePath = path.resolve(process.cwd(), platformParamsJsonFileRelativePath)

    const platformParams = ReadJsonFile(platformParamsJsonFilePath)
    const print = await CreatePrintDataLog(platformParams.ECO_DIRPATH_MAIN_REPO)

    const loggerEmitter = new EventEmitter()
    loggerEmitter.on("log", (dataLog) => print(dataLog))

    process.env.EXTERNAL_NODE_MODULES_PATH = 
        path.resolve(process.cwd(), nodejsProjectDependenciesRelativePath, "node_modules") 
    
    const { 
        ECO_DIRPATH_MAIN_REPO, 
        DAEMON_SOCKET_NAME,
        ECO_DIRPATH_INSTALL_DATA
     } = platformParams

    const communicationInterface = 
        await CreateBinaryInterfaceViaSocket({
            socketPath: path.join(ECO_DIRPATH_INSTALL_DATA, "sockets", DAEMON_SOCKET_NAME),
            ECO_DIRPATH_MAIN_REPO,
            DEPENDENCY_LIST,
            awaitFirstConnectionWithLogStreaming
        })

	loggerEmitter.on("log", (dataLog) => communicationInterface.SendLog(dataLog))
    
    const startupParams  = ReadJsonFile(startupJsonFilePath)

    const _Execute = async () => {
        await ExecutePackage({ 
            packagePath, 
            startupParams,
            platformParams,
            loggerEmitter,
            onChangeTaskList: (taskList) => communicationInterface.UpdateTaskList(taskList),
            DEPENDENCY_LIST
        })
        communicationInterface.NotifyRunning()
    }

    if(!awaitFirstConnectionWithLogStreaming){
       await _Execute()
    } else {
        communicationInterface
            .AddFirstRequestListener(async () => {
                await _Execute()
            })
    }
}

module.exports = ExecutePlatformPackageCommand