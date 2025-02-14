import {jsonPost} from "../common"
import {PandocImporter} from "../importer/pandoc"
import {ZipAnalyzer} from "../importer/zip_analyzer"
import {formats} from "./constants"
import {fileToString, flattenDirectory} from "./helpers"

export class PandocConversionImporter extends PandocImporter {
    init() {
        return this.getTemplate().then(() => {
            if (
                formats
                    .map(format => format[1])
                    .flat()
                    .includes(this.file.name.split(".").pop())
            ) {
                return this.convertAndImport()
            } else {
                this.output.statusText = gettext("Unknown file type")
                return Promise.resolve(this.output)
            }
        })
    }

    convertAndImport() {
        const fromExtension = this.file.name.split(".").pop()
        const format = formats.find(format => format[1].includes(fromExtension))
        const from = format[2]
        const binaryZip = format[3]
        const inData = binaryZip ? this.file : fileToString(this.file)

        return import("pandoc-wasm")
            .then(({pandoc}) =>
                pandoc(`-s -f ${from} -t json --extract-media=.`, inData)
            )
            .then(({out, mediaFiles}) => {
                const images = Object.assign(
                    this.additionalFiles?.images || {},
                    flattenDirectory(mediaFiles)
                )
                return this.handlePandocJson(
                    out,
                    images,
                    this.additionalFiles?.bibliography
                )
            })
    }
}
