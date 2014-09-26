var points = [];
var trios = [];
var pointIndex = 1;
var edgePoints = [];
var firstEdgePoint;
var isEdgeFinalPoint = false;
var isOnEdge = false;
var isInnerPoint = false;
var count = 0;
var polygonCoords = "";
var outOfArea = false;

var param = { nbMessage: 15 };
var vertices = [];

$(document).ready(
    function () {   
        $('.clickToDrawPoints').click(drawEdge);

        $('.drawTable').click(generateTable);
    }
);

function drawEdge() {
    var svgnode = document.getElementById("svg");
    if (count == 0) {
        firstEdgePoint = { x: event.clientX, y: event.clientY };
    }
    else {
        if (Math.pow(event.clientX - firstEdgePoint.x, 2) + Math.pow(event.clientY - firstEdgePoint.y, 2) < 400) {
            if (count < 3) {
                alert("At least three points are needed.");
                return;
            }
            return finishDrawingEdge();
        }
        else {
            var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', points[points.length - 1].x);
            line.setAttribute('y1', points[points.length - 1].y);
            line.setAttribute('x2', event.clientX);
            line.setAttribute('y2', event.clientY);
            line.setAttribute('stroke', 'black');
            line.setAttribute('stroke-width', '2'); 
            svgnode.appendChild(line);            
        }
    }
    var newPoint = { x: event.clientX, y: event.clientY };
    edgePoints.push(newPoint);
    points.push(newPoint);
    polygonCoords += event.clientX + ',' + event.clientY + " ";
    count++;

    if (!isEdgeFinalPoint) {
        drawPoint(event);
    }            
}

function finishDrawingEdge() {
    var svgnode = document.getElementById("svg");
    var polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute("points", polygonCoords);
    polygon.setAttribute("stroke-width", 1);
    polygon.setAttribute("stroke", "black");
    polygon.setAttribute("fill", "gray");
    svgnode.appendChild(polygon);
    $('#svg').find('line').remove();
    $('#pointNumeration span').remove();
    $('body').on('click', '#svg polygon', drawInnerPoint);
    $('.clickToDrawPoints').unbind('click');
    
    for (i = 0; i < edgePoints.length; i++) {
        vertices.push(new Delaunay.Point(edgePoints[i].x, edgePoints[i].y));
    }

    isEdgeFinalPoint = true;
}

function drawInnerPoint() {
    isInnerPoint = true;
    var svgnode = document.getElementById("svg");
    var point = closeToEdge(event);
    drawPoint(event);
    if (!isOnEdge) { points.push(point) };                    
    vertices.push(new Delaunay.Point(point.x, point.y));
    render(vertices);                                  
}

// helpers

function drawPoint(event) {
    if (!isOnEdge) {
        // draw point
        var svgnode = document.getElementById("svg");
        var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute("cx", event.clientX);
        circle.setAttribute("cy", event.clientY);
        circle.setAttribute("r", "1");
        circle.setAttribute("fill", "blue");
        svgnode.appendChild(circle);
     
        // add numeration to point
        var span = document.createElement('span');
        span.style.position = 'absolute';
        span.style.top = event.clientY + 'px';
        span.style.left = event.clientX + 'px';
        span.style.color = 'red';
        span.innerHTML = isInnerPoint ? (pointIndex - edgePoints.length).toString() : pointIndex.toString();
        ++pointIndex;

        document.getElementById('pointNumeration').appendChild(span);
    }
}

function closeToEdge(event) {
    for (var i = 0; i < edgePoints.length; ++i) {
        if (Math.pow(event.clientX - edgePoints[i].x, 2) + Math.pow(event.clientY - edgePoints[i].y, 2) < 400) {
            isOnEdge = true;
            return edgePoints[i];
        }
    }
    isOnEdge = false;
    return { x: event.clientX, y: event.clientY };
}

function render(vertices) {
    trios = [];
    var delaunay = Delaunay.Triangulate(vertices);
    var svgnode = document.getElementById('svg');
    var t;
    var i;
    var L = delaunay.length;

    $('#svg polygon').not(':first').remove();

    for (i = 0; i < L; i++) {
        t = delaunay[i];
        var triangle = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        getTriangleTopIndexes(t.p1, t.p2, t.p3);
        if (!outOfArea) {
            var trianglePoints = t.p1.x + ',' + t.p1.y + ' ' + t.p2.x + ',' + t.p2.y + ' ' + t.p3.x + ',' + t.p3.y;
            triangle.setAttribute("points", trianglePoints);
            triangle.setAttribute("stroke-width", 1);
            triangle.setAttribute("stroke", "black");
            triangle.setAttribute("fill", "yellow");
            svgnode.appendChild(triangle);
        }
    }
}

function getTriangleTopIndexes(point1, point2, point3) {
    var tops = { top1: 0, top2: 0, top3: 0 };
    for (i = 0; i < points.length; i++) {
        if (point1.x == points[i].x && point1.y == points[i].y) {
            tops.top1 = i + 1;
        }
        if (point2.x == points[i].x && point2.y == points[i].y) {
            tops.top2 = i + 1;
        }
        if (point3.x == points[i].x && point3.y == points[i].y) {
            tops.top3 = i + 1;
        }
    }
    if (tops.top1 <= edgePoints.length && tops.top2 <= edgePoints.length && tops.top3 <= edgePoints.length) {
        outOfArea = true;
    }
    else {
        outOfArea = false;
        trios.push(tops);
    }
}

function generateTable() {
	$('.content').hide();
    var table = document.createElement('table');
    table.setAttribute('class','content');
    var trFirst = document.createElement('tr');
    trFirst.style.background = "gray";

    var tdFirst = document.createElement('td');
    trFirst.appendChild(tdFirst);

    for (i = 1; i <= points.length - edgePoints.length; ++i) {
        var td = document.createElement('td');
        td.innerHTML = i.toString();
        trFirst.appendChild(td);
    }
    table.appendChild(trFirst);

    for (i = 1; i <= points.length - edgePoints.length; ++i) {
        var tr = document.createElement('tr');
        tr.style.background = "lightgreen";
        var td = document.createElement('td');
        td.innerHTML = i.toString();
        td.style.background = "gray";
        tr.appendChild(td);
        for (j = 1; j <= points.length - edgePoints.length; ++j) {
            var td = document.createElement('td');
            td.innerHTML = "0";
            td.style.font = "bold 12px Arial";
            td.style.color = "black";
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    document.getElementById('result').appendChild(table);

    for (i = 0; i < trios.length; ++i) {
        var realX = trios[i].top1 - 1; var realY = trios[i].top2 - 1; var realZ = trios[i].top3 - 1;
        var x = trios[i].top1 - edgePoints.length; var y = trios[i].top2 - edgePoints.length; var z = trios[i].top3 - edgePoints.length;

        var xy = Math.sqrt(Math.pow(points[realX].x - points[realY].x,2) + Math.pow(points[realX].y - points[realY].y,2));
        var yz = Math.sqrt(Math.pow(points[realZ].x - points[realY].x,2) + Math.pow(points[realZ].y - points[realY].y,2));
        var xz = Math.sqrt(Math.pow(points[realX].x - points[realZ].x,2) + Math.pow(points[realX].y - points[realZ].y,2));

        var P = (xy + xz + yz)/2;
        var S = Math.sqrt(P * (P - xy) * (P - yz) * (P - xz));

        var xA = Math.asin(2 * S / (xy * xz));
        var yA = Math.asin(2 * S / (xy * yz));
        var zA = Math.asin(2 * S / (yz * xz));

        // x y
        if (x > 0 && y > 0) {
            table.rows[x].cells[y].innerHTML = computeCoefficient(table.rows[x].cells[y].innerHTML, zA);
            table.rows[y].cells[x].innerHTML = table.rows[x].cells[y].innerHTML;
        }
        // y z
        if (y> 0 && z > 0) {
            table.rows[z].cells[y].innerHTML = computeCoefficient(table.rows[z].cells[y].innerHTML, xA);
            table.rows[y].cells[z].innerHTML = table.rows[z].cells[y].innerHTML;
        }
        // x z
        if (x > 0 && z > 0) {
            table.rows[x].cells[z].innerHTML = computeCoefficient(table.rows[x].cells[z].innerHTML, yA);
            table.rows[z].cells[x].innerHTML = table.rows[x].cells[z].innerHTML;
        }
        // x x
        if (x > 0) {
            table.rows[x].cells[x].innerHTML = computeCoefficient(table.rows[x].cells[x].innerHTML, yA, zA);
        }
        // y y 
        if (y > 0) {
            table.rows[y].cells[y].innerHTML = computeCoefficient(table.rows[y].cells[y].innerHTML, xA, zA);
        }
        // z z
        if (z > 0) {
            table.rows[z].cells[z].innerHTML = computeCoefficient(table.rows[z].cells[z].innerHTML, yA, xA);
        }
    }
}

function computeCoefficient(a, b, c)
{
	if(b & c)
	{
		return parseFloat(a) + 1 / (2*Math.tan(b)) + 1 / (2*Math.tan(c));
	}
	return parseFloat(a) - 1/(2*Math.tan(b));
}