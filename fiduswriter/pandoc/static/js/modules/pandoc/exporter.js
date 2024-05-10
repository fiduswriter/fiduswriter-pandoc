import {PandocExporter} from "../exporter/pandoc"


export class PandocConversionExporter extends PandocExporter {
    constructor(format, ...args) {
        super(...args)
        this.format = format
    }

    // createDownload() {
    //    // send to pandoc on server, then send converted file to user.
    // }
}