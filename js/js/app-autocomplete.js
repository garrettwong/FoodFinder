(function(){
    var dictionary = [
        'cupcake', 'burger', 'vegetable', 'fruit',
        'sushi', 'cups', 'icecream', 'apple',
        'banana', 'peach', 'pear', 'sesame', 
        'basmati rice', 'strawberry', 'kiwi', 'cantaloupe', 'pineapple', 'coconut', 'fruits', 'vegetables', 'steak'
    ];

    // var dictionary = [];
    // for (var i in invIdx) {
    //   dictionary.push(i);
    // }
    
    function createDictionary(dictionary) {
        var d = {};
        for (var i = 0; i < dictionary.length; i++) {
            var firstLetter = dictionary[i][0];
            if (!d[firstLetter]) {
                d[firstLetter] = [];
            }
            d[firstLetter].push(dictionary[i]);
        }            
        return d;
    }
    
    var masterList = createDictionary(dictionary);
    console.log(masterList);
    
    $('#searchBtn').on('click', function() {
        var acText = $('#searchAc').val();

        if (acText.length === 0) {
            imageGraph.updateView([]);
        }
        else {
            imageGraph.updateView([acText]);
        }
    });

    var acIndex = -1;

    // This is used to prevent the UP Key Arrow from returning cursor to the start of the INPUT box
    $('#searchAc').on('keypress', preventDefaults);
    $('#searchAc').on('keydown', preventDefaults);

    function preventDefaults(e) {
        if (e.keyCode === 38) {
            e.preventDefault();
        }
    }

    $('#searchAc').on('keyup', function(e) {
        e.preventDefault();

        // Get the Search Term
        var searchTerm = $(this).val();
        
        // Create List of Suggestions
        var suggestions = '';
        for (var i = 0; i < dictionary.length; i++) {
            if ( searchTerm.length > 2 && dictionary[i].match(searchTerm) ) {
                console.log(dictionary[i]);
                suggestions += '<li>' + dictionary[i] + '</li>';
            }
        }

        // Show / Hide Suggestions
        if (suggestions.length > 0) {
            $('#suggestAc').html(suggestions);
            $('#suggestAc').slideDown('150');
        } else {
            $('#suggestAc').slideUp('50');
        }

        // If No Display of Suggestions
        if ($('#suggestAc').css('display') === 'none') {
            // If Enter Pressed
            if (e.keyCode === 13 ) {
                var acText = $('#searchAc').val();

                if (acText.length === 0) {
                    imageGraph.updateView([]);
                }
                else {
                    imageGraph.updateView([acText]);
                }
                return;    
            }
        } else {
            // If AutoComplete Suggestion is highlighted and Enter is Pressed
            if (e.keyCode === 13) {
                var acValue;
                if (acIndex > -1) {
                    acValue = $('#suggestAc > li:eq(' + acIndex + ')').text();
                } else {
                    $('#searchAc').val();
                }

                // On Enter without Highlighting AutoComplete --- Quick Hack :(
                if (acValue === undefined) {
                    acValue = $('#searchAc').val();
                }

                $('#searchAc').val(acValue);
                $('#suggestAc').slideUp('50');

                var acText = $(this).val();
                imageGraph.updateView([acText]);

                $('#suggestAc > li').css('color', '#333333');
                acIndex = -1;
                return;
            }

            // First currently highlighted option
            for (var i = 0; i < $('#suggestAc > li').length; i++) {
                if ($('#suggestAc > li:eq(' + i + ')').css('color') === '#3366FF') {
                    acIndex = i;
                }
            }

            console.log(acIndex);
            if (e.keyCode === 38 && acIndex > -1) {
                // If DownKey
                acIndex -= 1;
            } else if (e.keyCode === 40 && acIndex < $('#suggestAc > li').length - 1) {
                // If UpKey
                acIndex += 1;
            }

            $('#suggestAc > li').css('color', '#333333');

            // Highlight New Suggestion Row
            if (acIndex > -1 && acIndex < $('#suggestAc > li').length) {
                $('#suggestAc > li:eq(' + acIndex + ')').css('color', '#3366FF');
            }
        }
    });

    // On AutoComplete Item Click
    $(document).on('click', '#suggestAc > li', function() {
        var acText = $(this).text();
        $('#searchAc').val(acText);
        $('#suggestAc').css('display', 'none');

        // Update Image Graph
        imageGraph.updateView([acText]);
    });
})();