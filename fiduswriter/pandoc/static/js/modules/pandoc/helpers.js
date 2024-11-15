export const fileToBase64 = file =>
    new Promise((resolve, reject) => {
        const reader = new window.FileReader()
        reader.onerror = reject
        reader.onload = () => resolve(reader.result.split("base64,")[1])
        reader.readAsDataURL(file)
    })
