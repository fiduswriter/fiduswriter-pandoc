import {formats} from "@fiduswriter/pandoc/formats"
import {PandocConversionImporter} from "@fiduswriter/pandoc/importer"

import {registerImporter} from "@fiduswriter/frontend/documents/importer/register"

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
