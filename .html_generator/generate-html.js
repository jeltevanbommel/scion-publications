import fs from 'fs';
import bibtex from 'bibtex/index.js';
import escape from 'escape-html';

// UTILITIES
const monthMapping = {
    jan: "january",
    feb: "february",
    mar: "march",
    apr: "april",
    may: "may",
    jun: "june",
    jul: "july",
    aug: "august",
    sep: "september",
    oct: "october",
    nov: "november",
    dec: "december",
};

// From the original PHP file, but converted to Javascript, replaces latex symbols with their html counterparts.
function escapeRegExp(str) {
    return str.replace(/[-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function char2html(line, latexmodifier, char, entitiyfragment) {
    line = char2html_case_sensitive(
        line,
        latexmodifier,
        char.toUpperCase(),
        entitiyfragment
    );
    return char2html_case_sensitive(
        line,
        latexmodifier,
        char.toLowerCase(),
        entitiyfragment
    );
}

function char2html_case_sensitive(line, latexmodifier, char, entitiyfragment) {
    return line.replace(
        new RegExp(`\\{?\\\\${escapeRegExp(latexmodifier)}?\\{?${char}\\}?`),
        "&" + char + entitiyfragment + ";"
    );
}

const latex2html = (str) => {
    str = str.replace(/([^\\\\])~/, "\\1&nbsp;");

    str = str.replace("---", "&mdash;");
    str = str.replace("--", "&ndash;");
    str = str.replace("``", "''");

    str = str.replace("\\\\&", "&amp;");
    str = str.replace("\\&", "&amp;");
    str = str.replace("<", "&lt;");
    str = str.replace(">", "&gt;");

    str = str.replace("\\_", "_");
    str = str.replace("\\%", "%");
    str = str.replace("/\\\\url{(.*)}/U", '<a href="\\1">\\1</a>');

    str = char2html(str, "'", "a", "acute");
    str = char2html(str, "'", "c", "acute");
    str = char2html(str, "'", "e", "acute");
    str = char2html(str, "'", "i", "acute");
    str = char2html(str, "'", "o", "acute");
    str = char2html(str, "'", "u", "acute");
    str = char2html(str, "'", "y", "acute");
    str = char2html(str, "'", "n", "acute");

    str = char2html(str, "`", "a", "grave");
    str = char2html(str, "`", "e", "grave");
    str = char2html(str, "`", "i", "grave");
    str = char2html(str, "`", "o", "grave");
    str = char2html(str, "`", "u", "grave");

    str = char2html(str, "~", "a", "tilde");
    str = char2html(str, "~", "n", "tilde");
    str = char2html(str, "~", "o", "tilde");

    str = char2html(str, '"', "a", "uml");
    str = char2html(str, '"', "e", "uml");
    str = char2html(str, '"', "i", "uml");
    str = char2html(str, '"', "o", "uml");
    str = char2html(str, '"', "u", "uml");
    str = char2html(str, '"', "y", "uml");
    str = char2html(str, '"', "s", "zlig");

    str = char2html(str, "^", "a", "circ");
    str = char2html(str, "^", "e", "circ");
    str = char2html(str, "^", "i", "circ");
    str = char2html(str, "^", "o", "circ");
    str = char2html(str, "^", "u", "circ");

    str = char2html(str, "r", "a", "ring");

    str = char2html(str, "c", "c", "cedil");
    str = char2html(str, "c", "s", "cedil");
    str = char2html(str, "v", "s", "caron");

    str = str.replace("\\ae", "&aelig;");
    str = str.replace("\\ss", "&szlig;");

    str = str.replace("\\o", "&oslash;");
    str = str.replace("\\O", "&Oslash;");
    str = str.replace("\\aa", "&aring;");
    str = str.replace("\\AA", "&Aring;");

    str = str.replace("\\l", "&#322");
    str = str.replace("\\L", "&#321");
    str = str.replace("\\k{a}", "&#261");
    str = str.replace("\\'{c}", "&#263");

    str = str.replace("\\v{c}", "&#269");
    str = str.replace("\\v{C}", "&#268");
    return str;
};

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Fetch publication bibtex (from fs in this case)
const pubDb = await fs.promises.readFile('../publications.bib', 'utf8').then((data) => {
    let bibFile = bibtex.parseBibFile(data);
    // Can't wait for object.groupby ...
    return bibFile.entries_raw.reduce((categorized, entry) => {
        const cat =
            categorized[bibtex.normalizeFieldValue(entry.getField("keywords"))] || [];
        cat.push(entry);
        categorized[bibtex.normalizeFieldValue(entry.getField("keywords"))] = cat;
        return categorized;
    }, {});
}).catch(err => console.log(err));

// Fetch categories
const categories = await fs.promises.readFile('../categories.json', 'utf8').then((data) => {
    return JSON.parse(data)
}).catch(err => console.log(err))

// Render as HTML. 
// XXX Not using proper components here to not introduce a bunch of libraries to do some relatively easy string manipulation.

const outHtml = Object.keys(categories).map((item) => (
  `<div>
      <h2 class="pub-cat">
        ${escape(categories[item])}
      </h2>
      ${!pubDb[item] ? "" : pubDb[item].map((pub) => (
        `<div>
          <h4 class="pub-title">
            <a
              href=${pub.getField("url") ? pub.getFieldAsString("url") : "#"}
              target="_blank"
            >${latex2html(pub.getFieldAsString("title"))}</a>
          </h4>
          <p class="pub-desc">
            <span>${latex2html(
                  pub.getFieldAsString("author")
                    .replace(/( and )(?=.*( and ))/g, ", ")
                )
              }</span>.
            ${!pub.getField("publisher") ? "" :
              ` Publisher: ${escape(pub.getFieldAsString("publisher"))},`}
            ${!pub.getField("booktitle") ? "" :  (
              `<span>
                In 
                <span class="italic">${escape(pub.getFieldAsString("booktitle"))}</span>,
              </span>`
            )}
            ${!pub.getField("journal") ? "" : 
              " " + escape(pub.getFieldAsString("journal")) + ","}
            ${!pub.getField("month") ? "" : 
              " " +
                capitalizeFirstLetter(
                  monthMapping[pub.getFieldAsString("month")]
                ) +
                " "}
            ${!pub.getField("year") ? "" : 
              " " + escape(pub.getFieldAsString("year")) + ". "}
            ${!pub.getField("comment") ? "" :  (
              `<span>${bibtex.normalizeFieldValue(pub.getField("comment"))}</span>`
            )}
            ${!pub.getField("doi") ? "" :  (
              `<span>
                <a
                  href=${
                    "https://doi.org/" + bibtex.normalizeFieldValue(pub.getField("doi"))
                  }
                  target="_blank"
                >
                  ${" "}
                  [doi]
                </a>
              </span>`
            )}
          </p>
        </div>`)).join('')}
    </div>`
  )).join('');

// Write the generated file
fs.writeFileSync('../index.html', outHtml)
