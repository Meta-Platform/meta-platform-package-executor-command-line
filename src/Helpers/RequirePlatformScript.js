const { resolve } = require("path")

const GetPackageName = (uri) => {
    const [ packageName ] = uri.split('/')
    return packageName
}

const GetLayerURI = (packageName, DEPENDENCY_LIST) => {
    
    const fullPackageURI = DEPENDENCY_LIST
        .find(uri => uri.includes(packageName))

    if (!fullPackageURI) {
        throw `Pacote não encontrado [${packageName}]`
    }
    const layerURI = fullPackageURI.substring(0, fullPackageURI.lastIndexOf("/"))
    return layerURI
    
}

const RequirePlatformScript = (fileURI, ECO_DIRPATH_MAIN_REPO, DEPENDENCY_LIST) => {
    const packageName = GetPackageName(fileURI)
    const layerURI = GetLayerURI(packageName, DEPENDENCY_LIST)
    const filePath = resolve(ECO_DIRPATH_MAIN_REPO, layerURI, fileURI)
    return require(filePath)
}

module.exports = RequirePlatformScript