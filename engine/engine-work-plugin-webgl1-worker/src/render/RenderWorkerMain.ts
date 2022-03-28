import { state as meta3dState } from "meta3d-type"
import { getWorkPluginContribute } from "./Main";
import { prepare as prepareMeta3D, registerExtension, getExtensionService, getExtensionState, setExtensionState } from "meta3d"
import { prepare as prepareEngine, init as initEngine, update as updateEngine, render as renderEngine } from "engine-facade/src/DirectorAPI"
import { state as engineCoreState } from "meta3d-engine-core-protocol/src/state/StateType"
import { service as engineCoreService } from "meta3d-engine-core-protocol/src/service/ServiceType"
import { service as mostService } from "meta3d-bs-most-protocol/src/service/ServiceType"
import { service as webgl1Service } from "meta3d-webgl1-protocol/src/service/ServiceType"
import { service as immutableService } from "meta3d-immutable-protocol/src/service/ServiceType"
import { getExtensionService as getWebGL1ExtensionService, createExtensionState as createWebGL1ExtensionState } from "meta3d-webgl1"
import { getExtensionService as getRegisterECSWorkerExtensionService, createExtensionState as createRegisterECSWorkerExtensionState } from "meta3d-register-ecs-worker"
import { getExtensionService as getImmutableExtensionService, createExtensionState as createImmutableExtensionState } from "meta3d-immutable"
import { service as registerECSWorkerService } from "meta3d-register-ecs-worker-protocol/src/service/ServiceType"
import { nullable } from "meta3d-commonlib-ts/src/nullable";
import { getExn } from "meta3d-commonlib-ts/src/NullableUtils";
import { getWorkPluginContribute as getWebGL1GetGLWorkPluginContribute } from "meta3d-work-plugin-webgl1-creategl/src/Main"
import { workPluginName } from "engine-work-plugin-webgl1-worker-render-protocol"
import { getWorkPluginContribute as getWebGL1DetectGLWorkPluginContribute } from "meta3d-work-plugin-webgl1-detectgl/src/Main"
import { getWorkPluginContribute as getWebGL1GeometryWorkPluginContribute } from "meta3d-work-plugin-webgl1-geometry/src/Main"
import { getWorkPluginContribute as getWebGL1MaterialWorkPluginContribute } from "meta3d-work-plugin-webgl1-material/src/Main"
import { componentName as geometryComponentName, dataName as geometryDataName } from "meta3d-component-geometry-worker-protocol";

function _getEngineCoreExtensionName(): string {
	return "meta3d-engine-core"
}

function _getMeta3DBsMostExtensionName(): string {
	return "meta3d-bs-most"
}

function _getMeta3DWebGL1ExtensionName(): string {
	return "meta3d-webgl1"
}

function _getMeta3DRegisterECSWorkerExtensionName(): string {
	return "meta3d-register-ecs-worker"
}

function _getMeta3DImmutableExtensionName(): string {
	return "meta3d-immutable"
}

function _registerWorkPlugins(engineCoreState: engineCoreState, isDebug: boolean, meta3dState: meta3dState) {
	let { registerWorkPlugin } = getExtensionService<engineCoreService>(meta3dState, _getEngineCoreExtensionName())
	let mostService: mostService = getExtensionService(meta3dState, _getMeta3DBsMostExtensionName())
	let webgl1Service: webgl1Service = getExtensionService(meta3dState, _getMeta3DWebGL1ExtensionName())
	let engineCoreService: engineCoreService = getExtensionService(meta3dState, _getEngineCoreExtensionName())
	let registerECSService: registerECSWorkerService = getExtensionService(meta3dState, _getMeta3DRegisterECSWorkerExtensionName())
	let immutableService: immutableService = getExtensionService(meta3dState, _getMeta3DImmutableExtensionName())

	engineCoreState =
		engineCoreService.registerWorkPlugin(
			engineCoreState,
			getWebGL1GetGLWorkPluginContribute({ mostService, webgl1Service, workPluginWhichHasCanvasName: workPluginName }),
			[
				{
					pipelineName: "init",
					insertElementName: "get_init_render_data",
					insertAction: "after"
				}
			]
		)
	engineCoreState =
		registerWorkPlugin(
			engineCoreState,
			getWebGL1DetectGLWorkPluginContribute({ mostService, webgl1Service }),
			[
				{
					pipelineName: "init",
					insertElementName: "create_gl_webgl1_creategl_meta3d",
					insertAction: "after"
				}
			]
		)
	engineCoreState =
		registerWorkPlugin(
			engineCoreState,
			getWebGL1GeometryWorkPluginContribute({
				mostService, webgl1Service, engineCoreService, immutableService, workPluginWhichHasAllGeometryIndicesName: workPluginName, geometryData: {
					componentName: geometryComponentName,
					verticesDataName: geometryDataName.vertices,
					indicesDataName: geometryDataName.indices
				}
			}),
			[
				{
					pipelineName: "init",
					insertElementName: "register_ecs",
					insertAction: "after"
				}
			]
		)
	engineCoreState =
		registerWorkPlugin(
			engineCoreState,
			getWebGL1MaterialWorkPluginContribute({
				mostService, webgl1Service, engineCoreService, immutableService, workPluginWhichHasAllMaterialIndicesName: workPluginName
			}),
			[
				{
					pipelineName: "init",
					insertElementName: "register_ecs",
					insertAction: "after"
				}
			]
		)
	engineCoreState =
		registerWorkPlugin(
			engineCoreState,
			getWorkPluginContribute({ isDebug, mostService, webgl1Service, engineCoreService, registerECSService, immutableService }),
			[
				{
					pipelineName: "init",
					insertElementName: "init_root_meta3d",
					insertAction: "after"
				},
				{
					pipelineName: "render",
					insertElementName: "render_root_meta3d",
					insertAction: "after"
				}
			]
		)

	return engineCoreState
}

function _init(meta3dState: meta3dState, isDebug: boolean) {
	meta3dState =
		registerExtension(
			meta3dState,
			_getMeta3DWebGL1ExtensionName(),
			getWebGL1ExtensionService,
			null,
			createWebGL1ExtensionState()
		)

	meta3dState =
		registerExtension(
			meta3dState,
			_getMeta3DRegisterECSWorkerExtensionName(),
			getRegisterECSWorkerExtensionService,
			null,
			createRegisterECSWorkerExtensionState()
		)
	meta3dState =
		registerExtension(
			meta3dState,
			_getMeta3DImmutableExtensionName(),
			getImmutableExtensionService,
			null,
			createImmutableExtensionState()
		)


	let engineCoreState = getExtensionState<engineCoreState>(meta3dState, _getEngineCoreExtensionName())

	engineCoreState = _registerWorkPlugins(engineCoreState, isDebug, meta3dState)

	meta3dState = setExtensionState(meta3dState, _getEngineCoreExtensionName(), engineCoreState)

	return initEngine(meta3dState, _getEngineCoreExtensionName()).then((meta3dState) => {
		console.log("finish init engine")

		return meta3dState
	})
}


let isDebug = true

let tempMeta3DState: nullable<meta3dState> = null

function _render(meta3dState: meta3dState) {
	// updateEngine(meta3dState, _getEngineCoreExtensionName()).then((meta3dState) => {
	// 	renderEngine(meta3dState, _getEngineCoreExtensionName()).then((meta3dState) => {
	// 		tempMeta3DState = meta3dState
	// 	})
	// })

	renderEngine(meta3dState, _getEngineCoreExtensionName()).then((meta3dState) => {
		tempMeta3DState = meta3dState
	})
}

let meta3dState_ = prepareMeta3D()

meta3dState_ = prepareEngine(
	meta3dState_,
	_getEngineCoreExtensionName(),
	isDebug
)


let mostService: mostService = getExtensionService(meta3dState_, _getMeta3DBsMostExtensionName())


_init(meta3dState_, isDebug).then((meta3dState) => {
	console.log("finish init on worker thread");

	tempMeta3DState = meta3dState
})

// TODO use pipe

mostService.drain(
	mostService.tap(
		(_) => {
			return _render(getExn(tempMeta3DState));
		},
		mostService.filter(
			(event) => {
				console.log(event);
				return event.data.operateType === "SEND_BEGIN_RENDER";
			},
			mostService.fromEvent<MessageEvent, Window & typeof globalThis>("message", self, false)
		)
	)
)
