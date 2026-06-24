# WRITE!

## About

Writing tools made for my personal use case, publicly available for others to use as well. Everything functions with my preferences in mind. 

Features the following:

### Pomodoro Writer
- A writing tool with a 25 minute timer at every half hour (live clock), with a five minute break between sessions. 
- Visual and plain text editor, the latter of which supports both Markdown and basic HTML. 
- Theme, font, and style switchers. 
- Buttons for basic formatting, Select All, and Copy. 
- Reward system for every 100 and 1000 words. 
- Writing can be downloaded as an HTML webpage.

### Markdown to/from Rich Text Converter
- 2-panel rich text and markdown sync converter.
- Rich Text is Google Docs friendly, and preserves spaces around italics. The Rich Text on this page can then be pasted into AO3 with proper formatting. 
- Standardizes to one space between paragraphs. Repaste the Markdown to see Rich Text changes. 
- Does not support line breaks (shift+Enter).
- Provides analytics for word, character, and paragraph count and uniqueness; lengths of sentences and paragraphs; and frequently used phrases and words. 
- Download the Markdown as .txt. 

### HTML to/from Rich Text Converter
- 2-panel rich text and HTML sync converter. 
- Rich Text is Google Docs friendly, and preserves spaces around italics. The Rich Text on this page can then be pasted into AO3 with proper formatting. 
- Preserves additional paragraph breaks. 
- Does not support line breaks (shift+Enter).
- Provides analytics for word, character, and paragraph count and uniqueness; lengths of sentences and paragraphs; and frequently used phrases and words. 
- Download the HTML as .html. 

The index page links to [youshouldbewrit.ing](https://youshouldbewrit.ing) as well, but that's a separate project I made to guilt myself when I'm not writing. 

Input text is entirely private and saved to your browser's cache; if you clear your browser's cache/cookies, your text will be lost, so be sure to download/save it somewhere after each session. 

All pages are mobile-friendly, but generally best used on desktop. 

## Forking

This project is open source!

This means that if you want to put this project on your own servers and for your own purposes, please feel free to do so. I don't like fiddling with JavaScript and I know my preferences (such as the Pomodoro Timer using a live clock instead of manual splits) may not be shared, so anyone is welcome to download any of my code and adjust/reupload it to their own liking.

In addition to JavaScript and PHP, this project uses the following:

JavaScript:
- Quill

PHP via Composer: 
- league/HTML-To-Markdown
- league/CommonMark
- ezyang/HTMLPurifier
- erusev/Parsedown

All PHP dependencies are in /convert/vendor, but it would be best for you to pull those on your own instead of relying on mine. 