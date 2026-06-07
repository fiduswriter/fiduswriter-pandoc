import {PandocImporter} from "../importer/pandoc"
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
            "extract-media": "."
        }
        const {convert} = await import("pandoc-wasm")

        // Build files object for pandoc-wasm virtual filesystem
        const files = {}
        if (this.additionalFiles?.bibliography) {
            files["bibliography.bib"] = this.additionalFiles.bibliography
        }
        if (this.additionalFiles?.images) {
            Object.entries(this.additionalFiles.images).forEach(
                ([path, blob]) => {
                    files[path] = blob
                }
            )
        }

        const {stdout: out, mediaFiles} = await convert(options, inData, files)
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
