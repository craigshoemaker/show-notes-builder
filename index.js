const fs = require('fs');
const marked = require('marked');
const path = require('path');

const args = process.argv.slice(2);
const guestName = args[0];

let data = fs.readFileSync(path.join(__dirname, 'data', 'transcript.txt'), 'utf-8');
data = data.replace(/Speaker 1/gm, '### Craig Shoemaker');
data = data.replace(/Speaker 2/gm, `### ${ guestName }`);
data = data.replace(/Speaker ?\r\n\r\n.*\r\n\r\n/gm, ''); // unidentified speaker

const segments = data.split('\n');
const sectionSize = Math.ceil(segments.length / 6);
const sections = [];
for (let i = 0; i < segments.length; i += sectionSize) {
  const section = segments.slice(i, i + sectionSize).join('\n');
  sections.push(section);
}

const getPrompt = (section) => `
<div>
<textarea style="width:90%;margin:2em;height:9em;" onclick="this.select();">
Summarize the following text highlighting the most important ideas as bullet points.
TEXT:
${section}
</textarea>
</div>`;

const getMarkup = (html) => `
<div>
<textarea style="width:90%;margin:2em;height:9em;" onclick="this.select();">
&lt;details&gt;&lt;summary&gt;Click to view transcript&lt;/summary&gt;
${html}
&lt;/details&gt;
</textarea>
</div>`;

let result = [];
result.push('<h2 style="margin-left:2em;">Prompts</h2>');
result.push(sections.map((item) => getPrompt(item)));

try {
  result.push(`<h2 style="margin-left:2em;">Transcript</h2>`);
  result.push(getMarkup(marked.parse(data)));
  fs.writeFileSync(path.join(__dirname, 'data', 'markup.html'), result.join('\n'));
} catch (e) {
  console.error(JSON.stringify(e));
}
