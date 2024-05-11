import {jsonPost} from "../common"
import {PandocExporter} from "../exporter/pandoc"
import {createSlug} from "../exporter/tools/file"

const FILE_EXTENSIONS = {
    "markdown": "md",
}


export class PandocConversionExporter extends PandocExporter {
    constructor(format, ...args) {
        super(...args)
        this.format = format
    }

    createExport() {
        // send to pandoc on server, then send converted file to user.
        this.zipFileName = `${createSlug(this.docTitle)}.${this.format}.zip`
        return jsonPost(
            "/api/pandoc/export/",
            {
                text: JSON.stringify(this.conversion.json),
                from: "json",
                to: this.format,
            }
        ).then(
            response => response.json()
        ).then(
            json => {
                this.textFiles.push({
                    filename: `document.${FILE_EXTENSIONS[this.format]}`,
                    contents: json.output,
                })
                return this.createDownload()
            }
        )
    }
}