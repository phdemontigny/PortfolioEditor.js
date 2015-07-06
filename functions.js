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

// Object Factories

// A menu object that can be attached to a page
function menu(name) {
	this.name = name;
	this.title = null;
	// A list of menu objects to be displayed
	this.content = [];
	this.html = '';
}

// A page object that stores all other objects in the page
function page(name) {
	this.name 		= name;
	this.menu 		= null;
	// A list of page objects to be displayed
	this.content 	= [];
	// The html text for this page
	this.html 		= '';
}

// A link object that links to another page
function page_link(text, page) {
	this.text = text;
	this.page = page;
	// index of page_link in containing object's content
	this.index = -1;
	// When CURRENT_PAGE == this.page, display these
	this.sub_links = [];
	this.html = '';
}

// A link object that links to a web address
function web_link(text,url) {
	this.text = text;
	this.url = url;
	this.html = '';
}

// A table object
function table(width) {
	this.content 	= [];
	this.max_width 	= width;
	this.html = '';
}

// A text block object
function text_block() {
	this.content 	= [];
	this.html 		= '';
}

// An image object
function image(url, title, width, height) {
	this.url 	= url;
	this.title 	= title;
	this.width 	= width;
	this.height = height;
	this.html = '';
}

// A test object
function text(words, span) {
	this.words 	= words;
	this.span 	= span;
	this.html 	= '';
}

// A generic object for adding simple html blocks
function block( html ) {
	this.html = html;
}

//-------------------------------------------------------------------------------------------------

// Menu Methods

// Called when a new menu is started
// Adds a "menu" object to the editor stack
function StartNewMenu(name) {
	if (arguments.length != 1) {
		error(	'Error 000: StartNewMenu(name); requires a single ' +
				'value "name," which must be a sentence in ' +
				'quotations.');
	}
	else if ( !isString(name) ) {
		error(	'Error 001: StartNewMenu(name); requires a single ' +
				'value "name," which must be a sentence in ' +
				'quotations.');
	}
	else if (EDITOR_OBJECT != null) {
		error( 	'Error 002: StartNewMenu(name); cannot be called until ' +
				'the previous object is completed with an "End" call');
	}
	else if (!ERROR_FOUND) {
		EDITOR_OBJECT = new menu( name );
		MENUS.push(EDITOR_OBJECT);
	}
}

// Must be called after every menu is finished
// Loads the item content into the menu.html property
function EndMenu() {
	if (arguments.length != 0) {
		error('Error 030: EndMenu(); must have empty parenthesis');
	}
	else if (EDITOR_OBJECT == null) {
		error(	'Error 031: EndMenu(); must come after a call to ' +
				'StartNewMenu(name);');
	}
	else if ( !(EDITOR_OBJECT instanceof menu) ) {
		error(	'Error 032: EndMenu(); must come after a call to ' +
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
		error(	'Error 150: SetMenuTitle(title); requires a single ' + 
				'values "title," which must be a sentence in ' +
				'quotations');
	}
	else if ( !isString(title) ) {
		error(	'Error 151: SetMenuTitle(title); requires a single ' + 
				'values "title," which must be a sentence in ' +
				'quotations');
	}
	else if ( EDITOR_OBJECT == null ) {
		error(	'Error 152: SetMenuTitle(title); must come after a ' + 
				'call to StartNewMenu(name);' );
	}
	else if ( !(EDITOR_OBJECT instanceof menu) ) {
		error(	'Error 153: SetMenuTitle(title); must come after a ' + 
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

	menu_html += '<div id="navigation" class="left w20">';

	// REQUIRE that one page be titled "Homepage"
	menu_html +=	'<h1> <a href="index.html" ' +
					'name="page_link" title ="Homepage">' +
					current_menu.title +
					'</a> </h1>';

	menu_html += "<ul>";
	for (var i=0; i<current_menu.content.length; i++) {
	
		item = current_menu.content[i];
		if ( !(item instanceof block) ) {
			menu_html += '<li>' + item.html + '</li>';
		}
		else {
			menu_html += item.html
		}
		// Check for sublinks
		if (item instanceof page_link && currentlySelected(item)) {
			for (var j=0; j<item.sub_links.length; j++ ) {
				menu_html += '<li class="subcategory">';
				menu_html += item.sub_links[j].html + '</li>';
			}
		}
	}
	menu_html += '</ul></div>';
	document.getElementById("menu_contents").innerHTML = menu_html;

}

//-------------------------------------------------------------------------------------------------

// Page Methods

// Called when a new page is started
// Adds a "page" object to the editor stack
function StartNewPage(name) {
	if (arguments.length != 1) {
		error(	'Error 010: StartNewPage(name); requires a single ' +
				'value "name," which must be a sentence in ' +
				'quotations.');
	}
	else if ( !isString(name) ) {
		error(	'Error 011: StartNewPage(name); requires a single ' +
				'value "name," which must be a sentence in ' +
				'quotations.');
	}
	else if (EDITOR_OBJECT != null) {
		error( 	'Error 012: StartNewPage(name); cannot be called until ' +
				'the previous object is completed with an "End" call');
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
	if (arguments.length != 0) {
		error('Error 040: EndPage(); must have empty parenthesis');
	}
	else if ( !(EDITOR_OBJECT instanceof page) ) {
		error(	'Error 041: EndPage(); must come after a call to ' +
				'StartNewPage(name);');
	}
	else if (!ERROR_FOUND) {
		var current_page = EDITOR_OBJECT;
		var page_html = '';
		
		page_html += '<div id="content" class="right w80">';
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
		error(	'Error 160: AttachMenu(name); requires a single ' + 
				'values "name," which must be a sentence in ' +
				'quotations');
	}
	else if ( !isString(name) ) {
		error(	'Error 161: AttachMenu(name); requires a single ' + 
				'values "name," which must be a sentence in ' +
				'quotations');
	}
	else if ( EDITOR_OBJECT == null ) {
		error(	'Error 162: AttachMenu(name); must come after a ' + 
				'call to StartNewPage(name);' );
	}
	else if ( !(EDITOR_OBJECT instanceof page) ) {
		error(	'Error 162: AttachMenu(name); must come after a ' + 
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
			error(	'Error 163: In AttachMenu(name); the value "name" ' +
					'must match the name of a previously defined Menu');
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

// Menu Link Methods

// Adds a page_link to the current menu
// Sublinks can be added between "start" and "end" functions
function StartMenuLink(text,page) {

	if (arguments.length != 2) {
		error(	'Error 060: StartMenuLink(text, page); requires two' +
				'values: "text" and "page," which must be sentences' +
				'in quotations');
	}
	else if ( EDITOR_OBJECT == null || !(EDITOR_OBJECT instanceof menu) ) {
		error( 	'Error 061: StartMenuLink(text, page); must be called' +
				'after StartNewMenu(name);');
	}
	else if ( !isString(text) || !isString(page) ) {
		error(	'Error 063: StartMenuLink(text, page); requires two' +
				'values: "text" and "page," which must be sentences' +
				'in quotations');
	}
	else if (!ERROR_FOUND) {
		new_link = new page_link(text, page);

		new_link.html = 	'<a href="#' +
							page +
							'" onclick="changePage(&quot;' + 
							page +
							'&quot;);" class="menu_item">' +
							text +
							'</a>';
		EDITOR_OBJECT.content.push(new_link);
		EDITOR_STACK.push(EDITOR_OBJECT);
		EDITOR_OBJECT = new_link;
	}
}

// Must be called after every menu link is finished
// loads the item content into the page.html property
function EndMenuLink() {
	if (arguments.length != 0) {
		error('Error ###: EndMenuLink(); must have empty parenthesis');
	}
	else if (EDITOR_OBJECT == null ) {
		error(	'Error ###: EndMenuLink(); must come after a call to ' +
				'StartMenuLink(text,page);');
	}
	else if ( !(EDITOR_OBJECT instanceof page_link) ) {
		error(	'Error ###: EndMenuLink(); must come after a call to ' +
				'StartMenuLink(text,page);');
	}
	else if (!ERROR_FOUND) {
		EDITOR_OBJECT = EDITOR_STACK.pop();
	}
}

//-------------------------------------------------------------------------------------------------

// Table Methods

// Adds a "table" object to the editor stack
// pre: current editor object must be a "page" object
function StartNewTable(width) {
	if (arguments.length != 1) {
		error(	'Error 020: StartNewTable(width); requires a single ' +
				'value "width," which must be a positive integer');
	}
	else if ( !isInteger(width) ) {
		error(	'Error 021: StartNewTable(width); requires a single ' +
				'value "width," which must be a positive integer');
	}
	else if ( EDITOR_OBJECT == null ) {
		error(	'Error 022: StartNewTable(name); must come after a ' +
				'call to StartNewPage(name);' );
	}
	else if ( !(EDITOR_OBJECT instanceof page ) ) {
		error( 	'Error 023: StartNewTable(name); cannot be called until ' +
				'the previous object is completed with an "End" call');
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
		error('Error 050: EndTable(); must have empty parenthesis');
	}
	else if (EDITOR_OBJECT == null) {
		error(	'Error 051: EndTable(); must come after a call to ' +
				'StartNewTable(width);');
	}
	else if ( !(EDITOR_OBJECT instanceof table) ) {
		error(	'Error 052: EndTable(); must come after a call to ' +
				'StartNewTable(width);');
	}
	else if (!ERROR_FOUND) {
		var current_table = EDITOR_OBJECT;
		var table_html = '';

		table_html += '<table><tr class="icon">';
		table_index = 0;
		for (j = 0; j < current_table.content.length; j++) {
			if (table_index == current_table.max_width) {
				// create a new row if we reach the max width
				table_html += '</tr><tr class="icon">';
				table_index = 0;
			}
			var item = current_table.content[j];
			if (item instanceof image) {
				table_html += 	'<td class="icon">';
				table_html += 	item.html;
				table_html +=  	'</td>';
				table_index += 1;
			}
			else if (item instanceof text) {
				if ( (table_index + item.span) > current_table.max_width ) {
					// create a new row if we reach the max width
					table_html += '</tr><tr class="icon">';
					table_index = 0;
				}
				table_html += 	'<td colspan="' +
								item.span +
								'" class="streetart-about">' +
								item.html +
								'</td>';
				table_index += item.span;
			}
		}
		table_html += '</tr></table>';

		current_table.html = table_html;
		EDITOR_OBJECT = EDITOR_STACK.pop();
	}
}

//-------------------------------------------------------------------------------------------------

// Text Block Methods

// Adds a text block to the current page
// Text blocks combine multiple lines of text into a single paragraph
function StartNewTextBlock(size, family, color, bold, italic) {

	style_html = '';
	block_html = '';
	new_block = new text_block();
	EDITOR_OBJECT.content.push(new_block);
	EDITOR_STACK.push(EDITOR_OBJECT);
	EDITOR_OBJECT = new_block;
	
	if (arguments.length >= 1) {
		style_html += 'style="font-size:' + size + ';';
	}
	if (arguments.length >= 2) {
		style_html += 'font-family:' + family + ';';
	}
	if (arguments.length >= 3) {
		style_html += 'color:' + color + ';';
	}
	if (arguments.length >= 4 && bold) {
		style_html += 'font-weight:bold;';
	}
	if (arguments.length >= 5 && italic) {
		style_html += 'font-style:italic;';
	}

	block_html = '<span ' + style_html + '">';
	EDITOR_OBJECT.html = block_html;	
}


// Must be called after every text block object is finished
// loads the text block content into the text_block.html property
function EndTextBlock() {
	if (arguments.length != 0) {
		error('Error ###: EndTextBlock(); must have empty parenthesis');
	}
	else if (EDITOR_OBJECT == null ) {
		error(	'Error ###: EndTextBlock(); must come after a call to ' +
				'StartNewTextBlock();');
	}
	else if ( !(EDITOR_OBJECT instanceof text_block) ) {
		error(	'Error ###: EndTextBlock(); must come after a call to ' +
				'StartNewTextBlock();');
	}
	else if (!ERROR_FOUND) {
		var current_text_block = EDITOR_OBJECT;
		var block_html = current_text_block.html;

		for (j = 0; j < current_text_block.content.length; j++) {
			var item = current_text_block.content[j];
			block_html += item.html;
		}

		current_text_block.html = block_html + '</span>';
		EDITOR_OBJECT = EDITOR_STACK.pop();
	}
}

//-------------------------------------------------------------------------------------------------

// Link Methods

// Adds a new page link to the current (non-menu) editor object
function AddPageLink(text, page) {
	if (arguments.length != 2) {
		error(	'Error 060: AddPageLink(text, page); requires two' +
				'values: "text" and "page," which must be sentences' +
				'in quotations');
	}
	else if ( EDITOR_OBJECT == null || (EDITOR_OBJECT instanceof menu) ) {
		error( 	'Error 061: AddPageLink(text, page); must be called' +
				'after StartNewPage(name);');
	}
	else if ( !isString(text) || !isString(page) ) {
		error(	'Error 063: AddPageLink(text, page); requires two' +
				'values: "text" and "page," which must be sentences' +
				'in quotations');
	}
	else if (!ERROR_FOUND) {
		new_link = new page_link(text, page);

		new_link.html = 	'<a href="#' +
							page +
							'" onclick="changePage(&quot;' + 
							page +
							'&quot;);" class="menu_item">' +
							text +
							'</a>';
		EDITOR_OBJECT.content.push(new_link);
	}
}

// Adds a new web link to the current (non-menu) editor object
function AddWebLink(text, url) {
	if (arguments.length != 2) {
		error(	'Error 070: AddWebLink(text, url); requires two' +
				'values: "text" and "url," which must be sentences' +
				'in quotations');
	}
	else if (EDITOR_OBJECT == null) {
		error( 	'Error 071: AddWebLink(text, url); must be called' +
				'after StartNewMenu(name); and before EndMenu();');
	}
	else if ( !isString(text) || !isString(url) ) {
		error(	'Error 072: AddWebLink(text, url); requires two' +
				'values: "text" and "url," which must be sentences' +
				'in quotations');
	}
	else if (!ERROR_FOUND) {
		var new_link = new web_link(text, url);

		new_link.html =	'<a href="' +
						url + 
						'" class="menu_item">' +
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
		error(	'Error 080: AddSubPageLink(text, page); requires two' +
				'values: "text" and "page," which must be sentences' +
				'in quotations');
	}
	else if (EDITOR_OBJECT == null) {
		error( 	'Error 081: AddSubPageLink(text, page); must be called' +
				'after AddPageLink(text, page);');
	}
	else if ( !(EDITOR_OBJECT instanceof page_link) ) {
		error( 	'Error 082: AddSubPageLink(text, page); must be called' +
				'after AddPageLink(text, page);');
	}
	else if ( !isString(text) || !isString(page) ) {
		error(	'Error 083: AddSubPageLink(text, page); requires two' +
				'values: "text" and "page," which must be sentences' +
				'in quotations');
	}
	else if (!ERROR_FOUND) {
		var new_link = new page_link(text, page);

		new_link.html = 	'<a href="#' +
							page +
							'" onclick="changePage(&quot;' + 
							page +
							'&quot;);" class="menu_item">' +
							text +
							'</a>';

		EDITOR_OBJECT.sub_links.push(new_link);
	}

}

// Adds a sub-link for an external site to the current link stored in EDITOR_OBJECT
function AddSubWebLink(text, url) {
	if (arguments.length != 2) {
		error(	'Error 090: AddSubWebLink(text, url); requires two' +
				'values: "text" and "url," which must be sentences' +
				'in quotations');
	}
	else if (EDITOR_OBJECT == null) {
		error( 	'Error 091: AddSubWebLink(text, url); must be called' +
				'after AddPageLink(text, url);');
	}
	else if ( !(EDITOR_OBJECT instanceof page_link) ) {
		error( 	'Error 092: AddSubWebLink(text, url); must be called' +
				'after AddPageLink(text, url);');
	}
	else if ( !isString(text) || !isString(url) ) {
		error(	'Error 093: AddSubWebLink(text, url); requires two' +
				'values: "text" and "url," which must be sentences' +
				'in quotations');
	}
	else if (!ERROR_FOUND) {
		var new_link = new web_link(text, url);
		
		new_link.html =	'<a href="' +
						url + 
						'" class="menu_item">' +
						text +
						'</a>';

		EDITOR_OBJECT.sub_links.push(new_link);
	}
}

//-------------------------------------------------------------------------------------------------

// Add To Table Methods

// Adds an image to the editor table
function AddImageToTable(image_url, title, width, height) {
	if (arguments.length != 4) {
		error(	'Error 110: AddImageToTable(url, title, width, height); ' +
				'requires four values: "url" and "title" must be sentences\n' +
				'in quotations, while "width" and "height" must be ' +
				'positive integers');
	}
	else if ( !isString(image_url) || !isString(title) ) {
		error(	'Error 111: AddImageToTable(url, title, width, height); ' +
				'requires four values: "url" and "title" must be sentences\n' +
				'in quotations, while "width" and "height" must be ' +
				'positive integers');
	}
	else if ( !isInteger(width) || !isInteger(height) ) {
		error(	'Error 112: AddImageToTable(url, title, width, height); ' +
				'requires four values: "url" and "title" must be sentences\n' +
				'in quotations, while "width" and "height" must be ' +
				'positive integers');
	}
	else if ( (EDITOR_OBJECT == null) ) {
		error(	'Error 113: AddImageToTable(url, title, width, height); ' +
				' must come after a call to StartNewTable(width);' );
	}
	else if ( !(EDITOR_OBJECT instanceof table) ) {
		error(	'Error 114: AddImageToTable(url, title, width, height); ' +
				' must come after a call to StartNewTable(width);' );
	}
	else if (!ERROR_FOUND) {
		var new_image = new image(image_url, title, width, height);

		new_image.html = 	'<a class="fancybox-thumb" rel="group" href="' +
							image_url +
							'" title="' +
							title +
							'"><img src="' +
							image_url +
							'" width="' +
							width +
							'px" height="' +
							height +
	    					'px" height="auto" /></a>';

		EDITOR_OBJECT.content.push(new_image);
	}
}

// Adds a text block to the editor table
function AddTextToTable(words, span) {
	if (arguments.length != 2) {
		error(	'Error 130: AddTextToTable(text, span); requires two ' +
				'values: "text" must be a sentence in quotations,\n' + 
				'and "span" must be a positive integer');
	}
	else if ( !isString(words) ) {
		error(	'Error 131: AddTextToTable(text, span); requires two ' +
				'values: "text" must be a sentence in quotations,\n' + 
				'and "span" must be a positive integer');
	}
	else if ( !isInteger(span) ) {
		error(	'Error 132: AddTextToTable(text, span); requires two ' +
				'values: "text" must be a sentence in quotations,\n' + 
				'and "span" must be a positive integer');
	}
	else if ( EDITOR_OBJECT == null ) {
		error(	'Error 133: AddTextToTable(text, span); must come after a ' + 
				'call to StartNewTable(width);' );
	}
	else if ( !( EDITOR_OBJECT instanceof table) ) {
		error(	'Error 134: AddTextToTable(text, span); must come after a ' + 
				'call to StartNewTable(width);' );
	}
	else if (!ERROR_FOUND) {
		var new_text = new text(words, span);

		new_text.html = '<div class="about">' + words + '<\div>';

		EDITOR_OBJECT.content.push(new_text);
	}
}


//-------------------------------------------------------------------------------------------------

// Add To Page Methods

// Adds an image to the editor page
function AddImageToPage(image_url, title, width, height) {
	if (arguments.length != 4) {
		error(	'Error 100: AddImageToPage(url, title, width, height); ' +
				'requires four values: "url" and "title" must be sentences\n' +
				'in quotations, while "width" and "height" must be ' +
				'positive integers');
	}
	else if ( !isString(image_url) || !isString(title) ) {
		error(	'Error 101: AddImageToPage(url, title, width, height); ' +
				'requires four values: "url" and "title" must be sentences\n' +
				'in quotations, while "width" and "height" must be ' +
				'positive integers');
	}
	else if ( !isInteger(width) || !isInteger(height) ) {
		error(	'Error 102: AddImageToPage(url, title, width, height); ' +
				'requires four values: "url" and "title" must be sentences\n' +
				'in quotations, while "width" and "height" must be ' +
				'positive integers');
	}
	else if ( EDITOR_OBJECT == null ) {
		error(	'Error 103: AddImageToPage(url, title, width, height); ' +
				' must come after a call to StartNewPage(name);' );
	}
	else if ( !( EDITOR_OBJECT instanceof page) ) {
		error(	'Error 104: AddImageToPage(url, title, width, height); ' +
				' must come after a call to StartNewPage(name);' );
	}
	else if (!ERROR_FOUND) {
		var new_image = new image(image_url, title, width, height);

		new_image.html = 	'<a class="fancybox-thumb" rel="group" href="' +
							image_url +
							'" title="' +
							title +
							'"><img class="full-page" src="' +
							image_url +
							'" width="' +
							width +
							'px" height="' +
							height +
	    					'px" height="auto" /></a>';

		EDITOR_OBJECT.content.push(new_image);
	}
}

// Adds a text block to the editor page
function AddText(words) {
	if (arguments.length != 1) {
		error(	'Error 120: AddTextToPage(text); requires a single ' +
				'value "text," which must be a sentence in ' +
				'quotations.');
	}
	else if ( !isString(words) ) {
		error(	'Error 121: AddTextToPage(text); requires a single ' +
				'value "text," which must be a sentence in ' +
				'quotations.');
	}
	else if ( EDITOR_OBJECT == null ) {
		error(	'Error 122: AddTextToPage(text); must come after a ' + 
				'call to StartNewPage(name); or StartNewMenu(name)' );
	}
	else if ( EDITOR_OBJECT instanceof table ) {
		error( 	'Error 123: Please use AddTextToTable(text, span); ' +
				'when adding text to a table');
	}
	else if (!ERROR_FOUND) {
		var new_text = new text(words, 1);

		new_text.html = words;

		EDITOR_OBJECT.content.push(new_text);
	}
}

//-------------------------------------------------------------------------------------------------

// Formatting Methods

// Adds a number of break statements equal to lines
function AddVerticalSpacing(lines) {
	if (arguments.length != 1) {
		error(	'Error 140: AddVerticalSpacing(lines); requires a single ' +
				'value "lines," which must be a positive integer');
	}
	else if ( !isInteger(lines) ) {
		error(	'Error 141: AddVerticalSpacing(lines); requires a single ' +
				'value "lines," which must be a positive integer');
	}
	else if ( EDITOR_OBJECT == null ) {
		error(	'Error 142: AddVerticalSpacing(lines); must come after a ' + 
				'call to StartNewPage(name); or StartNewMenu(name);' );
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

// Helper Functions

function changePage(name) {
	
	var index = findIndexWithName(PAGES, name);
	CURRENT_PAGE = PAGES[index];
	drawPage();	

}

function currentlySelected(link) {

	if (CURRENT_PAGE.name == link.page) {
		return true;
	}
	for (i=0; i<link.sub_links.length; i++) {
		if (CURRENT_PAGE.name == link.sub_links[i].page) {
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