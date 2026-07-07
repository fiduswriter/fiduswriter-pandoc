import download from "downloadjs"

import {PandocExporter} from "@fiduswriter/document/exporter/pandoc/index"
import {createSlug} from "@fiduswriter/document/exporter/tools/file"
import {get, gettext} from "fwtoolkit"

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

    async runPandocConversion() {
        this.progressCallback?.(
            gettext("Converting with Pandoc..."),
            this.options.fullFileExport ? 50 : 70
        )
        const {convert} = await import("pandoc-wasm")
        const binaryFiles = await Promise.all(
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
        const files = {}
        this.textFiles.forEach(file => {
            files[file.filename] = file.contents
        })
        binaryFiles.forEach(file => {
            files[file.filename] = file.contents
        })
        const options = {
            from: "json",
            to: this.format,
            standalone: true
        }
        if (files["bibliography.bib"]) {
            options.bibliography = "bibliography.bib"
            options.citeproc = true
        }
        const content = JSON.stringify(this.conversion.json)
        return convert(options, content, files)
    }

    createExport() {
        // convert with pandoc wasm, then send converted file to user.
        return this.runPandocConversion()
            .then(({stdout: out}) => {
                if (this.options.fullFileExport) {
                    this.progressCallback?.(
                        gettext("Downloading converted file..."),
                        90
                    )
                    const fileName = `${createSlug(this.docTitle)}.${this.fileExtension}`
                    if (out instanceof Blob) {
                        return download(out, fileName, this.mimeType)
                    }
                    const blob = new window.Blob([out], {
                        type: this.mimeType
                    })
                    return download(blob, fileName, this.mimeType)
                }
                this.progressCallback?.(
                    gettext("Creating Pandoc archive..."),
                    90
                )
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
            .then(result => {
                this.progressCallback?.(gettext("Pandoc export complete."), 100)
                return result
            })
    }
}
