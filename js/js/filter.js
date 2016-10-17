/*
	// Sample Object

	ImageElement = {
		id: 'Churros-1',
        foodName: 'Churros',
        url: 'image_server/churros.jpg',
        categories: ['snack', 'carnival', 'sweet', 'dessert'],
        restName: 'Costco',
        location: 'Puente Hills',
        rating: '4.0',
        reviews: [],
        similarRestaurants: [ {id: 27, name: 'Churro Bar', tags: ['churros']} ]
    }
*/

// This is a simple ImageElement Object
function ImageElement(obj) {
	this.imageServerUrlBase = 'server/uploads/';

	this.id = obj.id,
	this.foodName = obj.foodName;
	this.url = obj.url;
	this.categories = obj.categories;
	this.restName = obj.restName;
	this.location = obj.location;
	this.rating = obj.rating;
	this.cost = obj.cost;
	this.noise = obj.noise;
	this.reviews = obj.reviews;
	this.similarRestaurants = obj.similarRestaurants;

	return {
		id: this.id,
		foodName: this.foodName,
		url: this.url,
		categories: this.categories,
		restName: this.restName,
		location: this.location,
		rating: this.rating,
		cost: this.cost,
		noise: this.noise,
		reviews: this.reviews,
		similarRestaurants: this.similarRestaurants
	};
}

// This is an Array/Graph of all the Image Element Objects.  It should dynamically load each one and
// 	manage the state of each Image Element.
function ImageGraph(arrayOfAllImageElement) {
	// Local Variables for Sandbox Quicksand
	var $itemsHolder = $('ul.thumbnails');
    var $itemsClone = $itemsHolder.clone(); 
    var $filterClass = "";

    function activateGallery() {
		$('#cup1').click(function() { bootbox.alert('<img src="server/uploads/cupcake.jpg"><h4>Cupcake</h4>'); });
	    $('#bur1').click(function() { bootbox.alert('<img src="server/uploads/burger.jpg"><h4>Burger</h4>'); });
	    $('#veg1').click(function() { bootbox.alert('<img src="server/uploads/vegtetables.jpg"><h4>Veges</h4>'); });
	    $('#fru1').click(function() { bootbox.alert('<img src="server/uploads/fruits.jpg"><h4>Fruits</h4>'); });
	    $('#ste1').click(function() { bootbox.alert('<img src="server/uploads/steak.jpg"><h4>Steak</h4>'); });
	    $('#ste2').click(function() { bootbox.alert('<img src="server/uploads/steak1.jpg"><h4>Steak</h4>'); });
	    $('#sus1').click(function() { bootbox.alert('<img src="server/uploads/sushi.jpg"><h4>Sushi</h4>'); });
	    $('#sus2').click(function() { bootbox.alert('<img src="server/uploads/sushi.jpg"><h4>Sushi</h4>'); });
	    $('#bird3').click(function() { bootbox.alert('<img src="images/bird3.jpg"><h4></h4>'); });
	    $('#dog4').click(function() { bootbox.alert('<img src="images/dog4.jpg"><h4></h4>'); });
    }
	activateGallery();


    // Old
	this.imageArray = arrayOfAllImageElement;

	function addImage(newImageElement) {
		this.imageArray.push(newImage);
	}

	function removeImage(imageElementIndice) {
		this.imageArray.splice(imageElementIndice, 1);
	}

	function updateView(categoryFilter) {
		var i,
			j,
			searchResults = [];

		if (categoryFilter.length === 0) {
			var ratingSelected = $('input[name="rating"]:checked').length > 0,
				costSelected = $('input[name="cost"]:checked').length > 0,
				noiseSelected = $('input[name="noise"]:checked').length > 0;

			// if no faceted options selected, then just set everything to show
			if(!ratingSelected && !costSelected && !noiseSelected) {
				for (var imgEl in this.imageArray) {
					if ($('#' + this.imageArray[imgEl].id).css('display') === 'none') {
						// Show
						console.log('show');
						$('#' + this.imageArray[imgEl].id).fadeIn('500');
					}
				}
				return;
			} else {
				// if faceted options, need to build a fake search result array to be filtered
				for(i = 0; i < this.imageArray.length; i++) {
					searchResults.push(i);
				}
				searchResults = facetedResults(searchResults);	
			}
		} else {
			// Run a relevance search given the categoryFilter, returning the element Ids we should enable
			// in the order of how they should be displayed
			searchResults = searchHits(categoryFilter[0]);

			// Apply faceted filter options to search results
			searchResults = facetedResults(searchResults);			
		}
		console.log(searchResults);

		// Iterate through all elements.  If not match hide it if shown, otherwise show it if hidden
		for (i = 0; i < this.imageArray.length; i++) {
			if(searchResults.indexOf(i) === -1) {
				if ($('#' + this.imageArray[i].id).css('display') !== 'none') {
					$('#' + this.imageArray[i].id).fadeOut('500');
				}
			} else {
				if ($('#' + this.imageArray[i].id).css('display') === 'none') {
					$('#' + this.imageArray[i].id).fadeIn('500');
				}
			}		
		}


    	//$filterClass = $(this).attr('data-value');
    	$filterClass = 'dog';
        if($filterClass == 'all'){ var $filters = $itemsClone.find('li'); }
        else { var $filters = $itemsClone.find('li[data-type='+ $filterClass +']'); }
        
        $itemsHolder.quicksand(
			$filters,
			{ duration: 1000 },
			activateGallery
      	);
	}

	return {
		updateView: updateView,
		addImage: addImage,
		removeImage: removeImage,
		imageArray: this.imageArray
	};
}

// filter out any results that don't meet the requirements
function facetedResults(resultsArray) {
	var i,
		j,
		imgElement,
		ratingMin = 0,	// int star rating value
		ratingGroup = $('input[name="rating"]:checked'),
		splitStrings,
		costMin = [0],		// lowerbound ints cost value
		costMax = [999],	// upperbound ints cost value
		costGroup = $('input[name="cost"]:checked'),
		noiseMatch = [],	// string: low, medium, high
		noiseGroup = $('input[name="noise"]:checked'),
		filteredResultsArray = [],
		shouldKeep,
		costFound,
		noiseFound;

	if (ratingGroup.length > 0) { ratingMin = ratingGroup[0].value; }
	if (costGroup.length > 0) {
		costMin = [];
		costMax = [];

		for(i = 0; i < costGroup.length; i++) {
			splitStrings = (costGroup[i].value).split('-');
			costMin.push(parseInt(splitStrings[0], 10));
			costMax.push(parseInt(splitStrings[1], 10));
		}
	}

	if (noiseGroup.length > 0) {
		for(i = 0; i < noiseGroup.length; i++) {
			noiseMatch.push(noiseGroup[i].value);
		}
	}

	for(i = 0; i < resultsArray.length; i++) {
		imgElement = imageArray[resultsArray[i]];
		shouldKeep = true;

		// check rating
		if(ratingGroup.length > 0) {
			if(imgElement.rating < ratingMin) { shouldKeep = false; }
		}

		// if any cost profiling matches, keep it
		if(costGroup.length > 0){
			costFound = false;
			for(j = 0; j < costGroup.length; j++) {
				if(imgElement.cost < costMax[j] && imgElement.cost >= costMin[j]) { costFound = true; }
			}
			if(costFound === false) { shouldKeep = false; }
		}

		// if any noise profiling matches, keep it
		if(noiseGroup.length > 0){
			noiseFound = false;
			for(j = 0; j < noiseGroup.length; j++) {
				// if any element in noiseGroup matches the element, keep it
				if(imgElement.noise === noiseMatch[j]) { noiseFound = true; }
			}
			if(noiseMatch === false) { shouldKeep = false; }
		}

		// if shouldKeep then push it to results
		if(shouldKeep) { filteredResultsArray.push(resultsArray[i]); }
	}
	
	return filteredResultsArray;
}


// Init Data
var imageArray = [];
imageArray.push(new ImageElement( 
	{ id: 'cupcake', foodName: 'cupcake', url: 'cupcake.jpg', categories: ['cupcake', 'dessert'], restName: 'Sprinkles', location: 'Costa Mesa', rating: 5, cost: 5, noise: "low", reviews: [], similarRestaurants: [] }
));
imageArray.push(new ImageElement( 
	{ id: 'burger', foodName: 'burger', url: 'burger.jpg', categories: ['burger', 'american'], restName: 'Johnny Rockets', location: 'Puente Hills', rating: 2, cost: 25, noise: "moderate", reviews: [], similarRestaurants: [] }
));
imageArray.push(new ImageElement( 
	{ id: 'sushi', foodName: 'sushi', url: 'sushi.jpg', categories: ['sushi', 'american'], restName: 'Asahi', location: 'Corona', rating: 5, cost: 30, noise: "moderate", reviews: [], similarRestaurants: [] }
));
imageArray.push(new ImageElement( 
	{ id: 'sushi-1', foodName: 'sushi', url: 'sushi.jpg', categories: ['sushi', 'japanese'], restName: 'Joe\'s Sushi', location: 'Tustin', rating: 4, cost: 25, noise: "moderate", reviews: [], similarRestaurants: [] }
));
imageArray.push(new ImageElement( 
	{ id: 'fruits', foodName: 'fruits', url: 'fruits.jpg', categories: ['fruits', 'kiwi', 'strawberry'], restName: 'Mother\'s Market', location: 'Tustin', rating: 4, cost: 15, noise: "moderate", reviews: [], similarRestaurants: [] }
));
imageArray.push(new ImageElement( 
	{ id: 'fruits-1', foodName: 'fruits', url: 'fruits.jpg', categories: ['fruits', 'kiwi', 'strawberry'], restName: 'Sprouts Market', location: 'Tustin', rating: 4, cost: 10, noise: "low", reviews: [], similarRestaurants: [] }
));
imageArray.push(new ImageElement( 
	{ id: 'steak', foodName: 'steak', url: 'steak.jpg', categories: ['steak', 'fries', 'black angus'], restName: 'Black Angus', location: 'Irvine', rating: 4, cost: 25, noise: "moderate", reviews: [], similarRestaurants: [] }
));
imageArray.push(new ImageElement( 
	{ id: 'steak-1', foodName: 'steak', url: 'steak.jpg', categories: ['steak', 'fries', 'yard house'], restName: 'Yard House', location: 'Irvine', rating: 3, cost: 20, noise: "loud", reviews: [], similarRestaurants: [] }
));
imageArray.push(new ImageElement( 
	{ id: 'vegetables', foodName: 'vegetables', url: 'vegetables.jpg', categories: ['veggie grill', 'vegetables', 'brocolli', 'orange', 'apple'], restName: 'Veggie Grill', location: 'Irvine', rating: 4, cost: 15, noise: "moderate", reviews: [], similarRestaurants: [] }
));

var imageGraph = new ImageGraph(imageArray);


// Initialize App
(function(){
    $('#filters > li').on('click', function() {
    	var categories = [];
    	categories.push($(this).text());
    	imageGraph.updateView(categories);
    });
})();