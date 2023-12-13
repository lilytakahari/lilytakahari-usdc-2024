/** 
 * RECOMMENDATION
 * 
 * To test your code, you should open "tester.html" in a web browser.
 * You can then use the "Developer Tools" to see the JavaScript console.
 * There, you will see the results unit test execution. You are welcome
 * to run the code any way you like, but this is similar to how we will
 * run your code submission.
 * 
 * The Developer Tools in Chrome are available under the "..." menu, 
 * futher hidden under the option "More Tools." In Firefox, they are 
 * under the hamburger (three horizontal lines), also hidden under "More Tools." 
 */

/**
 * Searches for matches in scanned text.
 * @param {string} searchTerm - The word or term we're searching for. 
 * @param {JSON} scannedTextObj - A JSON object representing the scanned text.
 * @returns {JSON} - Search results specifying the page+line that contains the start
 *                   of the search term
 * */ 
 function findSearchTermInBooks(searchTerm, scannedTextObj) {
    let result = {
        "SearchTerm": searchTerm,
        "Results": []
    };

    // Clean the search term string before using it
    let cleanTerm = cleanText(searchTerm);

    // Iterate through each book
    for (let i = 0; i < scannedTextObj.length; i++) {
        // Check that the book has actual scanned content and a non-empty ISBN
        let bookContent = scannedTextObj[i].Content;
        if (bookContent == null || bookContent.length === 0) {
            continue;
        }
        let isbn = scannedTextObj[i].ISBN;
        if (isbn == null) {
            continue;
        }

        // Sort the book content in increasing page and line order
        bookContent.sort(compareContent);

        // Iterate through Content to join the lines of the pages of the book
        let contentIndex = 0;
        while (contentIndex < bookContent.length) {
            let joinResult = joinAdjLinesOnPage(contentIndex, bookContent);
            contentIndex = joinResult.newIndex;

            // Search the term in the page text using regex
            let matchResults = findAllRegexMatches(cleanTerm, joinResult.sectionText);

            // Iterate through all matches, determine the line number where the match starts
            // Add that starting line number to the results
            for (let m = 0; m < matchResults.length; m++) {
                let pageIndex = findLeftNearestIndex(matchResults[m], joinResult.lineIndices); 
                let lineResult = {
                    "ISBN": isbn, 
                    "Page": joinResult.page, 
                    "Line": joinResult.startLine + pageIndex
                };
                result.Results.push(lineResult);
            }
        }
    }

    return result; 
}


/**
 * Escapes special characters in a string to create a valid regular expression,
 * to treat the string as a literal pattern in a regular expression.
 * 
 * Original code from: https://stackoverflow.com/a/6969486
 * Credit to Stack Overflow user: coolaj86 (AJ ONeal)
 * @param {string} string - The input string to escape.
 * @returns {string} - The escaped string.
 */
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Finds all indices of a given word/term in a text using a regular expression.
 * 
 * Adapted from: https://stackoverflow.com/a/2295681
 * RegExp constructed with help from ChatGPT, which was likely trained on information
 * from the many helpful devs who put Regex education onto the Internet.
 * @param {string} word - The word/term to search for.
 * @param {string} text - The text in which to search for the term.
 * @returns {number[]} - An array containing the starting indices of all matches.
 */
function findAllRegexMatches(word, text) {
    let results = [];
    var re = new RegExp(`(?:^|\\W)${escapeRegExp(word)}(?:$|\\W)`, 'g');
    while ((match = re.exec(text)) != null) {
        let matchIndex = match.index;
        // If the character at the index is non-word, increment by 1 to obtain
        // index of the actual word/phrase
        if (/\W/.test(text.charAt(match.index))) {
            matchIndex += 1;
        }
        results.push(matchIndex);
    }
    return results;
}

/**
 * Finds the index of the nearest number to the left of a given number, in a sorted array of numbers.
 * @param {number} x - The given number.
 * @param {number[]} nums - The sorted array of numbers.
 * @returns {number} - The index of the number to the left.
 */
function findLeftNearestIndex(x, nums) {
    // Use binary search to find the closest index to the left
    let low = 0;
    let high = nums.length - 1;
    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const midValue = nums[mid];

        if (midValue <= x) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }

    // At this point, low is the insertion point, and high is the index before it
    const closestIndex = high;
    return closestIndex;
}

/**
 * Cleans up a text string by removing any unwanted artifacts.
 * @param {string} text - The input text to be cleaned.
 * @returns {string} - The cleaned text.
 */
function cleanText(text) {
    // Currently, only condenses extra whitespaces and removes leading/trailing spaces
    return text.replace(/\s+/g,' ').trim();
}

/**
 * Returns the line with either a space or without an ending hyphen.
 * @param {string} line - The line to change.
 * @returns {string} - The processed line.
 */
function processLineEnd(line) {
    let new_line = '';
    if (line.charAt(line.length - 1) === '-') {
        // Remove the hyphen
        new_line = line.slice(0, -1);
    } else {
        // Otherwise, add a space
        new_line = line + ' ';
    }
    return new_line;
}

/**
 * Compares content to be ordered by increasing page, then by increasing line.
 * @param {Object} a - The first object to compare.
 * @param {Object} b - The second object to compare.
 * @returns {number} - Negative value if 'a' comes before 'b', positive value if 'a' 
 *                     comes after 'b', 0 if they are equal.
 */
function compareContent(a, b) {
    // Compare by 'Page'
    if (a.Page < b.Page) {
        return -1;
    } else if (a.Page > b.Page) {
        return 1;
    } 

    // If 'Page' properties are equal, compare by 'Line'
    if (a.Line < b.Line) {
        return -1;
    } else if (a.Line > b.Line) {
        return 1;
    }
    
    // If both 'Page' and 'Line' properties are equal
    return 0;
}

/**
 * Joins the text of adjacent lines on the same page, starting with line with the given index.
 * @param {number} index - The index of the first line to start joining.
 * @param {Object[]} contentList - The list of content objects, in sequential page/line order.
 * @returns {?Object} - Null if invalid input. Otherwise, an object containing index of the
 *                      new line in the list that was not joined,
 *                      the joined text's page number, start line of content, number[] array of indices
 *                      where each line starts within the joined text, and the actual text.
 */
function joinAdjLinesOnPage(index, contentList) {
    // Check for invalid conditions: empty content list, invalid index range
    if (contentList.length === 0 || index < 0 || index >= contentList.length ) {
        return null;
    }

    // Initialize variables to track current page, starting line of section, section text, and line indices
    let currPage = contentList[index].Page;
    let startLine = currLine = contentList[index].Line;
    let sectionText = processLineEnd(cleanText(contentList[index].Text));
    let lineIndices = [0];
    index += 1;
    
    // Iterate through contentList to join adjacent lines on the same page
    while (index < contentList.length) {
        // Check if the next line is adjacent to the current line
        if (contentList[index].Page !== currPage || contentList[index].Line !== currLine + 1) {
            break; // Exit the loop if not adjacent
        }

        // Clean text and prepare to add to section text.
        let cleaned = cleanText(contentList[index].Text);
        // If the line ends in hyphen, (we assume) a word has been split across lines
        let toAdd = processLineEnd(cleaned);
        
        // Add the current text length to the array; this is the start index of the new line in the text
        lineIndices.push(sectionText.length);
        // Now add the new line's text to the overall section
        sectionText += toAdd;

        currLine += 1;
        index += 1;
    }

    results = {
        newIndex: index,
        page: currPage,
        startLine: startLine,
        lineIndices: lineIndices,
        sectionText: sectionText,
    }
    return results;
}

/** Example input object. */
const twentyLeaguesIn = [
    {
        "Title": "Twenty Thousand Leagues Under the Sea",
        "ISBN": "9780000528531",
        "Content": [
            {
                "Page": 31,
                "Line": 8,
                "Text": "now simply went on by her own momentum.  The dark-"
            },
            {
                "Page": 31,
                "Line": 9,
                "Text": "ness was then profound; and however good the Canadian\'s"
            },
            {
                "Page": 31,
                "Line": 10,
                "Text": "eyes were, I asked myself how he had managed to see, and"
            } 
        ] 
    }
]
    
/** Example output object */
const twentyLeaguesOut = {
    "SearchTerm": "the",
    "Results": [
        {
            "ISBN": "9780000528531",
            "Page": 31,
            "Line": 9
        }
    ]
}

/*
 _   _ _   _ ___ _____   _____ _____ ____ _____ ____  
| | | | \ | |_ _|_   _| |_   _| ____/ ___|_   _/ ___| 
| | | |  \| || |  | |     | | |  _| \___ \ | | \___ \ 
| |_| | |\  || |  | |     | | | |___ ___) || |  ___) |
 \___/|_| \_|___| |_|     |_| |_____|____/ |_| |____/ 
                                                      
 */

/* We have provided two unit tests. They're really just `if` statements that 
 * output to the console. We've provided two tests as examples, and 
 * they should pass with a correct implementation of `findSearchTermInBooks`. 
 * 
 * Please add your unit tests below.
 * */

/** We can check that, given a known input, we get a known output. */
const test1result = findSearchTermInBooks("the", twentyLeaguesIn);
if (JSON.stringify(twentyLeaguesOut) === JSON.stringify(test1result)) {
    console.log("PASS: Test 1");
} else {
    console.log("FAIL: Test 1");
    console.log("Expected:", twentyLeaguesOut);
    console.log("Received:", test1result);
}

/** We could choose to check that we get the right number of results. */
const test2result = findSearchTermInBooks("the", twentyLeaguesIn); 
if (test2result.Results.length == 1) {
    console.log("PASS: Test 2");
} else {
    console.log("FAIL: Test 2");
    console.log("Expected:", twentyLeaguesOut.Results.length);
    console.log("Received:", test2result.Results.length);
}

/** 
 * Negative test: Under assumption that the search term is a complete, well-formed
 * word or phrase, searching 'my' will not return results, even though
 * 'myself' exists in twentyLeaguesIn
 */
const test3result = findSearchTermInBooks("my", twentyLeaguesIn);
if (test3result.Results.length === 0 && test3result.SearchTerm == "my") {
    console.log("PASS: Test 3 - Negative result, Complete search term assumption");
} else {
    console.log("FAIL: Test 3 - Negative result, Complete search term assumption");
}

/** 
 * Negative test: Text is not at all present.
 */
const test4result = findSearchTermInBooks("cowabunga", twentyLeaguesIn);
if (test4result.Results.length === 0) {
    console.log("PASS: Test 4 - Negative result, Term is not at all present in text");
} else {
    console.log("FAIL: Test 4 - Negative result, Term is not at all present in text");
}

/** 
 * Negative test: Case-sensitive.
 */
const test5result = findSearchTermInBooks("canadian", twentyLeaguesIn);
if (test5result.Results.length === 0) {
    console.log("PASS: Test 5 - Negative result, Case-sensitive");
} else {
    console.log("FAIL: Test 5 - Negative result, Case-sensitive");
}

/** 
 * Positive test: Word has been hyphen split at the end of the line
 */
const test6result = findSearchTermInBooks("darkness", twentyLeaguesIn);
if (test6result.Results.length === 1 && test6result.Results[0].Page === 31 
    && test6result.Results[0].Line === 8) {
    console.log("PASS: Test 6 - Positive result, Split hyphenated word at end of line");
} else {
    console.log("FAIL: Test 6 - Positive result, Split hyphenated word at end of line");
}

/** 
 * Positive test: Multi-word search term spans multiple lines
 */
const test7result = findSearchTermInBooks("the Canadian's eyes", twentyLeaguesIn);
if (test7result.Results.length === 1 && test7result.Results[0].Page === 31 
    && test7result.Results[0].Line === 9) {
    console.log("PASS: Test 7 - Positive result, Multi-word search term spans multiple lines");
} else {
    console.log("FAIL: Test 7 - Positive result, Multi-word search term spans multiple lines");
}

/** 
 * Positive test: Multi-word search term contained in only one line
 */
const test8result = findSearchTermInBooks("on by her own momentum", twentyLeaguesIn);
if (test8result.Results.length === 1 && test8result.Results[0].Page === 31 
    && test8result.Results[0].Line === 8) {
    console.log("PASS: Test 8 - Positive result, Multi-word search term contained in only one line");
} else {
    console.log("FAIL: Test 8 - Positive result, Multi-word search term contained in only one line");
}

/** 
 * Positive test: Search term contained multiple times in one line
 */
const testMultiple = [
    {
        "Title": "",
        "ISBN": "1",
        "Content": [
            {
                "Page": 2,
                "Line": 1,
                "Text": "landing to sing a while."
            },
            {
                "Page": 1,
                "Line": 1,
                "Text": "as a bird flew onto a branch,"
            }
        ] 
    }
]
const test9result = findSearchTermInBooks("a", testMultiple);
if (test9result.Results.length === 3 && test9result.Results[1].Page === 1
    && test9result.Results[0].Line === 1) {
    console.log("PASS: Test 9 - Positive result, Search term contained multiple times in one line");
} else {
    console.log("FAIL: Test 9 - Positive result, Search term contained multiple times in one line");
}

/** 
 * Positive test: Dirty search term in dirty text
 */
const testDirty = [
    {
        "Title": "",
        "ISBN": "1",
        "Content": [
            {
                "Page": 1,
                "Line": 2,
                "Text": "lot's of \t extra  spaces"
            },
        ] 
    },
    {
        "Title": "",
        "ISBN": "2",
        "Content": [
            {
                "Page": 3,
                "Line": 4,
                "Text": "  extra spaces"
            },
        ] 
    },
]
const test10result = findSearchTermInBooks(" \n extra  spaces", testDirty);
if (test10result.Results.length === 2 && test10result.Results[1].ISBN === "2") {
    console.log("PASS: Test 10 - Positive result, Dirty search term in dirty text");
} else {
    console.log("FAIL: Test 10 - Positive result, Dirty search term in dirty text");
}

/** 
  * Negative test: Phrase spans multiple pages
  * TODO: Decide if the scanned content input won't have missing lines.
  */
const test11result = findSearchTermInBooks("a branch, landing to sing", testMultiple);
if (test11result.Results.length === 0) {
    console.log("PASS: Test 11 - Negative result, Phrase spans multiple pages");
} else {
    console.log("FAIL: Test 11 - Negative result, Phrase spans multiple pages");
}

/**
 * Unit test for the compareContent function.
 * Ensure that it orders the Content array correctly.
 */
const twentyLeaguesScrambled = [
    {
        "Title": "Twenty Thousand Leagues Under the Sea",
        "ISBN": "9780000528531",
        "Content": [
            {
                "Page": 31,
                "Line": 8,
                "Text": "now simply went on by her own momentum.  The dark-"
            },
            {
                "Page": 31,
                "Line": 10,
                "Text": "eyes were, I asked myself how he had managed to see, and"
            },
            {
                "Page": 31,
                "Line": 9,
                "Text": "ness was then profound; and however good the Canadian\'s"
            },
        ] 
    }
]
twentyLeaguesScrambled[0].Content.sort(compareContent)
if (JSON.stringify(twentyLeaguesScrambled) === JSON.stringify(twentyLeaguesIn)) {
    console.log("PASS: Test compareContent");
} else {
    console.log("FAIL: Test compareContent");
}

/**
 * Unit test for the joinAdjLinesOnPage function.
 * Checks overall correctness on a normal input case.
 */
let testJoinresult = joinAdjLinesOnPage(0, twentyLeaguesIn[0].Content);
let testJoinresultIndices = testJoinresult.lineIndices;
let expectedText = `now simply went on by her own momentum. The darkness was then profound; \
and however good the Canadian's eyes were, I asked myself \
how he had managed to see, and `;

if (testJoinresult.sectionText.charAt(testJoinresultIndices[1]) === 'n' &&
    testJoinresult.sectionText.charAt(testJoinresultIndices[2]) === 'e' &&
    testJoinresult.newIndex === 3 &&
    testJoinresult.sectionText === expectedText) 
{
    console.log("PASS: Test joinAdjLinesOnPage expected behavior");
} else {
    console.log("FAIL: Test joinAdjLinesOnPage expected behavior");
}

/**
 * Unit test for the joinAdjLinesOnPage function.
 * Checks return of null upon receiving empty contentList.
 */
let testJoinInvalidresult = joinAdjLinesOnPage(0, []);
if (testJoinInvalidresult === null) {
    console.log("PASS: Test joinAdjLinesOnPage on empty contentList");
} else {
    console.log("FAIL: Test joinAdjLinesOnPage on empty contentList");
    console.log("Expected: null");
    console.log("Received:", testJoinInvalidresult);
}

/**
 * Unit test for the joinAdjLinesOnPage function.
 * Checks correct newIndex when joining lines starting from Line 1.
 */
const testJoinDiffLine = [
    {
        "Page": 1,
        "Line": 1,
        "Text": "include me"
    },
    {
        "Page": 1,
        "Line": 3,
        "Text": "DON'T include me"
    },
] 
let testJoinDiffLineresult = joinAdjLinesOnPage(0, testJoinDiffLine);
if (testJoinDiffLineresult.newIndex === 1) {
    console.log("PASS: Test joinAdjLinesOnPage on non-adjacent Line");
} else {
    console.log("FAIL: Test joinAdjLinesOnPage on non-adjacent Line");
    console.log("Expected: newIndex === 1");
    console.log("Received:", testJoinDiffLineresult);
}

/**
 * Unit test for the joinAdjLinesOnPage function.
 * Checks correct newIndex when encountering different pages.
 */
const testJoinDiffPage = [
    {
        "Page": 1,
        "Line": 4,
        "Text": "include me"
    },
    {
        "Page": 2,
        "Line": 5,
        "Text": "DON'T include me"
    },
] 
let testJoinDiffPageresult = joinAdjLinesOnPage(0, testJoinDiffPage);
if (testJoinDiffPageresult.newIndex === 1) {
    console.log("PASS: Test joinAdjLinesOnPage on non-same Page");
} else {
    console.log("FAIL: Test joinAdjLinesOnPage on non-same Page");
    console.log("Expected: newIndex === 1");
    console.log("Received:", testJoinDiffPageresult);
}

/**
 * Unit test for the findLeftNearestIndex function.
 * Checks correct indices retuned on a typical use case for our page index search.
 */
let testLeft = [findLeftNearestIndex(-1, [0, 25, 33]), findLeftNearestIndex(25, [0, 25, 33]), 
                findLeftNearestIndex(52, [0, 25, 33])];
if (testLeft[0] === -1 && testLeft[1] === 1 && testLeft[2] === 2) {
    console.log("PASS: Test findLeftNearestIndex");
} else {
    console.log("FAIL: Test findLeftNearestIndex");
}

/**
 * Unit test for the findAllRegexMatches function.
 * Checks correct indices retuned on a typical use case for our page index search.
 */
let testRegex = findAllRegexMatches('hot dog', 'hot dog, hot doggity, hot dog! hot dog3, Hot Dog');
if (testRegex.length === 2 && testRegex[0] === 0 && testRegex[1] === 22) {
    console.log("PASS: Test findAllRegexMatches");
} else {
    console.log("FAIL: Test findAllRegexMatches");
}