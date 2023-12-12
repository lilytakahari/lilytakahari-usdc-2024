
# findSearchTermInBooks

Project-based assessment for the Software Engineering track of the U.S. Digital Corps, completed by Lily Takahari (preferred name: Lee Takahari).

## Running this code

You will need to open the file `tester.html` in a browser to run the code that is contained in `book_search.js`. The output from running that code will appear in the browser's web developer console. Here is documentation for opening the web developer tools for Firefox:

https://firefox-source-docs.mozilla.org/devtools-user/browser_console/index.html#:~:text=You%20can%20open%20the%20Browser,%2B%20J%20on%20a%20Mac

And here are the instructions for Google Chrome:

https://developer.chrome.com/docs/devtools/open/

Either should work; we tested under both on Mac and Linux.

You will submit both the HTML and JavaScript files when you are done. You should not need to edit `tester.html`. We expect all of your work to appear in the file `book_search.js`. 

## Overall process and decision-making
For this (ambiguously defined) task of enabling search for a term in a list of scanned lines from a book, I decided to allow multi-word search terms that are case-sensitive and punctuation-sensitive, but whitespace-insensitive. Multi-word terms gives rise to the possibility of a phrase starting in one line and spanning multiple lines, or even spanning across multiple pages. Thus, the design of my solution centers around key assumptions and results in the following behavior:

#### Overall approach: 
Iterate through each book. For each book, sort the given array of Content into increasing page and line order. Then, iterate through the content to concatenate/join all the strings of consecutive lines on the same page into one large string. At the same time, create an array of indices that denote where those lines start within the large string. Then, use regular expressions to find the indices of all the occurrences of the term in the large string. Use binary search with the match index and the array of line indices to determine which line the term starts at. Add this start line to the results (ignore all the other lines that the term could span across). Finally, after all books and Content have been iterated through, return the results.

1. *Assumption:* The search term is a complete, well-formed word or multi-word phrase, and we want results that match that complete word/phrase. *Behavior:* As an example, if we search for `my` in the text `myself and I`, there will be no results since we assume that we are looking for the word `my`. The search will not match on `myself`.
2. *Assumption:* If multiple matches occur in the same line, we prefer that our results show an equal number of results, even if the information contained is the same, to denote that there are multiple unique matches. *Behavior:* As assumed, if  Line 1 is `a cat and a dog and a rat`, the results for `a` will contain three of the "same" objects.
3. *Assumption:* It's possible that the scanned content and/or the search term contain extra whitespace or other unwanted artifacts, which complicates the process if we search by matching exact strings. *Behavior:* I "clean" both the search term and the scanned content by condensing duplicate whitespaces into one space and trimming whitespace at the beginning or end of a string. There could be other artifacts that need to be removed, which can be added into the function that does the cleaning.
4. *Assumption:* The scanned content input has not been rigorously checked as being accurate to the text and information about the book. For example, ISBN or Content objects for some lines on the page could be missing or incorrect. *Behavior:* I do the best with the information I do have. If the ISBN is missing, the results become useless, so I ignore books without it. But if it were incorrect, I have no way of telling if it is. Since the lines on the page could be missing, I choose to only join adjacent lines on the same page. __Note:__ This assumption causes the FAILURE of the case when a search term starts at the bottom of one page and continues onto the next page; further work is needed to address this edge case.
5. *Assumption:* Lines that end with a hyphen (`-`) denote that a word has been split across the lines, like the word `darkness` in the given *Twenty Thousand Leagues* example. *Behavior:* When joining these lines, instead of adding a space at the end, we remove the hyphen before concatenating the next line. __Note:__ This assumption will break our search function when the line actually ends with an em dash that is represented as 1-2 hyphens, and the search term includes this em dash/emphasis phrase; further work is needed to address this edge case.
6. *Assumption:* Pages are not very long pieces of text, so the memory needed to store the large string that concatenates them will be small. *Behavior:* I use this assumption to justify joining the lines to enable the multi-word search that spans multiple lines.

## Testing and Iteration
#### Strategy for writing tests:
Since I wrote several helper functions, I first wrote 1-2 unit tests for them covering expected behavior under normal conditions and some negative cases. For the overall search function, I wrote tests to target the above assumptions, both negative and positive results. These tests include corner cases like the hyphenated split word, multiple results in the same line, and extra whitespace. I intended to achieve high coverage of my code. If I had more time to make the tests more robust, I would more carefully analyze the equivalence classes of possible inputs and write tests for positive, negative and error cases of those classes.

#### What parts of the solution I'm most proud of:
I think I did a decent job at coding modular, reusable functions, so I'm a bit proud of that. I'm also proud of the debugging I did when I encountered a few infinite loop bugs. I don't have much experience with JavaScript, so I never debugged JS with Chrome Developer Tools before, but it worked like other debuggers and I solved my bugs by stepping through the lines.

#### Most difficult part to solve:
The most difficult part to solve was the initial design decision process. I spent too much time overthinking before deciding on this solution, which is much simpler than what I tried thinking about initially. While coding this solution, I encountered a couple bugs, but the simplicity helped me determine the root causes quickly.

## Credit/References:
- I needed to create a dynamic regular expression from a string variable, which would require me to escape any of the special characters inside the string variable before creating the regex from it. I used the exact code of an [escapeRegExp() function posted on Stack Overflow by user coolaj86 (AJ ONeal)](https://stackoverflow.com/a/6969486).
- I needed to find all the indices of regex matches, which I could not find a simple answer to in the JavaScript String documentation. I adapted [code posted on Stack Overflow by user Gumbo (Markus Wulftange)](https://stackoverflow.com/a/2295681), which introduced me to the RegExp library.
- I use ChatGPT to help me code specific tasks that went into my solution. Specifically, the function using binary search for the line index, and to convert a text description of the regex I needed into actual regex code. I used ChatGPT because 1. Binary search can easily be mis-coded without being careful about all the indices, and 2. My knowledge of the various regex literals is lacking. I understand that ChatGPT has likely been trained on information posted by helpful developers onto the Internet, and I am grateful for these resources.
