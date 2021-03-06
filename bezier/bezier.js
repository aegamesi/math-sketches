var canvas;
var ctx;

var t;
var animating = false;
var control_points = [];
var rendered_points = [];

var graph_width = 800;
var graph_height = 600;
var graph_colors = ["#0000FE", "#FF0507", "#000000", "#FE00FF", "#00D500", "#FF9933", "#993400"];

var canvas_mousedown = false;
var canvas_mousex = 0;
var canvas_mousey = 0;
var canvas_mousedownx = 0;
var canvas_mousedowny = 0;

function redraw() {
	ctx.clearRect(0, 0, graph_width, graph_height);
	
	// draw in the control points/control path
	ctx.fillStyle = 'lightGray';
	ctx.strokeStyle = 'lightGray';
	ctx.lineWidth = 2;
	for(var i = 0; i < control_points.length; i++) {
		ctx.beginPath();
		ctx.arc(control_points[i].x, control_points[i].y, 2, 0, Math.PI * 2);
		ctx.fill();
	}
	ctx.beginPath();
	for(var i = 0; i < control_points.length; i++) {
		if(i == 0)
			ctx.moveTo(control_points[i].x, control_points[i].y);
		ctx.lineTo(control_points[i].x, control_points[i].y);
	}
	ctx.stroke();
	
	// now, draw in current progress
	//ctx.strokeStyle = 'black';
	//ctx.beginPath();
	ctx.lineWidth = 1;
	var points = control_points.slice(0);
	while(points.length > 1) {
		ctx.strokeStyle = graph_colors[points.length % graph_colors.length];
		ctx.beginPath();
		var next_arr = [];
		for(var i = 0; i < points.length - 1; i++) {
			var new_pt = lerp_pt(points[i], points[i+1], t);
			next_arr.push(new_pt);
			console.log(new_pt);
			if(i == 0)
				ctx.moveTo(new_pt.x, new_pt.y);
			ctx.lineTo(new_pt.x, new_pt.y);
		}
		ctx.stroke();
		points = next_arr;
	}
	ctx.stroke();
	// draw a point
	ctx.fillStyle = 'red';
	if(points.length == 1) {
		if(t < 1.0) {
			ctx.beginPath();
			circle(points[0].x, points[0].y, 4);
			ctx.fill();
		}
		rendered_points[(t * 100) | 0] = points[0];
	}
	
	// now render rendered points
	ctx.strokeStyle = 'red';
	ctx.lineWidth = 2;
	ctx.beginPath();
	var drawn = false;
	for(var i = 0; i < (t * 100); i++) {
		if(rendered_points[i] == undefined)
			continue;
		if(!drawn)
			ctx.moveTo(rendered_points[i].x, rendered_points[i].y);
		ctx.lineTo(rendered_points[i].x, rendered_points[i].y);
		drawn = true;
	}
	ctx.stroke();
}

function circle(x, y, r) {
	ctx.arc(x, y, r, 0, Math.PI * 2);
}

function lerp(x1, x2, t) {
	return x1 + (t * (x2 - x1));
}
function lerp_pt(pt1, pt2, t) {
	return {
		x: lerp(pt1.x, pt2.x, t),
		y: lerp(pt1.y, pt2.y, t)
	};
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}

$(document).ready(function(){
	canvas = $('#canvas')[0];
    ctx = canvas.getContext('2d');
    ctx.scale(2, 2);
	
	// begin jQuery Event Handlers
	$('#slider_percent').on('input change', function(){
		t = $(this).val() / 100.0;
		animating = false;
		redraw();
	});
	$('#button_clear').click(function() {
		animating = false;
		control_points = [];
		rendered_points = [];
		redraw();
	});
	$('#button_go').click(function() {
		redraw();
		
		t = 0.0;
		animating = true;
		var intervalId = setInterval(function(){
			t += 0.01;
			$('#slider_percent').val(t * 100);
			redraw();

			
			if(!animating || t >= 1.0) {
				redraw();
				clearInterval(intervalId);
			}
		}, 20);
	});
	
	$('#canvas').mousedown(function(e) {
		var pos = getMousePos(canvas, e);
		canvas_mousedown = true;
		canvas_mousedownx = pos.x;
		canvas_mousedowny = pos.y;
		canvas_mousex = pos.x;
		canvas_mousey = pos.y;
		
		control_points.push({x: canvas_mousex, y: canvas_mousey});
		rendered_points = [];
		redraw();
	});
	$(window).mouseup(function(e) {
		canvas_mousedown = false;
	});
	$(window).mousemove(function(e) {
		var pos = getMousePos(canvas, e);
		canvas_mousex = pos.x;
		canvas_mousey = pos.y;
	});
	window.onerror = function(message) {
		$('#error').html(message);
	}
	// end jQuery Event Handlers
	
	// Actual code to run on DOM Launch
	redraw(); 
});