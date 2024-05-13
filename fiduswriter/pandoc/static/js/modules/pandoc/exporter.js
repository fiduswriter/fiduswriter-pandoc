import download from "downloadjs"

import {addAlert, jsonPost, get} from "../common"
import {PandocExporter} from "../exporter/pandoc"
import {createSlug} from "../exporter/tools/file"


export class PandocConversionExporter extends PandocExporter {
    constructor(format, fileExtension, mimeType, options = {fullFileExport: false, includeBibliography: false}, ...args) {
        super(...args)
        this.format = format
        this.fileExtension = fileExtension
        this.mimeType = mimeType
        this.options = options
    }

    createExport() {
        // send to pandoc on server, then send converted file to user.

        return Promise.all(this.httpFiles.map(binaryFile =>
            get(binaryFile.url).then(
                response => response.blob()
            ).then(
                blob => new Promise((resolve, reject) => {
                    const reader = new window.FileReader()
                    reader.onerror = reject
                    reader.onload = () => {
                        resolve(reader.result)
                    }
                    reader.readAsDataURL(blob)
                })
            ).then(
                base64Object => Promise.resolve({contents: base64Object.split("base64,")[1], filename: binaryFile.filename})
            )
        )).then(
            binaryFiles => {
                const files = this.textFiles.concat(binaryFiles).reduce(
                    (acc, file) => {
                        acc[file.filename] = file.contents
                        return acc
                    },
                    {}
                )
                const hasBibliography = files.hasOwnProperty("bibliography.bib")
                return jsonPost(
                    "/api/pandoc/export/",
                    {
                        text: JSON.stringify(this.conversion.json),
                        from: "json",
                        to: this.format,
                        standalone: true,
                        files,
                        bibliography: hasBibliography ? ["bibliography.bib"] : [],
                        citeproc: hasBibliography,
                    }
                )
            }
        ).then(
            response => response.json()
        ).then(
            json => {
                if (!json.output) {
                    if (json.error) {
                        addAlert("error", json.error)
                    }
                    return
                }
                if (this.options.fullFileExport) {
                    const fileName = `${createSlug(this.docTitle)}.${this.fileExtension}`
                    if (json.base64) {
                        // convert base64 string to blob
                        return fetch(`data:${this.mimeType};base64,${json.output}`).then(
                            response => response.blob()
                        ).then(
                            blob => download(blob, fileName, this.mimeType)
                        )
                    } else {
                        const blob = new window.Blob([json.output], {type: this.mimeType})
                        return download(blob, fileName, this.mimeType)
                    }
                }
                this.zipFileName = `${createSlug(this.docTitle)}.${this.format}.zip`
                this.textFiles.push({
                    filename: `document.${this.fileExtension}`,
                    contents: json.output,
                })
                if (!this.options.includeBibliography) {
                    this.textFiles = this.textFiles.filter(file => file.filename !== "bibliography.bib")
                }
                return this.createDownload()
            }
        )
    }
}