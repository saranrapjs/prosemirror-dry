const {Plugin} = require("prosemirror-state")
const {DecorationSet,Decoration} = require("prosemirror-view")

export default class Dry extends Plugin {
  constructor(wordLengthMinimum = 3) {
    super({
      state: {
        init(cfg) { return this.getRepetitions(cfg.doc) },
        apply(tr, set) {
          if (tr.docChanged) {
            return this.getRepetitions(tr.doc);
          }
          return set;
        }
      },
     props: {
       decorations(state) { return this.getState(state) }
     }
    });
    this.wordLengthMinimum = wordLengthMinimum;
  }

  getRepetitions(doc) {
    const counts = {};
    doc.descendants((node, pos) => {
      if (node.isText) {
       let start = pos;
       node.textContent.split(' ').forEach((word, i) => {
         const countWord = word.replace(/[^A-Za-z0-9]/g, '').toLowerCase()
         if (countWord.length > this.wordLengthMinimum) {
           counts[countWord] = counts[countWord] || [];
           const ranges = [];
           word.replace(/[A-Za-z0-9]+/g, (chars, index) => {
            ranges.push([start + index, start + index + chars.length]);
           });
           counts[countWord].push(ranges);
         }
         start += word.length + 1
       });
      }
    });
    let set = DecorationSet.empty;
    Object.keys(counts).forEach(word => {
      if (counts[word].length > 1) {
        counts[word].forEach(ranges => {
          ranges.forEach(([ start, end ]) => {
            set = set.add(doc, [Decoration.inline(start, end, { style: 'background:rgba(128, 0, 128, 0.29);' })]);
          });
        });
      }
    });
    return set;
  }

}
