import {getJson} from "../common"

export class EditorPandoc {
    constructor(editor) {
        this.editor = editor

        this.pandocAvailable = null
    }

    init() {
        this.checkPandoc().then(() => {
            if (this.pandocAvailable) {
                this.modifyMenu()
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

    modifyMenu() {
        const exportMenu = this.editor.menu.headerbarModel.content.find(
            menu => menu.id === "export"
        )

        exportMenu.content.push({
            title: gettext("Other formats"),
            type: "menu",
            tooltip: gettext("Export to a lesser used format using Pandoc."),
            order: 100,
            content: [
                {
                    title: gettext("DocBook"),
                    type: "action",
                    tooltip: gettext(
                        "Export the document to a DocBook file using pandoc."
                    ),
                    order: 1,
                    action: editor => {
                        import("./exporter").then(
                            ({PandocConversionExporter}) => {
                                const exporter = new PandocConversionExporter(
                                    "docbook",
                                    "dbk",
                                    "application/xml",
                                    undefined,
                                    editor.getDoc({
                                        changes: "acceptAllNoInsertions"
                                    }),
                                    editor.mod.db.bibDB,
                                    editor.mod.db.imageDB,
                                    editor.app.csl,
                                    editor.docInfo.updated
                                )
                                exporter.init()
                            }
                        )
                    }
                },
                {
                    title: gettext("Indesign ICML"),
                    type: "action",
                    tooltip: gettext(
                        "Export the document to an Adobe Indesign ICML file using pandoc."
                    ),
                    order: 2,
                    action: editor => {
                        import("./exporter").then(
                            ({PandocConversionExporter}) => {
                                const exporter = new PandocConversionExporter(
                                    "icml",
                                    "icml",
                                    "application/octet-stream",
                                    undefined,
                                    editor.getDoc({
                                        changes: "acceptAllNoInsertions"
                                    }),
                                    editor.mod.db.bibDB,
                                    editor.mod.db.imageDB,
                                    editor.app.csl,
                                    editor.docInfo.updated
                                )
                                exporter.init()
                            }
                        )
                    }
                },
                {
                    title: gettext("Markdown"),
                    type: "menu",
                    tooltip: gettext(
                        "Export the document to a markdown file using pandoc."
                    ),
                    order: 3,
                    content: [
                        {
                            title: gettext("Commonmark"),
                            type: "action",
                            tooltip: gettext(
                                "Export the document to a Commonmark file using pandoc."
                            ),
                            order: 1,
                            action: editor => {
                                import("./exporter").then(
                                    ({PandocConversionExporter}) => {
                                        const exporter =
                                            new PandocConversionExporter(
                                                "commonmark",
                                                "md",
                                                "text/markdown",
                                                {includeBibliography: true},
                                                editor.getDoc({
                                                    changes:
                                                        "acceptAllNoInsertions"
                                                }),
                                                editor.mod.db.bibDB,
                                                editor.mod.db.imageDB,
                                                editor.app.csl,
                                                editor.docInfo.updated
                                            )
                                        exporter.init()
                                    }
                                )
                            }
                        },
                        {
                            title: gettext("GitHub-Flavored Markdown"),
                            type: "action",
                            tooltip: gettext(
                                "Export the document to a GitHub-Flavored Markdown file using pandoc."
                            ),
                            order: 2,
                            action: editor => {
                                import("./exporter").then(
                                    ({PandocConversionExporter}) => {
                                        const exporter =
                                            new PandocConversionExporter(
                                                "gfm",
                                                "md",
                                                "text/markdown",
                                                {includeBibliography: true},
                                                editor.getDoc({
                                                    changes:
                                                        "acceptAllNoInsertions"
                                                }),
                                                editor.mod.db.bibDB,
                                                editor.mod.db.imageDB,
                                                editor.app.csl,
                                                editor.docInfo.updated
                                            )
                                        exporter.init()
                                    }
                                )
                            }
                        },
                        {
                            title: gettext("Markua"),
                            type: "action",
                            tooltip: gettext(
                                "Export the document to a Markua file using pandoc."
                            ),
                            order: 2,
                            action: editor => {
                                import("./exporter").then(
                                    ({PandocConversionExporter}) => {
                                        const exporter =
                                            new PandocConversionExporter(
                                                "markua",
                                                "md",
                                                "text/markdown",
                                                {includeBibliography: true},
                                                editor.getDoc({
                                                    changes:
                                                        "acceptAllNoInsertions"
                                                }),
                                                editor.mod.db.bibDB,
                                                editor.mod.db.imageDB,
                                                editor.app.csl,
                                                editor.docInfo.updated
                                            )
                                        exporter.init()
                                    }
                                )
                            }
                        },
                        {
                            title: gettext("MultiMarkdown"),
                            type: "action",
                            tooltip: gettext(
                                "Export the document to a MultiMarkdown file using pandoc."
                            ),
                            order: 2,
                            action: editor => {
                                import("./exporter").then(
                                    ({PandocConversionExporter}) => {
                                        const exporter =
                                            new PandocConversionExporter(
                                                "markdown_mmd",
                                                "md",
                                                "text/markdown",
                                                {includeBibliography: true},
                                                editor.getDoc({
                                                    changes:
                                                        "acceptAllNoInsertions"
                                                }),
                                                editor.mod.db.bibDB,
                                                editor.mod.db.imageDB,
                                                editor.app.csl,
                                                editor.docInfo.updated
                                            )
                                        exporter.init()
                                    }
                                )
                            }
                        },
                        {
                            title: gettext("Pandoc Markdown"),
                            type: "action",
                            tooltip: gettext(
                                "Export the document to a Pandoc Markdown file using pandoc."
                            ),
                            order: 1,
                            action: editor => {
                                import("./exporter").then(
                                    ({PandocConversionExporter}) => {
                                        const exporter =
                                            new PandocConversionExporter(
                                                "markdown",
                                                "md",
                                                "text/markdown",
                                                {includeBibliography: true},
                                                editor.getDoc({
                                                    changes:
                                                        "acceptAllNoInsertions"
                                                }),
                                                editor.mod.db.bibDB,
                                                editor.mod.db.imageDB,
                                                editor.app.csl,
                                                editor.docInfo.updated
                                            )
                                        exporter.init()
                                    }
                                )
                            }
                        },
                        {
                            title: gettext("PHP Markdown Extra"),
                            type: "action",
                            tooltip: gettext(
                                "Export the document to a PHP Markdown Extra file using pandoc."
                            ),
                            order: 3,
                            action: editor => {
                                import("./exporter").then(
                                    ({PandocConversionExporter}) => {
                                        const exporter =
                                            new PandocConversionExporter(
                                                "markdown_phpextra",
                                                "md",
                                                "text/markdown",
                                                {includeBibliography: true},
                                                editor.getDoc({
                                                    changes:
                                                        "acceptAllNoInsertions"
                                                }),
                                                editor.mod.db.bibDB,
                                                editor.mod.db.imageDB,
                                                editor.app.csl,
                                                editor.docInfo.updated
                                            )
                                        exporter.init()
                                    }
                                )
                            }
                        }
                    ]
                },
                {
                    title: gettext("Richtext"),
                    type: "action",
                    tooltip: gettext(
                        "Export the document to a richtext file using pandoc."
                    ),
                    order: 4,
                    action: editor => {
                        import("./exporter").then(
                            ({PandocConversionExporter}) => {
                                const exporter = new PandocConversionExporter(
                                    "rtf",
                                    "rtf",
                                    "application/rtf",
                                    {fullFileExport: true},
                                    editor.getDoc({
                                        changes: "acceptAllNoInsertions"
                                    }),
                                    editor.mod.db.bibDB,
                                    editor.mod.db.imageDB,
                                    editor.app.csl,
                                    editor.docInfo.updated
                                )
                                exporter.init()
                            }
                        )
                    }
                },
                {
                    title: gettext("Textile"),
                    type: "action",
                    tooltip: gettext(
                        "Export the document to a textile file using pandoc."
                    ),
                    order: 5,
                    action: editor => {
                        import("./exporter").then(
                            ({PandocConversionExporter}) => {
                                const exporter = new PandocConversionExporter(
                                    "textile",
                                    "textile",
                                    "text/textile",
                                    undefined,
                                    editor.getDoc({
                                        changes: "acceptAllNoInsertions"
                                    }),
                                    editor.mod.db.bibDB,
                                    editor.mod.db.imageDB,
                                    editor.app.csl,
                                    editor.docInfo.updated
                                )
                                exporter.init()
                            }
                        )
                    }
                },
                {
                    title: gettext("TEI Simple"),
                    type: "action",
                    tooltip: gettext(
                        "Export the document to a TEI Simple file using pandoc."
                    ),
                    order: 6,
                    action: editor => {
                        import("./exporter").then(
                            ({PandocConversionExporter}) => {
                                const exporter = new PandocConversionExporter(
                                    "tei",
                                    "xml", // "tei" is the format name, but the file extension is "xml"
                                    "application/xml",
                                    undefined,
                                    editor.getDoc({
                                        changes: "acceptAllNoInsertions"
                                    }),
                                    editor.mod.db.bibDB,
                                    editor.mod.db.imageDB,
                                    editor.app.csl,
                                    editor.docInfo.updated
                                )
                                exporter.init()
                            }
                        )
                    }
                },
                {
                    title: gettext("Typst"),
                    type: "action",
                    tooltip: gettext(
                        "Export the document to a typst file using pandoc."
                    ),
                    order: 7,
                    action: editor => {
                        import("./exporter").then(
                            ({PandocConversionExporter}) => {
                                const exporter = new PandocConversionExporter(
                                    "typst",
                                    "typ",
                                    "application/octet-stream",
                                    {includeBibliography: true},
                                    editor.getDoc({
                                        changes: "acceptAllNoInsertions"
                                    }),
                                    editor.mod.db.bibDB,
                                    editor.mod.db.imageDB,
                                    editor.app.csl,
                                    editor.docInfo.updated
                                )
                                exporter.init()
                            }
                        )
                    }
                }
            ]
        })
    }
}
