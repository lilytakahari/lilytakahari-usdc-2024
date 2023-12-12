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
 * @returns {JSON} - Search results.
 * */ 
 function findSearchTermInBooks(searchTerm, scannedTextObj) {
    /** You will need to implement your search and 
     * return the appropriate object here. */

    var result = {
        "SearchTerm": "",
        "Results": []
    };
    
    return result; 
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
    console.log("PASS: Test compareContent")
} else {
    console.log("FAIL: Test compareContent")
}

/**
 * Unit test for the joinAdjLinesOnPage function.
 * Checks overall correctness on a normal input case.
 */
let testJoinresult = joinAdjLinesOnPage(0, twentyLeaguesIn[0].Content);
let testJoinresultIndices = testJoinresult.lineIndices;
if (testJoinresult.sectionText.charAt(testJoinresultIndices[1]) === 'n' &&
    testJoinresult.sectionText.charAt(testJoinresultIndices[2]) === 'e' &&
    testJoinresult.newIndex === 3) 
{
    console.log("PASS: Test expected behavior of joinAdjLinesOnPage")
} else {
    console.log("FAIL: Test expected behavior of joinAdjLinesOnPage")
}

/**
 * Unit test for the joinAdjLinesOnPage function.
 * Checks return of null upon receiving empty contentList.
 */
let testJoinInvalidresult = joinAdjLinesOnPage(0, []);
if (testJoinInvalidresult === null) {
    console.log("PASS: Test joinAdjLinesOnPage on empty contentList")
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
let testJoinDiffPageresult = joinAdjLinesOnPage(0, testJoinDiffLine);
if (testJoinDiffLineresult.newIndex === 1) {
    console.log("PASS: Test joinAdjLinesOnPage on non-same Page");
} else {
    console.log("FAIL: Test joinAdjLinesOnPage on non-same Page");
    console.log("Expected: newIndex === 1");
    console.log("Received:", testJoinDiffLineresult);
}