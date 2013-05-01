# Paged Plugin for DocPad
This plugin provides [DocPad](https://docpad.org) with Paging. Documents can declare a number of pages that should be rendered for the document, or a collection over which the document should be rendered repeatedly.


## Install

```
npm install --save docpad-plugin-paged
```


## Usage

### Setup

To use, simply add `isPaged: true` to the meta data for any document that you want to be rendered with paging. You can then use `pageSize` or `pagedCollection` to instruct the plugin how many pages to generate from this document.

In documents that have paging enabled we can use the `@document.page` object to retrieve information about the current and total pages. The `page` object is of the form:

```
{
	number: 0,		// current page number
	count: 10,		// total number of pages
	size: 5,		// expected number of documents per page
	startIdx: 0,	// document index for first document in this page
	endIdx: 5		// document index for last document in this page
}
```

### Paging Collections

You can generate pages over a collection by using the `pagedCollection` meta property. Simply specify the name of a collection and the plugin will use this collections length to calculate how many pages to generate from this document. So if your `posts` collection contains 5 documents, and you have specified a `pageSize` of 3 then the paging plugin will render 2 pages, the first with documents 0-2 and the second with the remaining 2 documents.

### Example

For instance we could create the file `src/documents/index.html.eco` which contains something similar to the followìng:

```
---
title: 'Home'
layout: 'default'
tags: ['page']
isPaged: true
pageOrder: 0
pagedCollection: 'posts'
pageSize: 3
---
<% posts = @getCollection('posts') %>
<% for i in [@document.page.startIdx...@document.page.endIdx]: %>
	<% document = posts.at(i).toJSON() %>
	<article id="post" class="post">
		<h1><a href='<%=document.url%>'><%= document.title %></a></h1>
		<div class="post-date"><%= document.date.toLocaleDateString() %></div>
		<div class="post-content">
			<%- document.contentRenderedWithoutLayouts %>
		</div>
	</article>
<% end %>

<div class="pagination">
	<ul>
		<% if !@getDocument().hasPrevPage(): %>
			<li class="disabled"><span>Prev</span></li>
		<% else: %>
			<li><a href="<%= @getDocument().getPrevPage() %>">Prev</a></li>
		<% end %>
		<% for num in [0..@document.page.count-1]: %>
			<% if @document.page.number == num: %>
				<li class="active"><span><%= num %></span></li>
			<% else: %>
				<li><a href="<%= @getDocument().getPagedUrl(num) %>"><%= num %></a></li>
			<% end %>
		<% end %>
		<% if !@getDocument().hasNextPage(): %>
			<li class="disabled"><span>Next</span></li>
		<% else: %>
			<li><a href="<%= @getDocument().getNextPage() %>">Next</a></li>
		<% end %>
	</ul>
</div>
```

This will render out documents from the `posts` collection in groups of 3. The first 3 documents in the collection will be rendered into a file called `index.html` as normal, then the remaining documents from the collection will be rendered into subsequent files `index.1.html`, `index.2.html`, `index.3.html` etc.

In this example we can also see the use of the new helper methods `hasPrevPage()`, `hasNextPage()`, `getPrevPage()`, `getNextPage()` and `getPagedUrl(n)`. Hopefully these methods are pretty self explanatory, with the get methods returning the urls for the relevant pages. In this example we use these methods to create the standard Twitter Bootstrap pagination HTML.

## History
You can discover the history inside the `History.md` file

## License
Licensed under the incredibly [permissive](http://en.wikipedia.org/wiki/Permissive_free_software_licence) [MIT License](http://creativecommons.org/licenses/MIT/)
<br/>Copyright &copy; 2012 [Ben Delarre](http://delarre.net)