export const formats = [
    // file formats that can be converted by pandoc
    // see https://pandoc.org/MANUAL.html#general-options
    // for a list of supported formats.
    // The first element is the format as presented to the user,
    // the second element is the file extensions.
    // the third element is the format as used by pandoc,
    // the fourth element is whether it is a binary zip format.
    //["DOCX", ["docx"], "docx", true],
    ["LaTeX", ["tex"], "latex", false],
    ["Markdown", ["md"], "markdown", false],
    ["JATS XML", ["xml"], "jats", false],
    ["Emacs Org Mode", ["org"], "org", false],
    ["reStructuredText", ["rst"], "rst", false],
    ["Textile", ["textile"], "textile", false],
    ["HTML", ["html", "htm"], "html", false],
    ["EPUB", ["epub"], "epub", true]
]
