const EventEmitter = require('node:events')
const grpc = require('@grpc/grpc-js')
const protoLoader = require('@grpc/proto-loader')
const path = require("path")

const CreateScriptLoader = require("../CreateScriptLoader")

const SetupSocketFileRemovalOnShutdown = require("./SetupSocketFileRemovalOnShutdown")
const ConvertObjectToProtoStruct = require("./ConvertObjectToProtoStruct")

const FIRST_CONNECTION_EVENT = Symbol()
const LOG_EVENT = Symbol()
const EXECUTION_STATUS_EVENT = Symbol()

const GetAgentLinkRulesResponse = (agentLinkRules) => {
	return agentLinkRules.map( rule => {
		return {
			...rule,
			requirement: ConvertObjectToProtoStruct(rule.requirement)
		}
	} )
}

const GetTaskInformationResponse = (taskInformation) => {
	const response =  {
		...taskInformation,
		...taskInformation.pTaskId          ? { pTaskId: {value: taskInformation.pTaskId} }                                       : {},
		...taskInformation.staticParameters ? { staticParameters: ConvertObjectToProtoStruct(taskInformation.staticParameters) }  : {},
		...taskInformation.activationRules  ? { activationRules: ConvertObjectToProtoStruct(taskInformation.activationRules) }    : {},
		...taskInformation.agentLinkRules   ? { agentLinkRules: GetAgentLinkRulesResponse(taskInformation.agentLinkRules) }       : {},
		...taskInformation.linkedParameters ? { linkedParameters: ConvertObjectToProtoStruct(taskInformation.linkedParameters), } : {}
	}
	return response
}

const KillProcess = () => process.exit()


const CreateBinaryInterfaceViaSocket = async ({
	supervisorSocket,
	ecosystemData,
	ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES,
	REPOS_CONF_FILENAME_REPOS_DATA,
	awaitFirstConnectionWithLogStreaming=false,
	startupArgumentsResponse
}) => {

	const PROTO_PATH = path.join(__dirname, "./IDL/PackageExecutorRPCSpec.proto")

	const PackageExecutorRPCSDefinition = protoLoader
	.loadSync(PROTO_PATH, {
		keepCase: true,
		longs: String,
		enums: String,
		defaults: true,
		oneofs: true,
	})
	
	const PackageExecutorGrpcObject = grpc
		.loadPackageDefinition(PackageExecutorRPCSDefinition)

	const LoaderScript = await CreateScriptLoader({
		ecosystemData,
		REPOS_CONF_FILENAME_REPOS_DATA,
		ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES
	})

	const FormatTaskForOutput = LoaderScript("utilities.lib/src/FormatTaskForOutput")
	const GetTaskInformation = LoaderScript("utilities.lib/src/GetTaskInformation")

	let firstFirstRequest = false
	let status = awaitFirstConnectionWithLogStreaming ? "WAITING_FOR_FIRST_CONNECTION" : "STARTING"
	let error = undefined
	let taskList = []
	const server = new grpc.Server()
	const PackageExecutorRPCService = PackageExecutorGrpcObject.PackageExecutorRPCSpec.PackageExecutorRPCService.service
	const eventEmitter = new EventEmitter()
	SetupSocketFileRemovalOnShutdown(supervisorSocket)

	const GetStatus = (call, callback) => callback(null, { status })

	  const ListTasks = (call, callback) => {
		try{
			const _taskList = taskList.map((task) => {
				const formattedTask = FormatTaskForOutput(task)
				return {
				  ...formattedTask,
				  pTaskId: formattedTask.pTaskId && { value: formattedTask.pTaskId },
				  staticParameters: ConvertObjectToProtoStruct(formattedTask.staticParameters),			  
				}
			  })
			  callback(null, { tasksList: _taskList })
		}catch(e){
			console.log(e)
		}
	  }

	const RegisterFirstResquest = () => {
		if(!firstFirstRequest){
			firstFirstRequest=true
			eventEmitter.emit(FIRST_CONNECTION_EVENT)
		}
	}

	const GetTask = (call, callback) => {
		const taskId = call.request.taskId
		const task = taskList.find((task) => taskId === task.taskId)
		const taskInformation = GetTaskInformation(task)
		const taskInformationResponse = GetTaskInformationResponse(taskInformation)
		if (task) {
			callback(null, taskInformationResponse)
		} else {
			callback(new Error('Task not found'), null)
		}
	}

	const GetStartupArguments = (call, callback) => {
		callback(null, startupArgumentsResponse)
	}

	const LogStreaming = (call) => {
		RegisterFirstResquest()

		const Handle = dataLog => call.write(dataLog)
		eventEmitter.on(LOG_EVENT, Handle)
		call.on('end', () => {
            call.end()
			eventEmitter.removeListener(LOG_EVENT, Handle)
        })
	}

	const StatusChangeNotification = (call) => {
		const Handle = status => call.write({ status })
		eventEmitter.on(EXECUTION_STATUS_EVENT, Handle)
		call.on('end', () => {
            call.end()
			eventEmitter.removeListener(EXECUTION_STATUS_EVENT, Handle)
        })
	}

	const GetProcessInformation = (call, callback) => {
		const {
			pid,
			platform,
			arch
		} = process

		callback(null, {
			pid,
			platform,
			arch
		})
	}


	server.addService(PackageExecutorRPCService,
		{
			Kill: KillProcess,
			GetStatus,
			ListTasks,
			GetTask,
			LogStreaming,
			StatusChangeNotification,
			GetStartupArguments,
			GetProcessInformation
		})

	server.bindAsync(`unix:${supervisorSocket}`,
		grpc.ServerCredentials.createInsecure(),
		(error) => {
			if (error) {
				console.error(error)
				return
			}
		})

	const ChangeStatus = (_status, err) => {
		status = _status
		error = err
		eventEmitter.emit(EXECUTION_STATUS_EVENT, status)
	}

	const NotifyRunning = () => ChangeStatus("RUNNING")
	const NotifyError = (err) => ChangeStatus("RUNNING", err)

	const UpdateTaskList = (_taskList) => {
		taskList = _taskList
	}

	const SendLog = (dataLog) => {
		eventEmitter.emit(LOG_EVENT, dataLog)
	}

	const AddFirstRequestListener = (f) =>
		eventEmitter
			.on(FIRST_CONNECTION_EVENT, () => f())

	return {
		SendLog,
		NotifyRunning,
		NotifyError,
		UpdateTaskList,
		AddFirstRequestListener
	}
}

module.exports = CreateBinaryInterfaceViaSocket