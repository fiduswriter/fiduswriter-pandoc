import {getJson} from "../common"

import {formats} from "./constants"
import {PandocConversionImporter} from "./importer"

import {registerImporter} from "../importer/register"

export class AppPandoc {
    constructor(app) {
        this.app = app
    }

    init() {
        registerImporter(
            formats.map(format => [format[0], format[1]]),
            PandocConversionImporter
        )
    }
}
