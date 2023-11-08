const fs = require('fs');
const marked = require('marked');
const path = require('path');

let args = process.argv.slice(2);
let guest = args[0];
// let speaker2 = args[1];

// if only one name is passed in, 
// assume Speaker 1 is Craig and 
// Speaker 2 is the guest 
// if(speaker2.length === 0) {
//   speaker1 = "Craig Shoemaker";
//   speaker2 = args[0];
// }

const guestPattern = new RegExp(`${guest}:? \(.*\)?`, 'gm');

let data = fs.readFileSync(path.join(__dirname, 'data', 'transcript.txt'), 'utf-8');
data = data.replace(/Craig Shoemaker:? \(.*\)?/gm, `### Craig Shoemaker`);
data = data.replace(guestPattern, `### ${guest}`);
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
Load the following text as a chunk.

**IMPORTANT**: Do not respond to the following input, just add it to the text you're loading into memory.

Here is the next chunk:

${section}
</textarea>
</div>`;

const getMarkup = (html) => `
<div>
<textarea style="width:90%;margin:2em;height:9em;" onclick="this.select();">
&lt;details&gt;&lt;summary&gt;Click to view transcript&lt;/summary&gt;
&lt;blockquote&gt;
This is an unedited, machine-generated transcript. There are spelling and grammatical errors to follow.
&lt;/blockquote&gt;
${html}
&lt;/details&gt;
</textarea>
</div>`;

let result = [];
result.push('<h2 style="margin-left:2em;">Prompts</h2>');
result.push(`<textarea onclick="this.select()">
I am going to give you a transcript of a podcast conversation. This conversation will be given to you in separate chunks of text in Markdown format. As I provide each chunk to you, please append the latest chunk to the previous in memory.

As I provide chunks of text to you, please only respond with "Ready for the next chunk", and continue to load and append each chunk together until I give you the command "LOAD_COMPLETE".

After I give you the "LOAD_COMPLETE" command, then I'll provide additional prompts.

**This is important**: Do not generate any response on the text.

Please reply with "Ready" if you understand and are ready to begin with the first chunk of text.
</textarea>`);
result.push(`<h3 style="margin-left:2em;">Segments: ${sections.length}</h3>`);
result.push(sections.map((item) => getPrompt(item)));

try {
  result.push(`<h2 style="margin-left:2em;">Transcript</h2>`);
  result.push(getMarkup(marked.parse(data)));
  fs.writeFileSync(path.join(__dirname, 'data', 'markup.html'), result.join('\n'));
} catch (e) {
  console.log(`Error: ${JSON.stringify(e)}`);
}
