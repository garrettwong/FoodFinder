function loadData() {
    // Gets JSON and puts it into Rest
    $.ajax({
        url: "RestAPI.php",
        type:"GET",
        dataType: "json",
        contentType: "application/json",
        data: {"method": "GetMultimedia"},
        success: function(data) {
            console.log(data);
        }
    });

    $.getJSON('RestAPI.php?method=GetMultimedia', function(data) {
        console.log(data);
    });
}

function events() {
    $('img').on('click', function() {
        // Find position in the Graph and Extract the Header and Modal Restaurant Content
        console.log(imageGraph);
        console.log($(this).attr('id'));

        var image = {};
        for (var i in imageGraph.imageArray) {
            if (imageGraph.imageArray[i].id === $(this).attr('id')) {
                image = imageGraph.imageArray[i];
                break;   
            }
        }
        
        var mod = new modalContent(image);
        mod.render();
    });
}


/* 
    content: {
        foodName: 'Churros',
        restName: 'Costco',
        location: 'Puente Hills',
        rating: '4.0',
        reviews: [],
        similarRestaurants: [ {id: 27, name: 'Churro Bar', tags: ['churros']} ]
    }
*/
function modalContent(content) {
    var header = '<h1>[Header]</h1>';
    var template = '<h1>[Restaurant]</h1> <div><span>Location:</span> [Location]</div><div><span>Rating:</span>[Rating]/5.0</div> <div><span>Avgerage cost per person:</span>$[Cost]</div> <div>[Reviews]</div> <div>[Similar]</div>';
    function render() {
        $('#myModalLabel').html(header.replace('[Header]', content.foodName));
        
        $('#myModal > .modal-body').html(
            template
                .replace('[Food]', content.foodName)
                .replace('[Restaurant]', content.restName)
                .replace('[Location]', content.location)
                .replace('[Rating]', content.rating)
                .replace('[Cost]', content.cost)

        );
    }

    return {
        render: render
    };
}

function MMContent(url) {
    this.width = '100%';
    this.height = '100%';
    this.url = url;

    function generateHtmlForImage() {
        return '<img href="' + url + '" style="width:' + this.width + '; height: ' + this.height + '" />'
    }

    return {
        render: render
    }
}

// Application Start
$(function() {
    loadData();
    events();
});