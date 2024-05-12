export class EditorPandoc {
    constructor(editor) {
        this.editor = editor
    }

    init() {
        const exportMenu = this.editor.menu.headerbarModel.content.find(menu => menu.id === "export")

        exportMenu.content.push(
            {
                title: gettext("DocBook"),
                type: "action",
                tooltip: gettext("Export the document to a DocBook file using pandoc."),
                order: 5,
                action: editor => {
                    import("./exporter").then(({PandocConversionExporter}) => {
                        const exporter = new PandocConversionExporter(
                            "docbook",
                            "dbk",
                            "application/xml",
                            false,
                            false,
                            editor.getDoc({changes: "acceptAllNoInsertions"}),
                            editor.mod.db.bibDB,
                            editor.mod.db.imageDB,
                            editor.app.csl,
                            editor.docInfo.updated
                        )
                        exporter.init()
                    })
                }
            },
            {
                title: gettext("Markdown"),
                type: "action",
                tooltip: gettext("Export the document to a markdown file using pandoc."),
                order: 5,
                action: editor => {
                    import("./exporter").then(({PandocConversionExporter}) => {
                        const exporter = new PandocConversionExporter(
                            "markdown",
                            "md",
                            "text/markdown",
                            true,
                            false,
                            editor.getDoc({changes: "acceptAllNoInsertions"}),
                            editor.mod.db.bibDB,
                            editor.mod.db.imageDB,
                            editor.app.csl,
                            editor.docInfo.updated
                        )
                        exporter.init()
                    })
                }
            },
            {
                title: gettext("Richtext"),
                type: "action",
                tooltip: gettext("Export the document to a richtext file using pandoc."),
                order: 5,
                action: editor => {
                    import("./exporter").then(({PandocConversionExporter}) => {
                        const exporter = new PandocConversionExporter(
                            "rtf",
                            "rtf",
                            "application/rtf",
                            false,
                            true,
                            editor.getDoc({changes: "acceptAllNoInsertions"}),
                            editor.mod.db.bibDB,
                            editor.mod.db.imageDB,
                            editor.app.csl,
                            editor.docInfo.updated
                        )
                        exporter.init()
                    })
                }
            },
            {
                title: gettext("Textile"),
                type: "action",
                tooltip: gettext("Export the document to a textile file using pandoc."),
                order: 5,
                action: editor => {
                    import("./exporter").then(({PandocConversionExporter}) => {
                        const exporter = new PandocConversionExporter(
                            "textile",
                            "textile",
                            "text/textile",
                            false,
                            false,
                            editor.getDoc({changes: "acceptAllNoInsertions"}),
                            editor.mod.db.bibDB,
                            editor.mod.db.imageDB,
                            editor.app.csl,
                            editor.docInfo.updated
                        )
                        exporter.init()
                    })
                }
            },
            {
                title: gettext("TEI Simple"),
                type: "action",
                tooltip: gettext("Export the document to a TEI Simple file using pandoc."),
                order: 5,
                action: editor => {
                    import("./exporter").then(({PandocConversionExporter}) => {
                        const exporter = new PandocConversionExporter(
                            "tei",
                            "xml", // "tei" is the format name, but the file extension is "xml"
                            "application/xml",
                            false,
                            false,
                            editor.getDoc({changes: "acceptAllNoInsertions"}),
                            editor.mod.db.bibDB,
                            editor.mod.db.imageDB,
                            editor.app.csl,
                            editor.docInfo.updated
                        )
                        exporter.init()
                    })
                }
            },
            {
                title: gettext("Typst"),
                type: "action",
                tooltip: gettext("Export the document to a typst file using pandoc."),
                order: 5,
                action: editor => {
                    import("./exporter").then(({PandocConversionExporter}) => {
                        const exporter = new PandocConversionExporter(
                            "typst",
                            "typ",
                            "application/octet-stream",
                            false,
                            false,
                            editor.getDoc({changes: "acceptAllNoInsertions"}),
                            editor.mod.db.bibDB,
                            editor.mod.db.imageDB,
                            editor.app.csl,
                            editor.docInfo.updated
                        )
                        exporter.init()
                    })
                }
            },
        )
    }

}
