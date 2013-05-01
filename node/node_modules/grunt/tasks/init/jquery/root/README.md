# {%= title || name %}

{%= description %}

## Getting Started
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/{%= git_user %}/{%= git_repo %}/master/dist/{%= name %}.min.js
[max]: https://raw.github.com/{%= git_user %}/{%= git_repo %}/master/dist/{%= name %}.js

In your web page:

```html
<script src="jquery.js"></script>
<script src="dist/{%= name %}.min.js"></script>
<script>
jQuery(function($) {
  $.awesome(); // "awesome"
});
</script>
```

## Documentation
_(Coming soon)_

## Examples
_(Coming soon)_

## Release History
_(Nothing yet)_
