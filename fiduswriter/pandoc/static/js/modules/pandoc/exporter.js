import download from "downloadjs"
import {pandoc} from "pandoc-wasm"

import {addAlert, get, jsonPost} from "../common"
import {PandocExporter} from "../exporter/pandoc"
import {createSlug} from "../exporter/tools/file"

export class PandocConversionExporter extends PandocExporter {
    constructor(
        format,
        fileExtension,
        mimeType,
        options = {fullFileExport: false, includeBibliography: false},
        ...args
    ) {
        super(...args)
        this.format = format
        this.fileExtension = fileExtension
        this.mimeType = mimeType
        this.options = options
    }

    createExport() {
        // convert with pandoc wasm, then send converted file to user.

        return Promise.all(
            this.httpFiles.map(binaryFile =>
                get(binaryFile.url)
                    .then(response => response.blob())
                    .then(blob =>
                        Promise.resolve({
                            contents: blob,
                            filename: binaryFile.filename
                        })
                    )
            )
        )
            .then(binaryFiles => {
                const files = this.textFiles.concat(binaryFiles)
                const hasBibliography = files.find(
                    file => file.filename === "bibliography.bib"
                )
                return pandoc(
                    `-s -f json -t ${this.format} ${hasBibliography ? "--bibliography bibliography.bib --citeproc" : ""}`,
                    JSON.stringify(this.conversion.json),
                    files
                )
            })
            .then(({out}) => {
                if (this.options.fullFileExport) {
                    const fileName = `${createSlug(this.docTitle)}.${this.fileExtension}`
                    if (out instanceof Blob) {
                        return download(out, fileName, this.mimeType)
                    }
                    const blob = new window.Blob([out], {
                        type: this.mimeType
                    })
                    return download(blob, fileName, this.mimeType)
                }
                this.zipFileName = `${createSlug(this.docTitle)}.${this.format}.zip`
                this.textFiles.push({
                    filename: `document.${this.fileExtension}`,
                    contents: out
                })
                if (!this.options.includeBibliography) {
                    this.textFiles = this.textFiles.filter(
                        file => file.filename !== "bibliography.bib"
                    )
                }
                return this.createDownload()
            })
    }
}
