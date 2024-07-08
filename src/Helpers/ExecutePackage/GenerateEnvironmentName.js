const crypto = require('crypto')

const ConvertToHashSHA256 = (token) => 
    crypto
        .createHash('sha256')
        .update(token)
        .digest('hex')

const GenerateEnvironmentName = (packageName, packagePath) => 
        `${packageName}-${ConvertToHashSHA256(packagePath)}`

module.exports = GenerateEnvironmentName