const { join } = require("path")
const colors = require('colors')

const GetColorLogByStatus = require("./GetColorLogByStatus")

const CreateScriptLoader = require("../CreateScriptLoader")

const CreateTaskExecutorMachine = require("./CreateTaskExecutorMachine")
const GetApplicationExecutionParams = require("./GetApplicationExecutionParams")
const CreateDebounce = require("./CreateDebounce")
const GenerateEnvironmentName = require("./GenerateEnvironmentName")
const GetIsolateExecutionParameters = require("./GetIsolateExecutionParameters")

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

            // Recursos declarados (socket-params/storage-params). Carregado de
            // forma tolerante porque o binário e o EssentialRepo instalado são
            // atualizados em momentos diferentes: com um repo anterior à lib, o
            // executor continua subindo pacotes — só não resolve recurso, e o
            // caminho literal do startup-params.json segue valendo.
            const _TryLoad = (uri) => { try { return LoaderScript(uri) } catch(e) { return undefined } }
            const ApplyResourceParamsToHierarchy = _TryLoad("resource-params-handler.lib/src/ApplyResourceParamsToHierarchy")
            const EnsureResources                = _TryLoad("resource-params-handler.lib/src/EnsureResources")

            const WriteObjectToFile      = LoaderScript("json-file-utilities.lib/src/WriteObjectToFile")
            const ResolvePackageName     = LoaderScript("resolve-package-name.lib/src/ResolvePackageName")
            const GetMetadataRootNode    = LoaderScript("metadata-hierarchy-handler.lib/src/GetMetadataRootNode")
            const TaskStatusTypes        = LoaderScript("task-executor.lib/src/TaskStatusTypes")
            const ListPackages           = LoaderScript("repository-utilities.lib/src/ListPackages")
            const BuildMetadataHierarchy = LoaderScript("dependency-graph-builder.lib/src/BuildMetadataHierarchy")
            const CreateEnvironment      = LoaderScript("environment-handler.lib/src/CreateEnvironment")
            const PrepareDataDir         = LoaderScript("environment-handler.lib/src/PrepareDataDir")
            const AssertPackageTypeEnabled = LoaderScript("repository-utilities.lib/src/AssertPackageTypeEnabled")

            // Gate de tipos (MPTL-18): recusa o pacote se o seu tipo não estiver habilitado
            // pelos repositórios instalados (whitelist derivada), com mensagem clara.
            AssertPackageTypeEnabled({
                packagePath,
                installDataDirPath: ecosystemData,
                REPOS_CONF_FILENAME_REPOS_DATA
            })
                
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
    
            // Injeta o ecosystem-defaults como BASE do startupParams: os {{VAR}}
            // do boot.json de qualquer pacote passam a resolver a partir da
            // config do ecossistema, sem precisar de literal no startup-params.
            // O startup-params próprio do pacote sobrepõe (port/socket/serverName),
            // e o merge por-nó do BuildMetadataHierarchy preserva o de cada nó.
            // Este é o ponto de injeção UNIVERSAL: todo pacote sobe por aqui.
            // Recursos declarados são resolvidos DEPOIS do build: o merge por-nó
            // acima faz o startup-params.json do pacote sobrepor a base injetada,
            // então o recurso só é fonte da verdade se vier por último. As pastas
            // são materializadas aqui, antes de qualquer tarefa começar.
            const _ResolveDeclaredResources = (metadataHierarchy) => {

                if(!ApplyResourceParamsToHierarchy) return metadataHierarchy

                const {
                    ECOSYSTEMDATA_CONF_DIRNAME_UNIX_SOCKET_DIR,
                    ECOSYSTEMDATA_CONF_DIRNAME_SUPERVISOR_UNIX_SOCKET_DIR,
                    ECOSYSTEMDATA_CONF_DIRNAME_STORAGE_DIR
                } = ecosystemDefaultParams

                const resolved = ApplyResourceParamsToHierarchy({
                    metadataHierarchy,
                    installDataDirPath: ecosystemData,
                    ECOSYSTEMDATA_CONF_DIRNAME_UNIX_SOCKET_DIR,
                    ECOSYSTEMDATA_CONF_DIRNAME_SUPERVISOR_UNIX_SOCKET_DIR,
                    ECOSYSTEMDATA_CONF_DIRNAME_STORAGE_DIR
                })

                EnsureResources(resolved.resources)

                resolved.resources
                    .filter(({ owner }) => owner)
                    .forEach(({ kind, parameter, path }) => loggerEmitter && loggerEmitter.emit("log", {
                        sourceName: "ExecutePackage",
                        type: "info",
                        message: `${kind} ${parameter} → ${path}`
                    }))

                return resolved.metadataHierarchy
            }

            const metadataHierarchy = _ResolveDeclaredResources(await BuildMetadataHierarchy({
                path: packagePath,
                startupParams: { ...ecosystemDefaultParams, ...startupParams },
                packageList,
                REPOS_CONF_EXT_GROUP_DIR,
                PKG_CONF_DIRNAME_METADATA
            }))
        
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
            const isolatedExecutionParameters = GetIsolateExecutionParameters(applicationExecutionParams, {environmentPath})
            startupTaskExecutorMachine.CreateTasks(isolatedExecutionParameters)
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