// A list of all created pages
var PAGES = [];
// A list of all created menus
var MENUS = [];
// The page being displayed
var CURRENT_PAGE = null;
// A stack of objects to be edited
var EDITOR_STACK = [];
// The current object whose content is being edited in sequence
var EDITOR_OBJECT = null;
// If true, an error has occured, and the site will not load
var ERROR_FOUND = false;

//-------------------------------------------------------------------------------------------------

// Stack Objects

// A menu object that can be attached to a page
function menu(name) {
	this.name 		= name;
	this.title 		= null;
	this.class 		= "menu";
	// A list of menu objects to be displayed
	this.content 	= [];
	this.html 		= '';
}

// An object that links to another page with possible sublinks
function menu_item(text, page) {
	this.text 		= text;
	this.page 		= page;
	this.class 		= "menu-item";
	// When CURRENT_PAGE == this.page, display these
	this.content 	= [];
	this.html 		= '';
}

// A page object that stores all other objects in the page
function page(name) {
	this.name 		= name;
	this.menu 		= null;
	this.class 		= "page";
	// A list of page objects to be displayed
	this.content 	= [];
	// The html text for this page
	this.html 		= '';
}

// A table object
function table(width) {
	this.class 		= "table";
	this.content 	= [];
	this.max_width 	= width;
	this.html 		= '';
}

// A text block object
function text_block(span) {
	this.class 		= "text-block";
	this.content 	= [];
	this.span 		= span;
	this.html 		= '';
}

//-------------------------------------------------------------------------------------------------

// HTML Objects

// A link object that links to a new page or web address
function link(text, page, url) {
	this.text 	= text;
	this.page 	= page;
	this.url 	= url;
	this.html 	= '';
}

// An image object
function image(url, title, width, height) {
	this.url 	= url;
	this.title 	= title;
	this.width 	= width;
	this.height = height;
	this.html 	= '';
}

// A test object
function text(words, span) {
	this.words 	= words;
	this.span 	= span;
	this.html 	= '';
}

// A generic object for adding simple html blocks
function block( html ) {
	this.html 	= html;
}

//-------------------------------------------------------------------------------------------------

// Menu Methods

// Called when a new menu is started
// Adds a "menu" object to the editor stack
function StartNewMenu(name) {
	if (arguments.length != 1) {
		error(	'Error 000: StartNewMenu(name); requires a single ' +
				'value "name," which must be a sentence in quotations.');
	}
	else if ( !isString(name) ) {
		error(	'Error 001: StartNewMenu(name); requires a single ' +
				'value "name," which must be a sentence in quotations.');
	}
	else if (EDITOR_OBJECT != null) {
		error( 	'Error 002: StartNewMenu(name); cannot be called until ' +
				'the previous "Start" call is completed with an "End" call.');
	}
	else if (!ERROR_FOUND) {
		EDITOR_OBJECT = new menu( name );
		MENUS.push(EDITOR_OBJECT);
	}
}

// Must be called after every menu is finished
// Loads the item content into the menu.html property
function EndMenu() {
	// TODO: Add error check for menu title
	if (arguments.length != 0) {
		error('Error 010: EndMenu(); must have empty parentheses.');
	}
	else if (EDITOR_OBJECT == null) {
		error(	'Error 011: EndMenu(); must come after a call to ' +
				'StartNewMenu(name);');
	}
	else if ( !(EDITOR_OBJECT instanceof menu) ) {
		error(	'Error 012: EndMenu(); must come after a call to ' +
				'StartNewMenu(name);');
	}
	else if (!ERROR_FOUND) {
		EDITOR_OBJECT = null;
	}
}

// Adds a title to the Menu, which is set in large font at the top
// Text serves as link to denoted "Homepage" page
function SetMenuTitle(title) {
	if ( arguments.length != 1) {
		error(	'Error 020: SetMenuTitle(title); requires a single ' + 
				'values "title," which must be a sentence in quotations.');
	}
	else if ( !isString(title) ) {
		error(	'Error 021: SetMenuTitle(title); requires a single ' + 
				'values "title," which must be a sentence in quotations.');
	}
	else if ( EDITOR_OBJECT == null ) {
		error(	'Error 022: SetMenuTitle(title); must come after a ' + 
				'call to StartNewMenu(name);' );
	}
	else if ( !(EDITOR_OBJECT instanceof menu) ) {
		error(	'Error 023: SetMenuTitle(title); must come after a ' + 
				'call to StartNewMenu(name);' );
	}
	else if (!ERROR_FOUND) {
		EDITOR_OBJECT.title = title;
	}
}

// Draws the current page's menu on the screen
// Recomputes each time page is changed because of menu sub-links
function drawMenu() {
	
	var menu_html = '';
	var current_menu = CURRENT_PAGE.menu;

	menu_html += 	'<div id="navigation" class="' +
					current_menu.class + ' ' +
					current_menu.name +
					' left">';

	// REQUIRE that one page be titled "Homepage"
	menu_html +=	'<h1> <a href="index.html">' +
					current_menu.title +
					'</a> </h1>';

	menu_html += "<ul>";
	for (var i=0; i<current_menu.content.length; i++) {
	
		item = current_menu.content[i];
		if ( item instanceof block ) {
			menu_html += item.html;
		}
		else if (item instanceof menu_item) {
			menu_html += '<li>' + item.html + '</li>';
			if ( currentlySelected(item) ) {
				for (var j=0; j<item.content.length; j++) {
					menu_html += '<li class="subcategory">';
					menu_html += item.content[j].html + '</li>';
				}
			}
		}
		else {
			menu_html += '<li>' + item.html + '</li>';
		}
	}
	menu_html += '</ul></div>';
	document.getElementById("menu_contents").innerHTML = menu_html;

}

//-------------------------------------------------------------------------------------------------

// Menu Item Methods

// Adds a menu_item to the current menu
// Sublinks can be added between "start" and "end" functions
function StartNewMenuItem(text,page) {

	if (arguments.length != 2) {
		error(	'Error 030: StartMenuItem(text, page); requires two ' +
				'values: "text" and "page," which must be sentences ' +
				'in quotations.');
	}
	else if ( !isString(text) || !isString(page) ) {
		error(	'Error 031: StartMenuItem(text, page); requires two ' +
				'values: "text" and "page," which must be sentences ' +
				'in quotations.');
	}
	else if ( EDITOR_OBJECT == null ) {
		error( 	'Error 032: StartMenuItem(text, page); must be called ' +
				'after StartNewMenu(name);');
	}
	else if ( !(EDITOR_OBJECT instanceof menu) ) {
		error( 	'Error 033: StartMenuItem(text, page); must be called ' +
				'after StartNewMenu(name);');
	}
	else if (!ERROR_FOUND) {
		new_link = new menu_item(text, page);
		EDITOR_OBJECT.content.push(new_link);
		EDITOR_STACK.push(EDITOR_OBJECT);
		EDITOR_OBJECT = new_link;
	}
}

// Must be called after every menu link is finished
// loads the item content into the page.html property
function EndMenuItem() {
	if (arguments.length != 0) {
		error(	'Error 040: EndMenuItem(); must have empty parentheses.');
	}
	else if (EDITOR_OBJECT == null ) {
		error(	'Error 041: EndMenuItem(); must come after a call to ' +
				'StartMenuItem(text,page);');
	}
	else if ( !(EDITOR_OBJECT instanceof menu_item) ) {
		error(	'Error 042: EndMenuItem(); must come after a call to ' +
				'StartMenuItem(text,page);');
	}
	else if (!ERROR_FOUND) {

		var current_item = EDITOR_OBJECT;
		current_item.html = '<a href="#' +
							current_item.page +
							'" onclick="changePage(&quot;' + 
							current_item.page +
							'&quot;);" class="' +
							current_item.class +
							'">' +
							current_item.text +
							'</a>';

		EDITOR_OBJECT = EDITOR_STACK.pop();
	}
}

//-------------------------------------------------------------------------------------------------

// Page Methods

// Called when a new page is started
// Adds a "page" object to the editor stack
function StartNewPage(name) {
	if (arguments.length != 1) {
		error(	'Error 050: StartNewPage(name); requires a single ' +
				'value "name," which must be a sentence in quotations.');
	}
	else if ( !isString(name) ) {
		error(	'Error 051: StartNewPage(name); requires a single ' +
				'value "name," which must be a sentence in quotations.');
	}
	else if (EDITOR_OBJECT != null) {
		error( 	'Error 052: StartNewPage(name); cannot be called until ' +
				'the previous "Start" call is completed with an "End" call.');
	}
	else if (!ERROR_FOUND) {
		EDITOR_OBJECT = new page(name);
		// REQUIRE that the first page is the homepage
		if (CURRENT_PAGE == null) {
			CURRENT_PAGE = EDITOR_OBJECT;
		}
		PAGES.push(EDITOR_OBJECT);
	}
}

// Must be called after every page is finished
// loads the item content into the page.html property
function EndPage() {
	// TODO: Add error check for attached menu
	if (arguments.length != 0) {
		error('Error 060: EndPage(); must have empty parentheses.');
	}
	else if ( EDITOR_OBJECT == null ) {
		error(	'Error 061: EndPage(); must come after a call to ' +
				'StartNewPage(name);');
	}
	else if ( !(EDITOR_OBJECT instanceof page) ) {
		error(	'Error 062: EndPage(); must come after a call to ' +
				'StartNewPage(name);');
	}
	else if (!ERROR_FOUND) {
		var current_page = EDITOR_OBJECT;
		var page_html = '';
		
		page_html += 	'<div id="content" class="' +
						current_page.class + ' ' +
						current_page.name +
						' right">';
		for (i = 0; i < current_page.content.length; i++) {
			item = current_page.content[i];
			page_html += item.html + '<br>';
		}
		page_html += '</div>';
		
		current_page.html = page_html;
		EDITOR_OBJECT = null;
	}
}

// Sets the named menu to be displayed on the current page
function AttachMenu(name) {
	if ( arguments.length != 1) {
		error(	'Error 070: AttachMenu(name); requires a single ' + 
				'values "name," which must be a sentence in quotations.');
	}
	else if ( !isString(name) ) {
		error(	'Error 071: AttachMenu(name); requires a single ' + 
				'values "name," which must be a sentence in quotations.');
	}
	else if ( EDITOR_OBJECT == null ) {
		error(	'Error 072: AttachMenu(name); must come after a ' + 
				'call to StartNewPage(name);' );
	}
	else if ( !(EDITOR_OBJECT instanceof page) ) {
		error(	'Error 073: AttachMenu(name); must come after a ' + 
				'call to StartNewPage(name);' );
	}
	else if (!ERROR_FOUND) {
		var found = false
		for (i=0; i<MENUS.length; i++) {
			if (MENUS[i].name == name) {
				EDITOR_OBJECT.menu = MENUS[i];
				found = true;
			}
		}
		if (!found) {
			error(	'Error 074: In AttachMenu(name); the value "name" ' +
					'must match the name of a previously created Menu.');
		}
	}
}

// Draws the current page on the screen
// Page contents do change, so html is pre-loaded
function drawPage() {
	
	if ( !(ERROR_FOUND) ) {
		// first, draw a menu if there is one
		if ( CURRENT_PAGE.menu != null ) {
		 	drawMenu();
		}

		document.getElementById("page_contents").innerHTML = CURRENT_PAGE.html;
	}

}

//-------------------------------------------------------------------------------------------------

// Table Methods

// Adds a "table" object to the editor stack
// pre: current editor object must be a "page" object
function StartNewTable(width) {
	if (arguments.length != 1) {
		error(	'Error 080: StartNewTable(width); requires a single ' +
				'value "width," which must be a positive integer.');
	}
	else if ( !isInteger(width) ) {
		error(	'Error 081: StartNewTable(width); requires a single ' +
				'value "width," which must be a positive integer.');
	}
	else if ( EDITOR_OBJECT == null ) {
		error(	'Error 082: StartNewTable(width); must come after a ' +
				'call to StartNewPage(name);' );
	}
	else if ( !(EDITOR_OBJECT instanceof page ) ) {
		error( 	'Error 083: StartNewTable(width); cannot be called until ' +
				'the previous "Start" call is completed with an "End" call');
	}
	else if (!ERROR_FOUND) {
		new_table = new table( width );
		EDITOR_OBJECT.content.push(new_table);
		EDITOR_STACK.push(EDITOR_OBJECT);
		EDITOR_OBJECT = new_table;
	}
}

// Must be called after every table object is finished
// loads the table content into the table.html property
function EndTable() {
	if (arguments.length != 0) {
		error('Error 090: EndTable(); must have empty parentheses.');
	}
	else if (EDITOR_OBJECT == null) {
		error(	'Error 091: EndTable(); must come after a call to ' +
				'StartNewTable(width);');
	}
	else if ( !(EDITOR_OBJECT instanceof table) ) {
		error(	'Error 092: EndTable(); must come after a call to ' +
				'StartNewTable(width);');
	}
	else if (!ERROR_FOUND) {
		var current_table = EDITOR_OBJECT;
		var table_html = '';

		table_html += 	'<table class="' + current_table.class + '">' + 
						'<tr class="' + current_table.class + '">';
		table_index = 0;
		for (j = 0; j < current_table.content.length; j++) {
			if (table_index == current_table.max_width) {
				// create a new row if we reach the max width
				table_html += '</tr><tr class="' + current_table.class + '">';
				table_index = 0;
			}
			var item = current_table.content[j];
			if ((item instanceof text) || (item instanceof text_block)) {
				if ( (table_index + item.span) > current_table.max_width ) {
					// create a new row if we reach the max width
					table_html += '</tr><tr class="' + current_table.class + '">';
					table_index = 0;
				}
				table_html += 	'<td colspan="' +
								item.span +
								'" class="' + current_table.class + '">' +
								item.html +
								'</td>';
				table_index += item.span;
			}
			else {
				table_html += 	'<td class="' + current_table.class + '">';
				table_html += 	item.html;
				table_html +=  	'</td>';
				table_index += 1;
			}
		}
		table_html += '</tr></table>';

		current_table.html = table_html;
		EDITOR_OBJECT = EDITOR_STACK.pop();
	}
}

//-------------------------------------------------------------------------------------------------

// Text Block Methods

// Adds a text block to the current editor object 
// Text blocks combine multiple lines of text into a single paragraph
// Note: span is always last argument, if < 6 arguments given, last is span if integer
function StartNewTextBlock(size, family, color, bold, italic, span) {
	if (arguments.length <= 0 || arguments.length >= 7) {
		error(	'Error 100: StartNewTextBlock(...); requires at most ' +
				'6 values: "size," "family," "color," "bold," "italic, "' + 
				'and "span."');
	}
	else if ( EDITOR_OBJECT == null ) {
		error(	'Error 101: StartNewTextBlock(...); must come after a ' +
				'"Start" call.' );
	}
	else if (!ERROR_FOUND) {
		var style_html = 'style="';
		var index = 0;
		// Set to false when the span is reached
		var more_parameters = true;

		if ( more_parameters && arguments.length >= 1 ) { 
			if ( isString(size) ) {
				style_html += 'font-size:' + size + ';';
				index += 1;
			}
			else if ( isInteger(size) ) {
				more_paramters = false;
			}
		}
		if ( more_parameters && arguments.length >= 2 ) {
			if ( isString(family) ) {
				style_html += 'font-family:' + family + ';';
				index += 1;
			}
			else if ( isInteger(family) ) {
				more_paramters = false;
			}
		}
		if ( more_parameters && arguments.length >= 3 ) {
			if ( isString(color) ) {
				style_html += 'color:' + color + ';';
				index += 1;
			}
			else if ( isInteger(color) ) {
				more_paramters = false;
			}
		}
		if ( more_parameters && arguments.length >= 4 ) {
			if ( bold == true ) {
				style_html += 'font-weight:bold;';
				index += 1;
			}
			else if ( isInteger(bold) ) {
				more_paramters = false;
			}
		}
		if ( more_parameters && arguments.length >= 5 ) {
			if ( italic == true ) {
				style_html += 'font-style:italic;';
				index += 1;
			}
			else if ( isInteger(italic) ) {
				more_paramters = false;
			}
		}
		if ( isInteger(arguments[index]) ) {
			span = arguments[index];
		}
		else {
			span = 1;
		}

		var new_block = new text_block(span);
		EDITOR_OBJECT.content.push(new_block);
		EDITOR_STACK.push(EDITOR_OBJECT);
		EDITOR_OBJECT = new_block;

		EDITOR_OBJECT.html = style_html;
	}	
}


// Must be called after every text block object is finished
// loads the text block content into the text_block.html property
function EndTextBlock() {
	if (arguments.length != 0) {
		error('Error 110: EndTextBlock(); must have empty parentheses.');
	}
	else if (EDITOR_OBJECT == null ) {
		error(	'Error 111: EndTextBlock(); must come after a call to ' +
				'StartNewTextBlock(...);');
	}
	else if ( !(EDITOR_OBJECT instanceof text_block) ) {
		error(	'Error 112: EndTextBlock(); must come after a call to ' +
				'StartNewTextBlock(...);');
	}
	else if (!ERROR_FOUND) {
		var current_text_block = EDITOR_OBJECT;
		var block_html = 	'<span class="' + 
							current_text_block.class + 
							'" ' + 
							current_text_block.html + '">';

		for (j = 0; j < current_text_block.content.length; j++) {
			var item = current_text_block.content[j];
			block_html += item.html;
		}

		current_text_block.html = block_html + '</span>';
		EDITOR_OBJECT = EDITOR_STACK.pop();
		console.log(block_html);
	}
}

//-------------------------------------------------------------------------------------------------

// Link Methods

// Adds a new page link to the current (non-menu) editor object
function AddPageLink(text, page) {
	if (arguments.length != 2) {
		error(	'Error 120: AddPageLink(text, page); requires two ' +
				'values: "text" and "page," which must be sentences ' +
				'in quotations.');
	}
	else if ( !isString(text) || !isString(page) ) {
		error(	'Error 121: AddPageLink(text, page); requires two ' +
				'values: "text" and "page," which must be sentences ' +
				'in quotations.');
	}
	else if ( EDITOR_OBJECT == null ) {
		error( 	'Error 122: AddPageLink(text, page); must come after a ' +
				'"Start" call.');
	}
	else if (!ERROR_FOUND) {
		var new_link = new link(text, page, null);

		new_link.html = 	'<a class="page-link" href="#' +
							page +
							'" onclick="changePage(&quot;' + 
							page +
							'&quot;);">' +
							text +
							'</a>';
		EDITOR_OBJECT.content.push(new_link);
	}
}

// Adds a new web link to the current (non-menu) editor object
function AddWebLink(text, url) {
	if (arguments.length != 2) {
		error(	'Error 130: AddWebLink(text, url); requires two ' +
				'values: "text" and "url," which must be sentences ' +
				'in quotations.');
	}
	else if ( !isString(text) || !isString(url) ) {
		error(	'Error 131: AddWebLink(text, url); requires two ' +
				'values: "text" and "url," which must be sentences ' +
				'in quotations.');
	}
	else if (EDITOR_OBJECT == null) {
		error( 	'Error 132: AddWebLink(text, url); must come after a ' +
				'"Start" call.');
	}
	else if (!ERROR_FOUND) {
		var new_link = new link(text, null, url);

		new_link.html =	'<a class="web-link" href="http://' +
						url + 
						'">' +
						text +
						'</a>';

		EDITOR_OBJECT.content.push(new_link);
	}
}

//-------------------------------------------------------------------------------------------------

// Sub Link Methods

// Adds a sub-link for another page to the current link stored in EDITOR_OBJECT
function AddSubPageLink(text, page) {
	if (arguments.length != 2) {
		error(	'Error 140: AddSubPageLink(text, page); requires two ' +
				'values: "text" and "page," which must be sentences ' +
				'in quotations.');
	}
	else if ( !isString(text) || !isString(page) ) {
		error(	'Error 141: AddSubPageLink(text, page); requires two ' +
				'values: "text" and "page," which must be sentences ' +
				'in quotations.');
	}
	else if (EDITOR_OBJECT == null) {
		error( 	'Error 142: AddSubPageLink(text, page); must be called ' +
				'after AddMenuItem(text, page);');
	}
	else if ( !(EDITOR_OBJECT instanceof menu_item) ) {
		error( 	'Error 143: AddSubPageLink(text, page); must be called ' +
				'after AddMenuItem(text, page);');
	}
	else if (!ERROR_FOUND) {
		var new_link = new link(text, page, null);

		new_link.html = 	'<a class="page-link" href="#' +
							page +
							'" onclick="changePage(&quot;' + 
							page +
							'&quot;);">' +
							text +
							'</a>';

		EDITOR_OBJECT.content.push(new_link);
	}

}

// Adds a sub-link for an external site to the current link stored in EDITOR_OBJECT
function AddSubWebLink(text, url) {
	if (arguments.length != 2) {
		error(	'Error 150: AddSubWebLink(text, url); requires two ' +
				'values: "text" and "url," which must be sentences ' +
				'in quotations.');
	}
	else if ( !isString(text) || !isString(url) ) {
		error(	'Error 151: AddSubWebLink(text, url); requires two ' +
				'values: "text" and "url," which must be sentences ' +
				'in quotations.');
	}
	else if (EDITOR_OBJECT == null) {
		error( 	'Error 152: AddSubWebLink(text, url); must be called ' +
				'after AddMenuItem(text, page);');
	}
	else if ( !(EDITOR_OBJECT instanceof menu_item) ) {
		error( 	'Error 153: AddSubWebLink(text, url); must be called ' +
				'after AddMenuItem(text, page);');
	}
	else if (!ERROR_FOUND) {
		var new_link = new link(text, null, url);
		
		new_link.html =	'<a class="web-link" href="http://' +
						url + 
						'">' +
						text +
						'</a>';

		EDITOR_OBJECT.content.push(new_link);
	}
}

//-------------------------------------------------------------------------------------------------

// Add Image Methods

// Adds an image to the editor table
function AddImage(image_url, title, width, height) {
	if (arguments.length != 4) {
		error(	'Error 160: AddImage(url, title, width, height); ' +
				'requires four values: "url" and "title" must be sentences in quotations,\n' +
				'while "width" and "height" must be positive integers.');
	}
	else if ( !isString(image_url) || !isString(title) ) {
		error(	'Error 161: AddImage(url, title, width, height); ' +
				'requires four values: "url" and "title" must be sentences in quotations,\n' +
				'while "width" and "height" must be positive integers.');
	}
	else if ( !isInteger(width) || !isInteger(height) ) {
		error(	'Error 162: AddImage(url, title, width, height); ' +
				'requires four values: "url" and "title" must be sentences in quotations,\n' +
				'while "width" and "height" must be positive integers.');
	}
	else if ( EDITOR_OBJECT == null ) {
		error( 	'Error 163: AddImage(url, title, width, height); must come after a ' +
				'"Start" call.');
	}
	else if (!ERROR_FOUND) {
		var new_image = new image(image_url, title, width, height);

		if (EDITOR_OBJECT instanceof table) {
			height = "auto";
		}
		else if (EDITOR_OBJECT instanceof page) {
			width = "auto";
		}

		new_image.html = 	'<a class="fancybox-thumb image" rel="group" href="' +
							image_url +
							'" title="' +
							title +
							'"><img src="' +
							image_url +
							'" width="' +
							width +
							'px" height="' +
							height +
	    					'px" /></a>';

		EDITOR_OBJECT.content.push(new_image);
	}
}

//-------------------------------------------------------------------------------------------------

// Add Text Methods

// Adds a text block to the editor table
function AddText(words, span) {
	if (arguments.length < 1 || arguments.length > 2) {
		error(	'Error 170: AddText(text, [span]); requires one or two ' +
				'values: "text" must be a sentence in quotations,\n' + 
				'and "span" must be a positive integer.');
	}
	else if ( !isString(words) ) {
		error(	'Error 171: AddText(text, [span]); requires one or two ' +
				'values: "text" must be a sentence in quotations,\n' + 
				'and "span" must be a positive integer.');
	}
	else if ( arguments.length == 2 && !isInteger(span) ) {
		error(	'Error 172: AddText(text, [span]); requires one or two ' +
				'values: "text" must be a sentence in quotations,\n' + 
				'and "span" must be a positive integer.');
	}
	else if ( EDITOR_OBJECT == null ) {
		error(	'Error 173: AddText(text, [span]); must come after a ' + 
				'"Start" call.' );
	}
	else if (!ERROR_FOUND) {

		if (arguments.length == 1) {
			span = 1
		}
		var new_text = new text(words, span);

		new_text.html = '<span class="text">' + words + '</span>';

		EDITOR_OBJECT.content.push(new_text);
	}
}


//-------------------------------------------------------------------------------------------------

// Formatting Methods

// Adds a number of break statements equal to lines
function AddVerticalSpacing(lines) {
	if (arguments.length != 1) {
		error(	'Error 180: AddVerticalSpacing(lines); requires a single ' +
				'value "lines," which must be a positive integer.');
	}
	else if ( !isInteger(lines) ) {
		error(	'Error 181: AddVerticalSpacing(lines); requires a single ' +
				'value "lines," which must be a positive integer.');
	}
	else if ( EDITOR_OBJECT == null ) {
		error(	'Error 182: AddVerticalSpacing(lines); must come after a ' + 
				'"Start" call.' );
	}
	else if (!ERROR_FOUND) {
		var html = '';
		if ( EDITOR_OBJECT instanceof menu ) {
			html += '<li style="margin: ' +
					(lines-1) + 
					'em"></li>';
			EDITOR_OBJECT.content.push( new block(html) );
		}
		else {
			for (var i=0; i<lines-1; i++) {
				html += '<br>';
			}
			EDITOR_OBJECT.content.push( new block(html) );
		}
	}
} 

//-------------------------------------------------------------------------------------------------

// CSS Functions

function AddClass(name) {
	if (arguments.length != 1) {
		error(	'Error 190: AddClass(name); requires a single ' +
				'value "name," which must be a sentence in quotations.');
	}
	else if ( !isString(name) ) {
		error(	'Error 191: AddClass(name); requires a single ' +
				'value "name," which must be a sentence in quotations.');
	}
	else if ( EDITOR_OBJECT == null ) {
		error(	'Error 192: AddClass(name); must come after a ' + 
				'"Start" call.' );
	}
	EDITOR_OBJECT.class += " " + name;
}

//-------------------------------------------------------------------------------------------------

// Helper Functions

function changePage(name) {
	
	var index = findIndexWithName(PAGES, name);
	CURRENT_PAGE = PAGES[index];
	drawPage();	

}

function currentlySelected(item) {

	if (CURRENT_PAGE.name == item.page) {
		return true;
	}
	for (var i=0; i<item.content.length; i++) {
		if (CURRENT_PAGE.name == item.content[i].page) {
			return true;
		}
	}
	return false;

}

function findIndexWithName(list, name) {

	var index = 0;
	while (index < list.length ) {
		if ( list[index].name == name ) {
			return index;
		}
		index += 1;
	}
	return -1;

}

// Returns true if test is a string
function isString(test) {
	return ( typeof test == 'string' || test instanceof String );

}

// Returns true if test is a positive integer
function isInteger(test) {
	if ( !isNaN(parseInt(test,10)) && parseInt(Number(test)) == test ) {
		return ( test > 0 );
	}
	return false;

}

// If this is the first error, throw an error message
function error( message ) {

	if ( !(ERROR_FOUND) ) {
		alert( message );
		ERROR_FOUND = true;
	}
}