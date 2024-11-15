import {jsonPost} from "../common"
import {PandocImporter} from "../importer/pandoc"

import {formats} from "./constants"
import {fileToBase64} from "./helpers"

export class PandocConversionImporter extends PandocImporter {
    init() {
        return this.getTemplate().then(() => {
            if (this.file.type === "application/json") {
                return this.importJSON()
            } else if (this.file.type === "application/zip") {
                return this.importZip()
            } else if (formats.includes(this.file.name.split(".").pop())) {
                return this.convertAndImport()
            } else {
                this.output.statusText = gettext("Unknown file type")
                return Promise.resolve(this.output)
            }
        })
    }

    convertAndImport() {
        const from = this.file.name.split(".").pop()
        return fileToBase64(this.file)
            .then(base64String => {
                return jsonPost("/api/pandoc/export/", {
                    from,
                    to: "json",
                    standalone: true,
                    text: base64String
                })
            })
            .then(response => response.json())
            .then(json => {
                if (json.error) {
                    this.output.statusText = json.error
                    return this.output
                }
                return this.handlePandocJson(json.output)
            })
    }
}
