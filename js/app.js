var app = null;

$(document).ready(function(){
    $.getJSON("data/data.json", function(){     
    })
    .done(function(json) {
        app = new Tiles( document.getElementById("screen"), json.widgets);
    });
});

window.onresize = function(){
    if(app !== null){
        app.layout();
    }
};

