function searchHits(searchStr) {
	var numResults = 50,			// maximum number of results returned, pre-filter options
		tfidfThreshold = 0.5,		// threshold value to filter out bad matches by		
		i,
		j,
		searchArray,				// split the searchStr into pieces
		searchWord,					// word to be passed through stemming process
		filteredSearchArray = [],	// search array without stopwords
		matchArray,					// frequency array returned from invIdx hit on filteredSearchWord
		tf,							// term frequency in doc
		df,							// document frequency
		n,							// number of appearances of term
		tfidf,						// term frequency inverted document frequency score
		imageObjectIdx,				// id value of the imageObject
		tfidfDict = {},				// dictionary of imageArray index positions and arrays of tfidf values
		tempDictArray,				// temp array for getting and setting arrays to the tfidfDict
		freqArrays,					// array of two arrays: [[imageObjectIdxs],[frequencyOfOccurences]]
		tfidfSortedArray = [],		// sorted tfidf value array by matches in the inverted index
		tempReturnArray,			// temp array used to store reverseTfidf array and sorted array
		resultsArray = [];			// ImageElement index values that met the filter

	// split searchStr into parts
	searchArray = searchStr.split(" ");

	// filter out stopwords
	for(i = 0; i < searchArray.length; i++) {
		if(stopwords[searchArray[i]] !== 1) {
			searchWord = searchArray[i].toLowerCase();
			filteredSearchArray.push(stemWord(searchWord));	// stem before adding
		}
	}

	// for each word in filteredSearchArray, compute a tfidf sum
	// and push it to tfidfDict and tfidfSortedArray
	// "{ imagesArrayIdx#:[tfidfVals] }"
	// TFIDF = (1+log(tf))*log(N/df)
	// tf = # of occurences of the same number for a given term,
	// df = # of unique number occurences, n = invIdx[term].length
	for(i = 0; i < filteredSearchArray.length; i++) {
		matchArray = invIdx[filteredSearchArray[i]];
		// if the inverted index has a match for the searched word
		if (matchArray) {
			freqArrays = objIdxAndFreqs(matchArray);
			df = freqArrays[0].length;
			n = imageArray.length;

			// generate tf and tfids for each unique element in the index
			for(j = 0; j < freqArrays[0].length; j++) {
				imageObjectIdx = freqArrays[0][j];
				tf = freqArrays[1][j]; // get the frequency of the element in question
				tfidf = ((1+log10(tf))*log10(n/df)).toFixed(2);
				//console.log("word:"+filteredSearchArray[i]+" imageIndex:" + freqArrays[0][j] + " tfidf:"+tfidf);

				// if an array already exists, set the temp array to the existing one
				// otherwise just make a new array
				if(tfidfDict[imageObjectIdx]) {
					tempDictArray = tfidfDict[imageObjectIdx];
				} else {
					tempDictArray = [];
				}
				
				tempDictArray.push(tfidf);
				tfidfDict[imageObjectIdx] = tempDictArray;	// set array to the hashed value
			}
		}
	}

	// invert tfidfDict, change chained tfidfs to sums, sort descending
	tempReturnArray = invertSumSortTfidf(tfidfDict);
	tfidfDict = tempReturnArray[0];
	tfidfSortedArray = tempReturnArray[1];

	// add the top indexes that matched the search to bestIdxArray meeting the threshold
	for(i = 0; i < numResults && i < tfidfSortedArray.length; i++) {
		if(tfidfSortedArray[i] < tfidfThreshold) {
			continue;
		}

		if(tfidfDict[tfidfSortedArray[i]]) {
			tempDictArray = tfidfDict[tfidfSortedArray[i]];
			for(j = 0; j < tempDictArray.length; j++) {
				resultsArray.push(tempDictArray[j]);	// get the index of the top 5 items from the dictionary
			}
		} else {
			continue;
		}
	}

	return resultsArray;
}


// Helper Functions
function stemWord(word) {
	// perform stemming functions to trim, remove gerunds, participles, plurals etc.
	word = word.trim();
	// plurals
	if(word.charAt(word.length - 1) === 's') {
		if(word.charAt(word.length - 2) === '\'')
			word = word.substring(0, word.length-2);	//remove 's
		else
			word = word.substring(0, word.length-1);	//remove s
	}

	return word;
}

function invertSumSortTfidf(tfidfDict) {
	var i,
		j,
		tfidfSum = 0.0,
		tfidfSortedArray = [],
		invTfidfDict = {},
		tempDictArray;
	
	// compute sum on the arrays hashed by the dictionary
	for(i = 0; i < imageArray.length; i++) {
		tfidfSum = 0.0;	// reset tfidf sum
		if (tfidfDict[i]) {
			tempDictArray = tfidfDict[i];
			
			// combine tfidf values into one tfidfSum and round to 2 decimals
			for(j = 0; j < tempDictArray.length; j++) {
				tfidfSum += parseFloat(tempDictArray[j]);
			}
			tfidfSum = tfidfSum.toFixed(2);
			
			// setup the inverted tfidfDict
			if(invTfidfDict[tfidfSum]) {
				tempDictArray = invTfidfDict[tfidfSum];
			} else {
				tempDictArray = [];
			}

			tempDictArray.push(i);
			invTfidfDict[tfidfSum] = tempDictArray;
			
			// don't add duplicates because they will hash to the same bucket twice on results!
			if(tfidfSortedArray.indexOf(tfidfSum) === -1) {
				tfidfSortedArray.push(tfidfSum);
			}
		}
	}

	// sort the array
	tfidfSortedArray.sort(function(a,b){return b - a});
	return [invTfidfDict, tfidfSortedArray];
}

function log10(val) {
  return Math.log(val) / Math.LN10;
}

function objIdxAndFreqs(arr) {
    var objIdxs = [], objFreqs = [], prev;

    arr.sort();
    for ( var i = 0; i < arr.length; i++ ) {
        if ( arr[i] !== prev ) {
            objIdxs.push(arr[i]);
            objFreqs.push(1);
        } else {
            objFreqs[objFreqs.length-1]++;
        }
        prev = arr[i];
    }

    return [objIdxs, objFreqs];
}

// inverted index for food descriptors;
var invIdx = {
	"american":[1,2],
	"angu":[6,6],
	"apple":[8],
	"asahi":[2],
	"black":[6,6],
	"brocolli":[8],
	"burger":[1],
	"corona":[2],
	"costa":[0],
	"cupcake":[0],
	"dessert":[0],
	"farmer":[5],
	"frie":[6,7],
	"fruit":[4,5],
	"grill":[8,8],
	"hills":[1],
	"house":[7,7],
	"irvine":[6,7,8],
	"japanese":[3],
	"joe":[3],
	"johnny":[1],
	"kiwi":[4,5],
	"market":[4,5],
	"mesa":[0],
	"mother":[4],
	"orange":[8],
	"puente":[1],
	"rocket":[1],
	"sprinkle":[0],
	"sprout":[5],	
	"steak":[6,7],
	"strawberry":[4,5],
	"sushi":[2,3,3],
	"tustin":[3,4,5],
	"vegetable":[8],
	"veggie":[8,8],
	"yard":[7,7]
};

// Stopwords that should be removed from searching
var stopwords = {
	"a":1,
	"about":1,
	"above":1,
	"after":1,
	"again":1,
	"against":1,
	"all":1,
	"am":1,
	"an":1,
	"and":1,
	"any":1,
	"are":1,
	"aren't":1,
	"as":1,
	"at":1,
	"be":1,
	"because":1,
	"been":1,
	"before":1,
	"being":1,
	"below":1,
	"between":1,
	"both":1,
	"but":1,
	"by":1,
	"can't":1,
	"cannot":1,
	"could":1,
	"couldn't":1,
	"did":1,
	"didn't":1,
	"do":1,
	"does":1,
	"doesn't":1,
	"doing":1,
	"don't":1,
	"down":1,
	"during":1,
	"each":1,
	"few":1,
	"for":1,
	"from":1,
	"further":1,
	"had":1,
	"hadn't":1,
	"has":1,
	"hasn't":1,
	"have":1,
	"haven't":1,
	"having":1,
	"he":1,
	"he'd":1,
	"he'll":1,
	"he's":1,
	"her":1,
	"here":1,
	"here's":1,
	"hers":1,
	"herself":1,
	"him":1,
	"himself":1,
	"his":1,
	"how":1,
	"how's":1,
	"i":1,
	"i'd":1,
	"i'll":1,
	"i'm":1,
	"i've":1,
	"if":1,
	"in":1,
	"into":1,
	"is":1,
	"isn't":1,
	"it":1,
	"it's":1,
	"its":1,
	"itself":1,
	"let's":1,
	"me":1,
	"more":1,
	"most":1,
	"mustn't":1,
	"my":1,
	"myself":1,
	"no":1,
	"nor":1,
	"not":1,
	"of":1,
	"off":1,
	"on":1,
	"once":1,
	"only":1,
	"or":1,
	"other":1,
	"ought":1,
	"our":1,
	"ours":1,
	"ourselves":1,
	"out":1,
	"over":1,
	"own":1,
	"same":1,
	"shan't":1,
	"she":1,
	"she'd":1,
	"she'll":1,
	"she's":1,
	"should":1,
	"shouldn't":1,
	"so":1,
	"some":1,
	"such":1,
	"than":1,
	"that":1,
	"that's":1,
	"the":1,
	"their":1,
	"theirs":1,
	"them":1,
	"themselves":1,
	"then":1,
	"there":1,
	"there's":1,
	"these":1,
	"they":1,
	"they'd":1,
	"they'll":1,
	"they're":1,
	"they've":1,
	"this":1,
	"those":1,
	"through":1,
	"to":1,
	"too":1,
	"under":1,
	"until":1,
	"up":1,
	"very":1,
	"was":1,
	"wasn't":1,
	"we":1,
	"we'd":1,
	"we'll":1,
	"we're":1,
	"we've":1,
	"were":1,
	"weren't":1,
	"what":1,
	"what's":1,
	"when":1,
	"when's":1,
	"where":1,
	"where's":1,
	"which":1,
	"while":1,
	"who":1,
	"who's":1,
	"whom":1,
	"why":1,
	"why's":1,
	"with":1,
	"won't":1,
	"would":1,
	"wouldn't":1,
	"you":1,
	"you'd":1,
	"you'll":1,
	"you're":1,
	"you've":1,
	"your":1,
	"yours":1,
	"yourself":1,
	"yourselves":1,
};