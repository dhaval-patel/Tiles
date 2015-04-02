function Tiles(container, data){
    this.elm = $(container);
    this.lstWidget = [];
    this.parse(data);
    
    // make sure all the image loads before layout
    var obj = this;
    this.oTimer = window.setInterval(function(){
        obj.onTimer();
    }, 1);
}

Tiles.prototype.onTimer = function(){
  if(ImageWidget.LoadImageCount === 0){
    for(var i=0; i < this.lstWidget.length; i++){
        this.lstWidget[i].setHeight();
    }
    
    window.clearInterval(this.oTimer);
    this.layout();
  }
};

Tiles.prototype.parse = function(data){
    for( var i = 0; i < data.length; i++){
        var dataWidget = data[i];
        var oWidget = null;
        switch(dataWidget.type){
            case "image":{
                oWidget = new ImageWidget();
            }
            break;
            case "headline":{
                oWidget = new HeadlineWidget();    
            }
            break;
            case "score":{
                oWidget = new ScoreWidget();    
            }
            break;
        }
        if(oWidget !== null){
            oWidget.setData(dataWidget);
            this.lstWidget.push(oWidget);
            this.elm.append(oWidget.elm);
        }
    }
};

Tiles.prototype.layout = function(){
    this.lstRow = [];
    
    var oRow = new Row();
    oRow.height = -1;   //  it has no limit
    oRow.top = 0;
    
    this.lstRow[0] = oRow;
    
    var oColumn = new Column();
    oColumn.width = this.elm[0].clientWidth;
    oColumn.left = 0;
    
    oRow.addColumnAt(0, oColumn);
    
    for(var i=0; i<this.lstWidget.length;i++){
        var oWidget = this.lstWidget[i];
       
        // get position of widget
        var oPos = this.calculateWidgetPos(oWidget);
        
        if(oPos === -1){
            return;
        }
        oRow = this.lstRow[oPos.row];
        oColumn = oRow.getColumnAt(oPos.column);
        
        //  set widget pos
        oWidget.top = oRow.top;
        oWidget.left = oColumn.left;
        oWidget.elm.css("top", oWidget.top + "px");
        oWidget.elm.css("left", oWidget.left + "px");
        
        // append widget to container
        this.elm.append(oWidget.elm);
         
        // create row and column if necessary
        this.addRowAtPos(oWidget.top + oWidget.height);
        this.addColumnAtPos(oWidget.left + oWidget.width);
      
        var iRowIndex = oPos.row;
        var iColumnIndex = oPos.column;
        var iRowMaxIndex = this.getRowIndexFor(oWidget.top + oWidget.height);
        var iColumnMaxIndex = oRow.getColumnIndexFor(oWidget.left + oWidget.width);
        
        for( ; iRowIndex <= iRowMaxIndex; iRowIndex++ ){
            var row = this.lstRow[iRowIndex];
            
            for(var iColumn = iColumnIndex; iColumn <= iColumnMaxIndex; iColumn++){
                row.getColumnAt(iColumn).widget = oWidget;
            }
        }
    }
};

Tiles.prototype.calculateWidgetPos = function(oWidget){
    for( var i=0; i<this.lstRow.length; i++){
        var oRow = this.lstRow[i];
        var iColumnCount = oRow.getColumnCount();
            
        for( var j = 0 ; j < iColumnCount; j++){
            var oColumn = oRow.getColumnAt(j);
       
            if(oColumn.widget === null){
                var bHeightPosible = false;
                var bWidthPosible = false;
                
                if( oRow.height === -1 || oRow.height >= oWidget.height){
                   bHeightPosible = true; 
                }
                else{
                    var iHeight = oRow.height;
                    for( var k = i+1; k < this.lstRow.length; k++){
                        var oNextRow = this.lstRow[k];
                        var oNextRowColumn = oNextRow.getColumnAt(j);
                        
                        if( oNextRowColumn.widget === null){
                            if(oNextRow.height == -1){
                                bHeightPosible = true;
                            }
                            else{
                                iHeight += oNextRow.height;

                                if(iHeight >= oWidget.height){
                                    bHeightPosible = true;
                                    break;
                                }
                            }
                        }
                        else{
                            break;
                        }
                    }
                }
            
                if(bHeightPosible){
                    if(oColumn.width >= oWidget.width){
                        bWidthPosible = true;
                    }
                    else{
                        var iWidth = oColumn.width;
                        
                        for( var k = j+1; k < iColumnCount; k++){
                            var oNextColumn = oRow.getColumnAt(k);
                            
                            if(oNextColumn.widget === null){
                                iWidth += oNextColumn.width;
                                
                                if(iWidth >= oWidget.width){
                                    bWidthPosible = true;
                                    break;
                                }
                            }
                            else{
                                break;
                            }
                        }
                    }
                }
                
                if(bHeightPosible && bWidthPosible){
                    return {row: i, column:j};
                }
            }
        }
    }
    
    return -1;
};

Tiles.prototype.addRowAtPos = function(y){
    var iRowIndex = 0;
    
    for( var i = 0 ; i < this.lstRow.length; i++ ){
        if( this.lstRow[i].height === -1 || y < this.lstRow[i].top + this.lstRow[i].height){
            iRowIndex = i;
            break
        }
        else if(y === this.lstRow[i].top + + this.lstRow[i].height){
            return;
        }
    }
    
    var oRow = this.lstRow[iRowIndex];
    var oNewRow = new Row();
    oNewRow.top = y;
    oNewRow.height = oRow.height === -1 ? -1 : oRow.height - ( y - oRow.top);
    oRow.height = y - oRow.top;
    this.lstRow.splice(iRowIndex + 1,0, oNewRow);
    
    for( var i = 0 ; i < oRow.getColumnCount();i++){
        var oColumn = oRow.getColumnAt(i);    
        var oNewColumn = new Column();
        oNewColumn.left = oColumn.left;
        oNewColumn.width = oColumn.width;
        oNewColumn.widget = oColumn.widget;
        oNewRow.addColumnAt(i, oNewColumn);
    }
};

Tiles.prototype.addColumnAtPos = function(x){
    var iColumnIndex = 0;
    var oRow = this.lstRow[0];
    var iColumnCount = oRow.getColumnCount();
    
    for(var i=0; i < iColumnCount; i++){
        var oColumn = oRow.getColumnAt(i);
    
        if(x < oColumn.left + oColumn.width){
            iColumnIndex = i;
            break;
        }
        else if(x === oColumn.left + oColumn.width){
            return;
        }
    }
    
    for(i=0; i<this.lstRow.length; i++){
        oRow = this.lstRow[i];
        oColumn = oRow.getColumnAt(iColumnIndex);
        oNewColumn = new Column();
        oNewColumn.left = x;
        oNewColumn.width = oColumn.width - ( x - oColumn.left);
        oColumn.width = x - oColumn.left;
        oRow.addColumnAt(iColumnIndex + 1, oNewColumn);
        oNewColumn.widget = oColumn.widget;
    }
};

Tiles.prototype.getRowIndexFor = function(top){
    for(var i=0; i < this.lstRow.length; i++){
        if(top <= this.lstRow[i].top + this.lstRow[i].height){
            return i;
        }
    }
    
    return this.lstRow.length - 1;
};

function Widget(){
    this.width = 0;
    this.height = 0;
    this.top = 0;
    this.left = 0;
    
    this.elm = $("<div>");
    this.elm.attr("class", "widget");
}

Widget.prototype.setData = function(data){
    this.elm.css("width", this.width + "px");
};

Widget.prototype.setHeight = function(){
    this.height = this.elm[0].clientHeight;
};

ImageWidget.prototype = new Widget();
ImageWidget.prototype.constructor = ImageWidget;
ImageWidget.prototype.base = Widget.prototype;

function ImageWidget(){    
    this.base.constructor.call(this);
    this.elm = $("<img>");
    this.elm.addClass("image");
    this.width = 200;
    ImageWidget.LoadImageCount += 1;
    this.elm[0].onload = function(){
        ImageWidget.LoadImageCount -= 1;
    };
}

ImageWidget.LoadImageCount = 0;

ImageWidget.prototype.setData = function(data){
    this.base.setData.call(this,data);
    this.elm.attr("src",data.src);
};

HeadlineWidget.prototype = new Widget();
HeadlineWidget.prototype.constructor = HeadlineWidget;
HeadlineWidget.prototype.base = Widget.prototype;

function HeadlineWidget(){
    this.base.constructor.call(this);
    this.elm.addClass("headline");
    this.width = 250;
}

HeadlineWidget.prototype.setData = function(data){
    this.base.setData.call(this,data);
    this.elm.html(data.text);
};

ScoreWidget.prototype = new Widget();
ScoreWidget.prototype.constructor = ScoreWidget;
ScoreWidget.prototype.base = Widget.prototype;

function ScoreWidget(){
    this.base.constructor.call(this);
    this.elm.addClass("score");
    this.width = 120;
}

ScoreWidget.prototype.setData = function(data){
    this.base.setData.call(this,data);
    this.elm.html(data.text);
};

function Row(){
    this.height = 0;
    this.top = 0;
    this.lstColumn = [];
}

Row.prototype.getColumnAt = function(index){
    return this.lstColumn[index];
};

Row.prototype.addColumnAt = function(index, column){
    this.lstColumn.splice(index,0,column);
};

Row.prototype.getColumnIndex = function(column){
    return this.lstColumn.indexOf(column);
};

Row.prototype.getColumnCount = function(){
    return this.lstColumn.length;
};

Row.prototype.getColumnIndexFor = function(left){
    for( var i=0; i<this.lstColumn.length;i++){
        if(left <= this.lstColumn[i].left + this.lstColumn[i].width){
            return i;
        }
    }
    return this.lstColumn.length - 1;
};

function Column(){
    this.width = 0;
    this.left = 0;
    this.widget = null;
}