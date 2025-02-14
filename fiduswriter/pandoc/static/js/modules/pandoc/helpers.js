export const fileToString = file => {
    return new Promise((resolve, reject) => {
        const reader = new window.FileReader()
        reader.onerror = reject
        reader.onload = () => resolve(reader.result)
        reader.readAsText(file)
    })
}

export const flattenDirectory = rootMap => {
    const result = {}

    function processMap(currentMap, currentPath) {
        for (const [key, value] of currentMap) {
            if (value instanceof Map) {
                processMap(value, `${currentPath}${key}/`)
            } else {
                result[`${currentPath}${key}`] = value
            }
        }
    }

    // Process each entry in the root Map
    for (const [key, value] of rootMap) {
        if (value instanceof Map) {
            processMap(value, `./${key}/`)
        } else {
            result[`./${key}`] = value
        }
    }

    return result
}
