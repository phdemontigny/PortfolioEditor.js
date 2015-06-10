// A list of all created pages
var PAGES = [];
// A list of all created menus
var MENUS = [];
// The page being displayed
var CURRENT_PAGE = null;
// The page being created in sequence
var EDITOR_PAGE = null;
// The menu being created in sequence
var EDITOR_MENU = null;
// The non-page object being created in sequence
var EDITOR_OBJECT = null;

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

// "Start" Methods

// Called when a new menu is started
// All following commands refer to the new menu
// name: a name for the menu
function StartNewMenu(name) {
	if (arguments.length != 1) {
		alert(	'Error 000: StartNewMenu(name); requires a single ' +
				'value "name," which must be a sentence in ' +
				'quotations.');
	}
	else if ( !isString(name) ) {
		alert(	'Error 001: StartNewMenu(name); requires a single ' +
				'value "name," which must be a sentence in ' +
				'quotations.');
	}
	else if (EDITOR_MENU != null) {
		alert( 	'Error 002: StartNewMenu(name); cannot be called until ' +
				'the previous menu is completed with a call to EndMenu();');
	}

	EDITOR_MENU = new menu( name );
	MENUS.push(EDITOR_MENU);
}

// Called when a new page is started
// All following commands refer to the new page
// name: a name for the page
function StartNewPage(name) {
	if (arguments.length != 1) {
		alert(	'Error 010: StartNewPage(name); requires a single ' +
				'value "name," which must be a sentence in ' +
				'quotations.');
	}
	else if ( !isString(name) ) {
		alert(	'Error 011: StartNewPage(name); requires a single ' +
				'value "name," which must be a sentence in ' +
				'quotations.');
	}
	else if (EDITOR_MENU != null) {
		alert( 	'Error 012: StartNewPage(name); cannot be called until ' +
				'the previous page is completed with a call to EndPage();');
	}

	EDITOR_PAGE = new page(name);
	// REQUIRE that the first page is the homepage
	if (CURRENT_PAGE == null) {
		CURRENT_PAGE = EDITOR_PAGE;
	}
	PAGES.push(EDITOR_PAGE);
}

// Adds a table to the current page
// All following commands refer to the new table
// width, height: maximum values
function StartNewTable(width) {
	if (arguments.length != 1) {
		alert(	'Error 020: StartNewTable(width); requires a single ' +
				'value "width," which must be a positive integer');
	}
	else if ( !isInteger(width) ) {
		alert(	'Error 021: StartNewTable(width); requires a single ' +
				'value "width," which must be a positive integer');
	}
	else if ( EDITOR_PAGE == null ) {
		alert(	'Error 022: StartNewTable(name); must come after a ' +
				'call to StartNewPage(name);' );
	}
	else if (EDITOR_OBJECT != null && EDITOR_OBJECT instanceof table) {
		alert( 	'Error 022: StartNewTable(name); cannot be called until ' +
				'the previous table is completed with a call to EndTable();');
	}

	EDITOR_OBJECT = new table( width );
	EDITOR_PAGE.content.push(EDITOR_OBJECT);
}

//-------------------------------------------------------------------------------------------------

// "End" Methods

// Must be called after every menu is finished
// loads the item content into the menu.html property
function EndMenu() {
	if (arguments.length != 0) {
		alert('Error 030: EndMenu(); must have empty parenthesis');
	}
	else if (EDITOR_MENU == null) {
		alert(	'Error 031: EndMenu(); must come after a call to ' +
				'StartNewMenu(name);');
	}

	EDITOR_MENU = null;
}

// Must be called after every page is finished
// loads the item content into the page.html property
function EndPage() {
	if (arguments.length != 0) {
		alert('Error 040: EndPage(); must have empty parenthesis');
	}
	else if (EDITOR_PAGE == null) {
		alert(	'Error 041: EndPage(); must come after a call to ' +
				'StartNewPage(name);');
	}

	var page_html = '';
	
	page_html += '<div id="content" class="right w80">';
	for (i = 0; i < EDITOR_PAGE.content.length; i++) {
		item = EDITOR_PAGE.content[i];
		// REQUIRE: All items have an html property
		page_html += item.html + '<br>';
	}
	page_html += '</div>';
	
	EDITOR_PAGE.html = page_html;
	EDITOR_PAGE = null;
}

// Must be called after every table object is finished
// loads the table content into the table.html property
function EndTable() {
	if (arguments.length != 0) {
		alert('Error 050: EndTable(); must have empty parenthesis');
	}
	else if (EDITOR_OBJECT == null && !(EDITOR_OBJECT instanceof table) ) {
		alert(	'Error 051: EndTable(); must come after a call to ' +
				'StartNewTable(width);');
	}

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
				console.log("HELLO??");
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
	EDITOR_OBJECT = null;
}

//-------------------------------------------------------------------------------------------------

// "Draw" Methods

// Draws the current page's menu on the screen
// Called when page is loaded to create the menu according to
// 	the provided settings
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
		menu_html += '<li>' + item.html + '</li>';
		// Check for sublinks
		if (item instanceof page_link && CURRENT_PAGE.name == item.page) {
			for (var j=0; j<item.sub_links.length; j++ ) {
				menu_html += '<li class="subcategory">';
				menu_html += item.sub_links[j].html + '</li>';
			}
		}
	}
	menu_html += '</ul></div>';
	document.getElementById("menu_contents").innerHTML = menu_html;

}

// Draws the current page on the screen
// Called when page is loaded to create the page according to
// 	the provided settings
function drawPage() {
	
	// first, draw a menu if there is one
	if ( CURRENT_PAGE.menu != null ) {
	 	drawMenu();
	}

	document.getElementById("page_contents").innerHTML = CURRENT_PAGE.html;

}

//-------------------------------------------------------------------------------------------------

// "Add" Methods

// Adds a new page link to the current menu
function AddPageLink(text, page) {
	if (arguments.length != 2) {
		alert(	'Error 060: AddPageLink(text, page); requires two' +
				'values: "text" and "page," which must be sentences' +
				'in quotations');
	}
	else if (EDITOR_MENU == null) {
		alert( 	'Error 061: AddPageLink(text, page); must be called' +
				'after StartNewMenu(name); and before EndMenu();');
	}
	else if ( !isString(text) || !isString(page) ) {
		alert(	'Error 062: AddPageLink(text, page); requires two' +
				'values: "text" and "page," which must be sentences' +
				'in quotations');
	}

	EDITOR_OBJECT = new page_link(text, page);

	// index of the current menu being edited in MENUS
	var menu_id = findIndexWithName(MENUS, EDITOR_MENU.name);
	// index of the link being added
	var link_id = EDITOR_MENU.content.length;
	EDITOR_OBJECT.index = link_id;

	EDITOR_OBJECT.html = 	'<a href="#' +
							page +
							'" onclick="changePage(MENUS[' + 
							menu_id +
							'].content[' +
							link_id +
							'].page);" class="menu_item">' +
							text +
							'</a>';

	EDITOR_MENU.content.push(EDITOR_OBJECT);
}

// Adds a new page link to the current menu
function AddWebLink(text, url) {
	if (arguments.length != 2) {
		alert(	'Error 070: AddWebLink(text, url); requires two' +
				'values: "text" and "url," which must be sentences' +
				'in quotations');
	}
	else if (EDITOR_MENU == null) {
		alert( 	'Error 071: AddWebLink(text, url); must be called' +
				'after StartNewMenu(name); and before EndMenu();');
	}
	else if ( !isString(text) || !isString(url) ) {
		alert(	'Error 072: AddWebLink(text, url); requires two' +
				'values: "text" and "url," which must be sentences' +
				'in quotations');
	}

	var new_link = new web_link(text, url);

	new_link.html =	'<a href="' +
					url + 
					'" class="menu_item">' +
					text +
					'</a>';

	EDITOR_MENU.content.push(new_link);
}

// Adds a sub-link for another page to the current link stored in EDITOR_OBJECT
function AddSubPageLink(text, page) {
	if (arguments.length != 2) {
		alert(	'Error 080: AddSubPageLink(text, page); requires two' +
				'values: "text" and "page," which must be sentences' +
				'in quotations');
	}
	else if (EDITOR_MENU == null) {
		alert( 	'Error 081: AddSubPageLink(text, page); must be called' +
				'after StartNewMenu(name); and before EndMenu();');
	}
	else if ( (EDITOR_OBJECT == null) || !(EDITOR_OBJECT instanceof page_link) ) {
		alert( 	'Error 082: AddSubPageLink(text, page); must be called' +
				'after AddPageLink(text, page);');
	}
	else if ( !isString(text) || !isString(page) ) {
		alert(	'Error 083: AddSubPageLink(text, page); requires two' +
				'values: "text" and "page," which must be sentences' +
				'in quotations');
	}

	var new_link = new page_link(text, page);

	// index of the current menu being edited in MENUS
	var menu_id = findIndexWithName(MENUS, EDITOR_MENU.name);
	// index of the link being added
	var link_id = EDITOR_OBJECT.index;
	// index of the current sublink
	var sub_id = EDITOR_OBJECT.sub_links.length

	new_link.html = 	'<a href="#' +
						page +
						'" onclick="changePage(MENUS[' + 
						menu_id +
						'].content[' +
						link_id +
						'].sub_links[' +
						sub_id +
						'].page);" class="menu_item">' +
						text +
						'</a>';

	EDITOR_OBJECT.sub_links.push(new_link);

}

// Adds a sub-link for an external site to the current link stored in EDITOR_OBJECT
function AddSubWebLink(text, url) {
	if (arguments.length != 2) {
		alert(	'Error 090: AddSubWebLink(text, url); requires two' +
				'values: "text" and "url," which must be sentences' +
				'in quotations');
	}
	else if (EDITOR_MENU == null) {
		alert( 	'Error 091: AddSubWebLink(text, url); must be called' +
				'after StartNewMenu(name); and before EndMenu();');
	}
	else if ( (EDITOR_OBJECT == null) || !(EDITOR_OBJECT instanceof page_link) ) {
		alert( 	'Error 092: AddSubWebLink(text, url); must be called' +
				'after AddPageLink(text, url);');
	}
	else if ( !isString(text) || !isString(url) ) {
		alert(	'Error 093: AddSubWebLink(text, url); requires two' +
				'values: "text" and "url," which must be sentences' +
				'in quotations');
	}

	var new_link = new web_link(text, url);
	
	new_link.html =	'<a href="' +
					url + 
					'" class="menu_item">' +
					text +
					'</a>';

	EDITOR_OBJECT.sub_links.push(new_link);

}

// Adds an image to the editor page
function AddImageToPage(image_url, title, width, height) {
	if (arguments.length != 4) {
		alert(	'Error 100: AddImageToPage(url, title, width, height); ' +
				'requires four values: "url" and "title" must be sentences\n' +
				'in quotations, while "width" and "height" must be ' +
				'positive integers');
	}
	else if ( !isString(image_url) || !isString(title) ) {
		alert(	'Error 101: AddImageToPage(url, title, width, height); ' +
				'requires four values: "url" and "title" must be sentences\n' +
				'in quotations, while "width" and "height" must be ' +
				'positive integers');
	}
	else if ( !isInteger(width) || !isInteger(height) ) {
		alert(	'Error 102: AddImageToPage(url, title, width, height); ' +
				'requires four values: "url" and "title" must be sentences\n' +
				'in quotations, while "width" and "height" must be ' +
				'positive integers');
	}
	else if ( EDITOR_PAGE == null ) {
		alert(	'Error 103: AddImageToPage(url, title, width, height); ' +
				' must come after a call to StartNewPage(name);' );
	}

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

	EDITOR_PAGE.content.push(new_image);

}

// Adds an image to the editor table
function AddImageToTable(image_url, title, width, height) {
	if (arguments.length != 4) {
		alert(	'Error 110: AddImageToTable(url, title, width, height); ' +
				'requires four values: "url" and "title" must be sentences\n' +
				'in quotations, while "width" and "height" must be ' +
				'positive integers');
	}
	else if ( !isString(image_url) || !isString(title) ) {
		alert(	'Error 111: AddImageToTable(url, title, width, height); ' +
				'requires four values: "url" and "title" must be sentences\n' +
				'in quotations, while "width" and "height" must be ' +
				'positive integers');
	}
	else if ( !isInteger(width) || !isInteger(height) ) {
		alert(	'Error 112: AddImageToTable(url, title, width, height); ' +
				'requires four values: "url" and "title" must be sentences\n' +
				'in quotations, while "width" and "height" must be ' +
				'positive integers');
	}
	else if ( (EDITOR_OBJECT == null) || !(EDITOR_OBJECT instanceof table) ) {
		alert(	'Error 113: AddImageToTable(url, title, width, height); ' +
				' must come after a call to StartNewTable(width);' );
	}

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

// Adds a text block to the editor page
function AddTextToPage(words) {
	if (arguments.length != 1) {
		alert(	'Error 120: AddTextToPage(text); requires a single ' +
				'value "text," which must be a sentence in ' +
				'quotations.');
	}
	else if ( !isString(words) ) {
		alert(	'Error 121: AddTextToPage(text); requires a single ' +
				'value "text," which must be a sentence in ' +
				'quotations.');
	}
	else if ( EDITOR_PAGE == null ) {
		alert(	'Error 122: AddTextToPage(text); must come after a ' + 
				'call to StartNewPage(name);' );
	}

	var new_text = new text(words, 1);

	new_text.html = words;

	EDITOR_PAGE.content.push(new_text);

}

// Adds a text block to the editor table
function AddTextToTable(words, span) {
	if (arguments.length != 2) {
		alert(	'Error 130: AddTextToTable(text, span); requires two ' +
				'values: "text" must be a sentence in quotations,\n' + 
				'and "span" must be a positive integer');
	}
	else if ( !isString(words) ) {
		alert(	'Error 131: AddTextToTable(text, span); requires two ' +
				'values: "text" must be a sentence in quotations,\n' + 
				'and "span" must be a positive integer');
	}
	else if ( !isInteger(span) ) {
		alert(	'Error 132: AddTextToTable(text, span); requires two ' +
				'values: "text" must be a sentence in quotations,\n' + 
				'and "span" must be a positive integer');
	}
	else if ( EDITOR_PAGE == null ) {
		alert(	'Error 133: AddTextToTable(text, span); must come after a ' + 
				'call to StartNewPage(name);' );
	}

	var new_text = new text(words, span);

	new_text.html = '<div class="about">' + words + '<\div>';

	EDITOR_OBJECT.content.push(new_text);

}

// Adds a number of break statements equal to lines
function AddVerticalSpacing(lines) {
	if (arguments.length != 1) {
		alert(	'Error 140: AddVerticalSpacing(lines); requires a single ' +
				'value "lines," which must be a positive integer');
	}
	else if ( !isInteger(lines) ) {
		alert(	'Error 141: AddVerticalSpacing(lines); requires a single ' +
				'value "lines," which must be a positive integer');
	}
	else if ( EDITOR_PAGE == null ) {
		alert(	'Error 142: AddVerticalSpacing(lines); must come after a ' + 
				'call to StartNewPage(name);' );
	}

	var html = '';
	for (var i=0; i<lines-1; i++) {
		html += '<br>';
	}
	EDITOR_PAGE.content.push(new block(html));
} 

//-------------------------------------------------------------------------------------------------

// Menu Methods

// Adds a title to the Menu, which is set in large font above
// the other menu elements
function SetMenuTitle(title) {
	if ( arguments.length != 1) {
		alert(	'Error 150: SetMenuTitle(title); requires a single ' + 
				'values "title," which must be a sentence in ' +
				'quotations');
	}
	else if ( !isString(title) ) {
		alert(	'Error 151: SetMenuTitle(title); requires a single ' + 
				'values "title," which must be a sentence in ' +
				'quotations');
	}
	else if ( EDITOR_MENU == null ) {
		alert(	'Error 152: SetMenuTitle(title); must come after a ' + 
				'call to StartNewMenu(name);' );
	}

	EDITOR_MENU.title = title;
}

// Sets the named menu to be displayed on the current page
function AttachMenu(name) {
	if ( arguments.length != 1) {
		alert(	'Error 160: AttachMenu(name); requires a single ' + 
				'values "name," which must be a sentence in ' +
				'quotations');
	}
	else if ( !isString(name) ) {
		alert(	'Error 161: AttachMenu(name); requires a single ' + 
				'values "name," which must be a sentence in ' +
				'quotations');
	}
	else if ( EDITOR_PAGE == null ) {
		alert(	'Error 162: AttachMenu(name); must come after a ' + 
				'call to StartNewPage(name);' );
	}

	var found = false
	for (i=0; i<MENUS.length; i++) {
		if (MENUS[i].name == name) {
			EDITOR_PAGE.menu = MENUS[i];
			found = true;
		}
	}
	if (!found) {
		alert(	'Error 163: In AttachMenu(name); the value "name" ' +
				'must match the name of a previously defined Menu');
	}
}

//-------------------------------------------------------------------------------------------------

// Helper Functions

function changePage(name) {
	
	var index = findIndexWithName(PAGES, name);
	CURRENT_PAGE = PAGES[index];
	drawPage();	

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