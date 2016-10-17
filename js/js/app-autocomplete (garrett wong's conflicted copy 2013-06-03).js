(function(){
    /*var dictionary = [
        'cupcake', 'burger', 'vegetable', 'fruit',
        'sushi', 'cups', 'icecream', 'apple',
        'banana', 'peach', 'pear', 'sesame', 
        'basmati rice', 'strawberry', 'kiwi', 'cantaloupe', 'pineapple', 'coconut', 'fruits', 'vegetables', 'steak'
    ];*/

    var dictionary = [];
    for (var i in invIdx) {
      dictionary.push(i);
    }
    
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

    $('#searchAc').on('keyup', function(e) {
        // If Enter Pressed
        if (e.keyCode === 13 && $('#suggestAc').css('display') === 'none') {
            var acText = $(this).val();
            imageGraph.updateView([acText]);
            return;
        }

        var searchTerm = $(this).val();
        
        var suggestions = '';
        for (var i = 0; i < dictionary.length; i++) {
            if ( searchTerm.length > 2 && dictionary[i].match(searchTerm) ) {
                console.log(dictionary[i]);
                suggestions += '<li>' + dictionary[i] + '</li>';
            }
        }
        if (suggestions.length > 0) {
            $('#suggestAc').html(suggestions);
            $('#suggestAc').slideDown('150');
        } else {
            $('#suggestAc').slideUp('50');
        }
    });

    var acIndex = -1;
    $('#searchAc').on('keyup', function(e) {
        e.preventDefault();

        if ($('#suggestAc').css('display') !== 'none') {
            // On Enter
            if (acIndex > -1 && e.keyCode === 13) {
                var acValue = $('#suggestAc > li:eq(' + acIndex + ')').text();
                $('#searchAc').val(acValue);
                $('#suggestAc').slideUp('50');

                $('#suggestAc > li').css('color', '#333333');
                acIndex = -1;
                return;
            }

            // First find highlighted
            for (var i = 0; i < $('#suggestAc > li').length; i++) {
                if ($('#suggestAc > li:eq(' + i + ')').css('color') === '#3366FF') {
                    acIndex = i;
                }
            }

            if (e.keyCode === 38 && acIndex > -1) {
                acIndex -= 1;
            } else if (e.keyCode === 40 && acIndex < $('#suggestAc > li').length - 1) {
                acIndex += 1;
            }

            console.log(acIndex);
            $('#suggestAc > li').css('color', '#333333');

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