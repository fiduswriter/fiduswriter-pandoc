import {jsonPost} from "../common"
import {PandocImporter} from "../importer/pandoc"
import {ZipAnalyzer} from "../importer/zip_analyzer"
import {formats} from "./constants"
import {fileToString} from "./helpers"

export class PandocConversionImporter extends PandocImporter {
    async init() {
        await this.getTemplate()
        if (
            formats
                .map(format => format[1])
                .flat()
                .includes(this.file.name.split(".").pop())
        ) {
            return await this.convertAndImport()
        } else {
            this.output.statusText = gettext("Unknown file type")
            return this.output
        }
    }

    async convertAndImport() {
        const nameParts = this.file.name.split(".")
        const fromExtension = nameParts.pop()
        this.title = nameParts.join(".")
        const format = formats.find(format => format[1].includes(fromExtension))
        const from = format[2]
        const binaryZip = format[3]
        const inData = binaryZip ? this.file : await fileToString(this.file)
        const options = {
            standalone: true,
            from,
            to: "json",
            extractMedia: "."
        }
        const {convert} = await import("wasm-pandoc")
        const {stdout: out, mediaFiles} = await convert(options, inData)
        const images = Object.assign(
            this.additionalFiles?.images || {},
            mediaFiles
        )
        return this.handlePandocJson(
            out,
            images,
            this.additionalFiles?.bibliography
        )
    }
}
