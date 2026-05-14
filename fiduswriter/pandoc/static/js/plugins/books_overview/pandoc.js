import {PandocBookExporter} from "../../modules/pandoc/book_exporter"

/**
 * Pandoc plugin for the books overview.
 *
 * When the pandoc plugin is installed and activated alongside the books plugin,
 * this adds "Export with Pandoc" submenus to both the book edit dialog's export
 * dropdown and the books overview's bulk action menu.
 *
 * Each submenu lists a dozen target formats (Markdown, LaTeX, DocBook, …) that
 * pandoc-wasm can produce.  The exporter converts every chapter individually
 * and packages the result into a ZIP archive.
 *
 * If the pandoc plugin is NOT installed, no plugin file exists under
 * plugins/books_overview/, so the books overview remains unmodified.
 */
export class BooksPandoc {
    constructor(overview) {
        this.overview = overview
    }

    init() {
        this.addBulkMenuEntries()
        this.addExportDialogEntries()
    }

    /**
     * Format definitions used by both the bulk menu and the export dialog.
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
     * Build a list of content-menu items for the given action callback.
     * @param {Function} actionFn - receives (book, overview, format, ext, mime)
     * @returns {Array<Object>}
     */
    static createFormatItems(actionFn) {
        return BooksPandoc.FORMATS.map(([label, format, ext, mime]) => ({
            type: "action",
            title: gettext(label),
            tooltip: gettext(`Export as ${label} via Pandoc.`),
            action: ({saveBook, book, overview} = {}) => {
                const doExport = () =>
                    actionFn(book, overview, format, ext, mime)
                if (saveBook) {
                    saveBook().then(doExport)
                } else {
                    doExport()
                }
            }
        }))
    }

    /**
     * Helper: start a PandocBookExporter for the given parameters.
     */
    static exportBook(book, overview, format, ext, mime) {
        const exporter = new PandocBookExporter(
            overview.schema,
            overview.app.csl,
            book,
            overview.user,
            overview.documentList,
            new Date(book.updated * 1000),
            format,
            ext,
            mime
        )
        return exporter.init()
    }

    /**
     * Add "Export selected with Pandoc" submenu to the bulk action menu.
     */
    addBulkMenuEntries() {
        const bulkContent = this.overview.dtBulkModel.content

        const formatItems = BooksPandoc.FORMATS.map(([label, format, ext, mime]) => ({
            title: gettext(label),
            tooltip: gettext(`Export selected books as ${label} via Pandoc.`),
            action: overview => {
                const ids = overview.getSelected()
                ids.forEach(id => {
                    const book = overview.bookList.find(b => b.id === id)
                    if (book) {
                        BooksPandoc.exportBook(book, overview, format, ext, mime)
                    }
                })
            }
        }))

        bulkContent.push({
            title: gettext("Export selected with Pandoc"),
            tooltip: gettext("Export selected books using Pandoc."),
            content: formatItems,
            disabled: overview => !overview.getSelected().length
        })
    }

    /**
     * Add "Export with Pandoc" submenu to the book edit dialog's export menu.
     */
    addExportDialogEntries() {
        const exportContent = this.overview.mod.actions.exportMenu.content

        const formatItems = BooksPandoc.createFormatItems(
            (book, overview, format, ext, mime) =>
                BooksPandoc.exportBook(book, overview, format, ext, mime)
        )

        exportContent.push({
            type: "menu",
            title: gettext("Export with Pandoc"),
            tooltip: gettext("Export book using Pandoc."),
            content: formatItems
        })
    }
}
