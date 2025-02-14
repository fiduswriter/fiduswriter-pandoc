import {jsonPost} from "../common"
import {PandocImporter} from "../importer/pandoc"

import {formats} from "./constants"
import {fileToString} from "./helpers"

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
        const binary = format[3]
        return fileToString(this.file, binary)
            .then(text => {
                return jsonPost("/api/pandoc_on_server/export/", {
                    from,
                    to: "json",
                    standalone: true,
                    text
                })
            })
            .then(response => response.json())
            .then(json => {
                if (json.error) {
                    this.output.statusText = json.error
                    return this.output
                }
                return this.handlePandocJson(
                    json.output,
                    this.additionalFiles?.images,
                    this.additionalFiles?.bibliography
                )
            })
    }
}
