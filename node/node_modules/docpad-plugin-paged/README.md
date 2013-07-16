# Paged Plugin for [DocPad](http://docpad.org)

[![Build Status](https://secure.travis-ci.org/docpad/docpad-plugin-paged.png?branch=master)](http://travis-ci.org/docpad/docpad-plugin-paged "Check this project's build status on TravisCI")
[![NPM version](https://badge.fury.io/js/docpad-plugin-paged.png)](https://npmjs.org/package/docpad-plugin-paged "View this project on NPM")

This plugin provides [DocPad](https://docpad.org) with Paging. Documents can declare a number of pages that should be rendered for the document, or a collection over which the document should be rendered repeatedly.


## Install

```
docpad install paged
```


## Usage

### Explanation

The Paged plugin works by scanning the meta data of your document and looking for the `isPaged: true` meta data attribute.

- If you are wanting to page a listing of documents, then you would want to pass over the`pagedCollection: 'collectionName'` meta data attribute with the collection name being whatever collection you are listing.
- If you are wanting to split the current document into multiple pages, then you want to specify the `pageCount: 5` meta data attribute, where 5 is how many pages you want to have
- You can also specify the `pageSize: 5` meta data attribute (defaults to `1`) which indicates how many max items should be listed on an individual page

That being done, paged will scan your documents in the `renderBefore` action and clone your paged document for each page that will be needed. Setting the following attributes for each page document:

``` coffee
{
	count: 10       # total number of pages
	size: 5         # expected number of documents per page
	number: 0       # current page number
	startIdx: 0     # position of the first item in this page
	endIdx: 5       # position of the last item in this page
	pages: [50,1]   # document ids for each of the pages
}
```

You will interact with the paged plugin via the following template helpers that the paged plugin defines for you:

- `hasPrevPage(document ?= @getDocument())`
- `hasNextPage(document ?= @getDocument())`
- `getPrevPage(document ?= @getDocument())`
- `getNextPage(document ?= @getDocument())`
- `getPagedUrl(pageNumber ?= 0, document ?= @getDocument())`

It is important to note, that as the paged plugin clones the original document and injects the clones directly into the DocPad database, the extra pages (the clones) could appear in your content listings. To avoid this, be sure that your content listings filter out everything that has: `isPagedAuto: true`. For instance, a custom posts collection with the change applied would probably look like this:

``` coffee
module.exports =
	collections:
		posts: ->
			@getCollection('html').findAllLive(
				relativeOutDirPath: 'posts'
				isPagedAuto: $ne: true
			)
```


### Example: Paging a Collection Listing

Here is an example where we say create a `src/documents/posts.html.eco` file that pages out our `posts` custom collection.

It will create documents for each page for the `posts` collection in groups of 3. The first 3 documents in the collection will be rendered into a file called `posts.html` as normal, then the remaining documents from the collection will be rendered into subsequent files `posts.1.html`, `posts.2.html`, `posts.3.html` etc.

``` erb
---
title: 'Home'
layout: 'default'
isPaged: true
pagedCollection: 'posts'
pageSize: 3
---

<!-- Page Content -->
<% for document in @getCollection('posts').toJSON()[@document.page.startIdx...@document.page.endIdx]: %>
	<article id="post" class="post">
		<h1><a href='<%=document.url%>'><%= document.title %></a></h1>
		<div class="post-date"><%= document.date.toLocaleDateString() %></div>
		<div class="post-content">
			<%- document.contentRenderedWithoutLayouts %>
		</div>
	</article>
<% end %>

<!-- Page Listing -->
<div class="pagination">
	<ul>
		<!-- Previous Page Button -->
		<% unless @hasPrevPage(): %>
			<li class="disabled"><span>Prev</span></li>
		<% else: %>
			<li><a href="<%= @getPrevPage() %>">Prev</a></li>
		<% end %>

		<!-- Page Number Buttons -->
		<% for pageNumber in [0..@document.page.count-1]: %>
			<% if @document.page.number is pageNumber: %>
				<li class="active"><span><%= pageNumber + 1 %></span></li>
			<% else: %>
				<li><a href="<%= @getPageUrl(pageNumber) %>"><%= pageNumber + 1 %></a></li>
			<% end %>
		<% end %>

		<!-- Next Page Button -->
		<% unless @hasNextPage(): %>
			<li class="disabled"><span>Next</span></li>
		<% else: %>
			<li><a href="<%= @getNextPage() %>">Next</a></li>
		<% end %>
	</ul>
</div>
```


### Example: Splitting a Document into Multiple Pages

In this example we will split up a document say `src/documents/posts/awesome.html.eco` into 3 pages that have a max of 3 items per page.

``` erb
---
title: 'Awesome Pages Post'
layout: 'default'
isPaged: true
pageCount: 3
pageSize: 1
---

<!-- Page Content -->
<% if @document.page.number is 0: %>
	first awesome page
<% else if @document.page.number is 1: %>
	second awesome page
<% else if @document.page.number is 2: %>
	third awesome page
<% end %>

<!-- Page Listing -->
<div class="pagination">
	<ul>
		<!-- Previous Page Button -->
		<% unless @hasPrevPage(): %>
			<li class="disabled"><span>Prev</span></li>
		<% else: %>
			<li><a href="<%= @getPrevPage() %>">Prev</a></li>
		<% end %>
		
		<!-- Page Number Buttons -->
		<% for pageNumber in [0..@document.page.count-1]: %>
			<% if @document.page.number is pageNumber: %>
				<li class="active"><span><%= pageNumber + 1 %></span></li>
			<% else: %>
				<li><a href="<%= @getPageUrl(pageNumber) %>"><%= pageNumber + 1 %></a></li>
			<% end %>
		<% end %>
		
		<!-- Next Page Button -->
		<% unless @hasNextPage(): %>
			<li class="disabled"><span>Next</span></li>
		<% else: %>
			<li><a href="<%= @getNextPage() %>">Next</a></li>
		<% end %>
	</ul>
</div>
```


## History
[You can discover the history inside the `History.md` file](https://github.com/bevry/docpad-plugin-paged/blob/master/History.md#files)


## Contributing
[You can discover the contributing instructions inside the `Contributing.md` file](https://github.com/bevry/docpad-plugin-paged/blob/master/Contributing.md#files)


## License
Licensed under the incredibly [permissive](http://en.wikipedia.org/wiki/Permissive_free_software_licence) [MIT License](http://creativecommons.org/licenses/MIT/)
<br/>Copyright &copy; 2012+ [Ben Delarre](http://delarre.net) <ben@delarre.net>
