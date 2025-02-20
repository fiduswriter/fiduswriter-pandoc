import {getJson} from "../common"

import {formats} from "./constants"
import {PandocConversionImporter} from "./importer"

import {registerImporter} from "../importer/register"

export class AppPandoc {
    constructor(app) {
        this.app = app

        this.pandocAvailable = null
    }

    init() {
        this.checkPandoc().then(() => {
            if (this.pandocAvailable) {
                registerImporter(
                    formats.map(format => [format[0], format[1]]),
                    PandocConversionImporter
                )
            }
        })
    }

    checkPandoc() {
        if (this.pandocAvailable !== null) {
            return Promise.resolve(this.pandocAvailable)
        }

        return getJson("/api/pandoc_on_server/available/").then(
            ({available}) => {
                this.pandocAvailable = available
            }
        )
    }
}
