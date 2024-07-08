
const GetValue = (kind, value) => {
    return {
        [kind]: value
    }
}

const GetList = (array) => {
    return {
        "values": array.map(value => GetField(value))
    }
}

const CheckValueIsType = (kind, value) => {
    const checkers = {
        "stringValue" : (value) => typeof value === 'string',
        "numberValue" : (value) => typeof value === 'number',
        "boolValue"   : (value) => typeof value === 'boolean',
        "listValue"   : (value) => Array.isArray(value),
        "structValue" : (value) => typeof value === 'object' && value !== null
    }
    return checkers[kind](value)
}

const GetField = (value) => 
    CheckValueIsType("stringValue", value)
        ? GetValue("stringValue", value)
        : CheckValueIsType("numberValue", value)
            ? GetValue("numberValue", value)
            : CheckValueIsType("boolValue", value)
                ? GetValue("boolValue", value)
                : CheckValueIsType("listValue", value)
                    ? GetValue("listValue", GetList(value))
                    : CheckValueIsType("structValue", value)
                        ? GetValue("structValue", ConvertObjectToProtoStruct(value))
                        : GetValue("nullValue", null)

const ConvertObjectToProtoStruct = (object) => {
    return {
        "fields": Object
        .entries(object)
            .reduce((acc, [property, value]) => {
                return {
                    ...acc,
                    [property]: GetField(value)
                }
            }, {})
    }
}

module.exports = ConvertObjectToProtoStruct