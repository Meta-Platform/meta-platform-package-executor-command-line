const { join } = require("path")
const colors = require('colors')

const GetColorLogByStatus = require("./GetColorLogByStatus")

const CreateScriptLoader = require("../CreateScriptLoader")

const CreateTaskExecutorMachine = require("./CreateTaskExecutorMachine")
const GetApplicationExecutionParams = require("./GetApplicationExecutionParams")
const CreateDebounce = require("./CreateDebounce")
const GenerateEnvironmentName = require("./GenerateEnvironmentName")

const ExecutePackage = async ({ 
    packagePath, 
    commandLineArgs,
    executableName,
    startupParams,
    ecosystemData,
    loggerEmitter,
    onChangeTaskList,
    ecosystemDefaultParams
}) => 
    new Promise(async (resolve, reject) => {
        try{

            const {
                REPOS_CONF_FILENAME_REPOS_DATA,
                REPOS_CONF_EXT_MODULE_DIR,
                REPOS_CONF_EXT_LAYER_DIR,
                REPOS_CONF_EXT_GROUP_DIR,
                REPOS_CONF_EXTLIST_PKG_TYPE,
                PKG_CONF_DIRNAME_METADATA,
                ECOSYSTEMDATA_CONF_DIRNAME_EXECUTION_DATA_DIR,
                EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES,
                ECOSYSTEMDATA_CONF_FILENAME_PKG_GRAPH_DATA,
                ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES
            } = ecosystemDefaultParams

            const LoaderScript = await CreateScriptLoader({
                ecosystemData,
                REPOS_CONF_FILENAME_REPOS_DATA,
                ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES
            })

            const WriteObjectToFile      = LoaderScript("json-file-utilities.lib/src/WriteObjectToFile")
            const ResolvePackageName     = LoaderScript("resolve-package-name.lib/src/ResolvePackageName")
            const GetMetadataRootNode    = LoaderScript("metadata-hierarchy-handler.lib/src/GetMetadataRootNode")
            const TaskStatusTypes        = LoaderScript("task-executor.lib/src/TaskStatusTypes")
            const ListPackages           = LoaderScript("repository-utilities.lib/src/ListPackages")
            const BuildMetadataHierarchy = LoaderScript("dependency-graph-builder.lib/src/BuildMetadataHierarchy")
            const CreateEnvironment      = LoaderScript("environment-handler.lib/src/CreateEnvironment")
            const PrepareDataDir         = LoaderScript("environment-handler.lib/src/PrepareDataDir")
                
            const GetRootNamespace = (metadataHierarchy) => {
                const dependency = GetMetadataRootNode(metadataHierarchy)
                const { 
                    metadata:{
                        package:{
                            namespace
                        }
                    }
                } = dependency
                return namespace
            }
            
            const packageList = await ListPackages({
                installDataDirPath:ecosystemData,
                REPOS_CONF_FILENAME_REPOS_DATA,
                REPOS_CONF_EXT_MODULE_DIR,
                REPOS_CONF_EXT_LAYER_DIR,
                REPOS_CONF_EXT_GROUP_DIR,
                REPOS_CONF_EXTLIST_PKG_TYPE 
            })
    
            const metadataHierarchy = await BuildMetadataHierarchy({
                path: packagePath,
                startupParams,
                packageList,
                REPOS_CONF_EXT_GROUP_DIR,
                PKG_CONF_DIRNAME_METADATA
            })
        
            const namespace       = GetRootNamespace(metadataHierarchy)
            const packageName     = ResolvePackageName(namespace)
            const environmentName = GenerateEnvironmentName(packageName, packagePath)

            const localPath = join(ecosystemData, ECOSYSTEMDATA_CONF_DIRNAME_EXECUTION_DATA_DIR)
    
            const environmentPath = await CreateEnvironment({
                environmentName, 
                localPath,
                loggerEmitter
            })
        
            await PrepareDataDir({
                environmentPath, 
                EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES, 
                loggerEmitter
            })
    
            await WriteObjectToFile(join(environmentPath, ECOSYSTEMDATA_CONF_FILENAME_PKG_GRAPH_DATA), metadataHierarchy)
    
            const applicationExecutionParams = await GetApplicationExecutionParams({
                environmentPath,
                metadataHierarchy,
                commandLineArgs,
                executableName,
                REPOS_CONF_FILENAME_REPOS_DATA,
                EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES,
                ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES,
                ecosystemData
            })
    
            const startupTaskExecutorMachine = await CreateTaskExecutorMachine({
                ecosystemData,
                REPOS_CONF_FILENAME_REPOS_DATA,
                ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES
            })
    
            const GetFormattedMessage = (taskId, status, objectLoaderType) => {
                return `[${taskId}] [${objectLoaderType}] ${colors[GetColorLogByStatus(status)](status)}`
            }
    
            const CheckIfThePackageIsWorking = () => {
                const taskList = startupTaskExecutorMachine.ListTasks()
                const isError = taskList.filter(({status}) => status === TaskStatusTypes.FAILURE).length > 0
                if(!isError){
                    const isWorking = taskList.reduce((isWorkingAcc, {status}) => {
                        if(isWorkingAcc)
                            return TaskStatusTypes.ACTIVE === status || TaskStatusTypes.FINISHED === status
                        return isWorkingAcc
                    }, true)
        
                    if(isWorking)
                        resolve()
                } else {
                    reject()
                }
            }
    
            const DebouncedCheckIfThePackageIsWorking = CreateDebounce(CheckIfThePackageIsWorking, 2000)
    
            startupTaskExecutorMachine
                .AddTaskStatusListener(({taskId, status, objectLoaderType}) => {
                    loggerEmitter && loggerEmitter.emit("log", {
                        sourceName: "TaskExecutor",
                        type: "info",
                        message: GetFormattedMessage(taskId, status, objectLoaderType)
                    })
                    onChangeTaskList && onChangeTaskList(startupTaskExecutorMachine.ListTasks())
                    if(
                        TaskStatusTypes.ACTIVE === status ||
                        TaskStatusTypes.FINISHED === status ||
                        TaskStatusTypes.FAILURE === status
                    ){
                        DebouncedCheckIfThePackageIsWorking()
                    }
                })
    
            startupTaskExecutorMachine.CreateTasks(applicationExecutionParams)
        }catch(e){
            loggerEmitter && loggerEmitter.emit("log", {
                sourceName: "ExecutePackage",
                type: "error",
                message: e
            })

            throw e
        }
    })

module.exports = ExecutePackage