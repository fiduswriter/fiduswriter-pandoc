export const fileToString = file => {
    return new Promise((resolve, reject) => {
        const reader = new window.FileReader()
        reader.onerror = reject
        reader.onload = () => resolve(reader.result)
        reader.readAsText(file)
    })
}
