import {getMissingDocumentListData} from "../../modules/documents/tools"
import {PandocConversionExporter} from "../../modules/pandoc/exporter"

/**
 * Pandoc plugin for the documents overview.
 *
 * When the pandoc app is installed and activated, this adds pandoc-based
 * export items to the documents overview's bulk action menu.
 */
export class DocsPandoc {
    constructor(overview) {
        this.overview = overview
    }

    init() {
        this.addBulkMenuEntries()
    }

    /**
     * Format definitions.
     *
     * Each entry: [label, pandocFormat, fileExtension, mimeType]
     */
    static get FORMATS() {
        return [
            ["Markdown", "markdown", "md", "text/markdown"],
            ["Commonmark", "commonmark", "md", "text/markdown"],
            ["reStructuredText", "rst", "rst", "text/x-rst"],
            ["LaTeX", "latex", "tex", "application/x-latex"],
            ["DocBook", "docbook", "dbk", "application/xml"],
            ["JATS XML", "jats", "xml", "application/xml"],
            ["TEI Simple", "tei", "xml", "application/xml"],
            ["Emacs Org Mode", "org", "org", "text/x-org"],
            ["Textile", "textile", "textile", "text/textile"],
            ["Typst", "typst", "typ", "application/octet-stream"],
            ["Richtext (RTF)", "rtf", "rtf", "application/rtf"],
            ["ICML (Indesign)", "icml", "icml", "application/octet-stream"]
        ]
    }

    /**
     * Helper: start a PandocConversionExporter for the given document.
     */
    static exportDoc(doc, overview, format, ext, mime) {
        const bibDB = {db: doc.bibliography || {}}
        const imageDB = {db: doc.images || {}}
        const csl = overview.app.csl
        const updated = new Date(doc.updated * 1000)
        const exporter = new PandocConversionExporter(
            format,
            ext,
            mime,
            {fullFileExport: true},
            doc,
            bibDB,
            imageDB,
            csl,
            updated
        )
        return exporter.init()
    }

    /**
     * Add individual "Export selected as … (via Pandoc)" items to the
     * bulk action menu.
     */
    addBulkMenuEntries() {
        const bulkContent = this.overview.dtBulkModel.content

        DocsPandoc.FORMATS.forEach(([label, format, ext, mime]) => {
            bulkContent.push({
                title: interpolate(
                    gettext("Export selected as %s (via Pandoc)"),
                    [label]
                ),
                tooltip: interpolate(
                    gettext(
                        "Export the documents that have been selected as %s files using Pandoc."
                    ),
                    [label]
                ),
                action: overview => {
                    const ids = overview.getSelected()
                    if (!ids.length) {
                        return
                    }
                    getMissingDocumentListData(
                        ids,
                        overview.documentList,
                        overview.schema
                    ).then(() =>
                        ids.forEach(id => {
                            const doc = overview.documentList.find(
                                entry => entry.id === id
                            )
                            if (doc) {
                                DocsPandoc.exportDoc(
                                    doc,
                                    overview,
                                    format,
                                    ext,
                                    mime
                                )
                            }
                        })
                    )
                },
                disabled: overview =>
                    !overview.getSelected().length || overview.app.isOffline(),
                order: 9.6
            })
        })

        if (this.overview.dtBulk) {
            this.overview.dtBulk.update()
        }
    }
}
