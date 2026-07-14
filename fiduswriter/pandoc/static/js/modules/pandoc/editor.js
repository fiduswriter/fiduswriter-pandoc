import {addProgress, gettext, shortFileTitle} from "fwtoolkit"

const exportWithProgress = (editor, format, ext, mime, options) =>
    import("./exporter").then(({PandocConversionExporter}) => {
        const doc = editor.getDoc({changes: "acceptAllNoInsertions"})
        const title = shortFileTitle(doc.title, doc.path || "")
        const task = addProgress(
            "info",
            `${title}: ${gettext("Exporting via Pandoc...")}`,
            {autoClose: 6000}
        )
        const exporter = new PandocConversionExporter(
            format,
            ext,
            mime,
            options,
            doc,
            editor.mod.db.bibDB,
            editor.mod.db.imageDB,
            editor.app.csl,
            editor.docInfo.updated,
            (message, percentage) => task.update(percentage, message)
        )
        return exporter.init().catch(error => {
            task.close()
            throw error
        })
    })

export class EditorPandoc {
    constructor(editor) {
        this.editor = editor
    }

    init() {
        this.modifyMenu()
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
                    action: editor =>
                        exportWithProgress(
                            editor,
                            "docbook",
                            "dbk",
                            "application/xml"
                        )
                },
                {
                    title: gettext("Indesign ICML"),
                    type: "action",
                    tooltip: gettext(
                        "Export the document to an Adobe Indesign ICML file using pandoc."
                    ),
                    order: 2,
                    action: editor =>
                        exportWithProgress(
                            editor,
                            "icml",
                            "icml",
                            "application/octet-stream"
                        )
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
                            action: editor =>
                                exportWithProgress(
                                    editor,
                                    "commonmark",
                                    "md",
                                    "text/markdown",
                                    {includeBibliography: true}
                                )
                        },
                        {
                            title: gettext("GitHub-Flavored Markdown"),
                            type: "action",
                            tooltip: gettext(
                                "Export the document to a GitHub-Flavored Markdown file using pandoc."
                            ),
                            order: 2,
                            action: editor =>
                                exportWithProgress(
                                    editor,
                                    "gfm",
                                    "md",
                                    "text/markdown",
                                    {includeBibliography: true}
                                )
                        },
                        {
                            title: gettext("Markua"),
                            type: "action",
                            tooltip: gettext(
                                "Export the document to a Markua file using pandoc."
                            ),
                            order: 2,
                            action: editor =>
                                exportWithProgress(
                                    editor,
                                    "markua",
                                    "md",
                                    "text/markdown",
                                    {includeBibliography: true}
                                )
                        },
                        {
                            title: gettext("MultiMarkdown"),
                            type: "action",
                            tooltip: gettext(
                                "Export the document to a MultiMarkdown file using pandoc."
                            ),
                            order: 2,
                            action: editor =>
                                exportWithProgress(
                                    editor,
                                    "markdown_mmd",
                                    "md",
                                    "text/markdown",
                                    {includeBibliography: true}
                                )
                        },
                        {
                            title: gettext("Pandoc Markdown"),
                            type: "action",
                            tooltip: gettext(
                                "Export the document to a Pandoc Markdown file using pandoc."
                            ),
                            order: 1,
                            action: editor =>
                                exportWithProgress(
                                    editor,
                                    "markdown",
                                    "md",
                                    "text/markdown",
                                    {includeBibliography: true}
                                )
                        },
                        {
                            title: gettext("PHP Markdown Extra"),
                            type: "action",
                            tooltip: gettext(
                                "Export the document to a PHP Markdown Extra file using pandoc."
                            ),
                            order: 3,
                            action: editor =>
                                exportWithProgress(
                                    editor,
                                    "markdown_phpextra",
                                    "md",
                                    "text/markdown",
                                    {includeBibliography: true}
                                )
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
                    action: editor =>
                        exportWithProgress(
                            editor,
                            "rtf",
                            "rtf",
                            "application/rtf",
                            {fullFileExport: true}
                        )
                },
                {
                    title: gettext("Textile"),
                    type: "action",
                    tooltip: gettext(
                        "Export the document to a textile file using pandoc."
                    ),
                    order: 5,
                    action: editor =>
                        exportWithProgress(
                            editor,
                            "textile",
                            "textile",
                            "text/textile"
                        )
                },
                {
                    title: gettext("TEI Simple"),
                    type: "action",
                    tooltip: gettext(
                        "Export the document to a TEI Simple file using pandoc."
                    ),
                    order: 6,
                    action: editor =>
                        exportWithProgress(
                            editor,
                            "tei",
                            "xml", // "tei" is the format name, but the file extension is "xml"
                            "application/xml"
                        )
                },
                {
                    title: gettext("Typst"),
                    type: "action",
                    tooltip: gettext(
                        "Export the document to a typst file using pandoc."
                    ),
                    order: 7,
                    action: editor =>
                        exportWithProgress(
                            editor,
                            "typst",
                            "typ",
                            "application/octet-stream",
                            {includeBibliography: true}
                        )
                }
            ]
        })
    }
}
