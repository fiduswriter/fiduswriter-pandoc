export class EditorPandoc {
    constructor(editor) {
        this.editor = editor
    }

    init() {
        const exportMenu = this.editor.menu.headerbarModel.content.find(menu => menu.id === "export")

        exportMenu.content.push(
            {
                title: gettext("Markdown"),
                type: "action",
                tooltip: gettext("Export the document to a markdown file."),
                order: 5,
                action: editor => {
                    import("./exporter").then(({PandocConversionExporter}) => {
                        const exporter = new PandocConversionExporter(
                            "markdown",
                            editor.getDoc({changes: "acceptAllNoInsertions"}),
                            editor.mod.db.bibDB,
                            editor.mod.db.imageDB,
                            editor.app.csl,
                            editor.docInfo.updated
                        )
                        exporter.init()
                    })
                }
            }

        )
    }

}
