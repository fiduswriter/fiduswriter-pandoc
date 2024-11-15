import {getJson} from "../common"

import {formats} from "./constants"
import {PandocConversionImporter} from "./importer"

export class DocumentOverviewPandoc {
    constructor(documentOverview) {
        this.documentOverview = documentOverview

        this.pandocAvailable = null
    }

    init() {
        this.checkPandoc().then(() => {
            if (this.pandocAvailable) {
                this.modifyMenu()
                this.modifyExternalImporter()
            }
        })
    }

    checkPandoc() {
        if (this.pandocAvailable !== null) {
            return Promise.resolve(this.pandocAvailable)
        }

        return getJson("/api/pandoc/available/").then(({available}) => {
            this.pandocAvailable = available
        })
    }

    modifyMenu() {
        const menu = this.documentOverview.menu
        let menuItem = menu.model.content.find(
            menuItem => menuItem.id === "import_external"
        )
        if (!menuItem) {
            menuItem = {
                id: "import_external"
            }
            menu.model.contents.push(menuItem)
        }
        menuItem.title = gettext("Import document")
        menuItem.description = gettext("Import a document in another format")
        menuItem.icon = "file"
        menu.update()
    }

    modifyExternalImporter() {
        const actions = this.documentOverview.mod.actions
        actions.externalFormats = actions.externalFormats.concat(formats)
        actions.externalFormatsTitle = gettext("Import Pandoc JSON/ZIP file")
        actions.externalFileImporter = PandocConversionImporter
    }
}
