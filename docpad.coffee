# The DocPad Configuration File
# It is simply a CoffeeScript Object which is parsed by CSON
docpadConfig = {

	srcPath : './server'
	outPath: './docs'

	# =================================
	# Template Data
	# These are variables that will be accessible via our templates
	# To access one of these within our templates, refer to the FAQ: https://github.com/bevry/docpad/wiki/FAQ

	templateData:

		# Specify some site properties
		site:
			# The production url of our website
			url: "http://www.semantic-ui.com"

			# Here are some old site urls that you would like to redirect from
			oldUrls: [
				'learnsemantic.com'
			],

			# The default title of our website
			title: "Semantic UI"

			# The website description (for SEO)
			description: """
				Semantic empowers designers and developers by creating a shared vocabulary for UI.
				"""

			# The website keywords (for SEO) separated by commas
			keywords: """
				html5, ui, library, framework, javascript
				"""


		# -----------------------------
		# Helper Functions

		# Get the prepared site/document title
		# Often we would like to specify particular formatting to our page's title
		# we can apply that formatting here
		getPreparedTitle: ->
			# if we have a document title, then we should use that and suffix the site's title onto it
			if @document.title
				"#{@document.title} | #{@site.title}"
			# if our document does not have it's own title, then we should just use the site's title
			else
				@site.title

		getPage: (collection, id) ->
			for item, index in collection
				selectedIndex = (index + 1) if item.id is id
			selectedIndex

		pageCount: (collection) ->
			for item, index in collection
				itemCount = index + 1
			itemCount

		getPageCollection: (collection, id, delta = 2) ->
			for item, index in collection
				selectedIndex = index if item.id is id
				lastIndex = index

			# determine page count before and after
			bottomCount = if (selectedIndex - delta >= 0) then delta else (selectedIndex)
			topCount = if (selectedIndex + delta <= lastIndex) then delta else (lastIndex - selectedIndex)

			bottomDelta = (delta * 2 - topCount)
			topDelta = (delta * 2 - bottomCount)

			bottomIndex = if (selectedIndex - bottomDelta >= 0) then (selectedIndex - bottomDelta) else 0
			topIndex = if (selectedIndex + topDelta <= lastIndex) then (selectedIndex + topDelta) else lastIndex
			result = collection[bottomIndex..topIndex]
			result

		# Get the prepared site/document description
		getPreparedDescription: ->
			# if we have a document description, then we should use that, otherwise use the site's description
			@document.description or @site.description

		# Get the prepared site/document keywords
		getPreparedKeywords: ->
			# Merge the document keywords with the site keywords
			@site.keywords.concat(@document.keywords or []).join(', ')


	# =================================
	# Custom Collections

	collections:
		uiElements: ->
			@getCollection("documents").findAllLive({type: $in: ['UI Element']}, [{title: 1}])

		uiCollections: ->
			@getCollection("documents").findAllLive({type: $in: ['UI Collection']}, [{title: 1}])

		uiViews: ->
			@getCollection("documents").findAllLive({type: $in: ['UI View']}, [{title: 1}])

		uiModules: ->
			@getCollection("documents").findAllLive({type: $in: ['UI Module', 'UI Behavior']}, [{title: 1}])

	# =================================
	# DocPad Events

	# Here we can define handlers for events that DocPad fires
	# You can find a full listing of events on the DocPad Wiki
	# events:


}

# Export our DocPad Configuration
module.exports = docpadConfig
