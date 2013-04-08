/*
 * transform: A jQuery cssHooks adding 2D/3D transform capabilities to $.fn.css() and $.fn.animate()
 *
 * Requirements:
 * - jQuery 1.5.1+
 * - jquery.transition.js for animations
 * - browser implementing W3C's CSS 2DTransforms for 2D tranform
 * - browser implementing W3C's CSS 3DTransforms for 3D tranform
 *
 * latest version and complete README available on Github:
 * https://github.com/louisremi/jquery.transform.js
 *
 * Copyright 2011 @louis_remi
 * Licensed under the MIT license.
 *
 * This saved you an hour of work?
 * Send me music http://www.amazon.co.uk/wishlist/HNTU0468LQON
 *
 */
(function( $, window, document ) {
"use strict";

var div = document.createElement("div"),
  divStyle = div.style,
  prefixes = [
    "O",
    "ms",
    "Webkit",
    "Moz"
  ],
  prefix,
  i = prefixes.length,
  properties = [
    "transform",
    "transformOrigin",
    "transformStyle",
    "perspective",
    "perspectiveOrigin",
    "backfaceVisibility"
  ],
  property,
  j = prefixes.length;

// Find the right prefix
while ( i-- ) {
  if ( prefixes[i] + leadingUppercase( properties[0] ) in divStyle ) {
    prefix = prefixes[i];
    continue;
  }
}

// This browser is not compatible with transforms
if ( !prefix ) { return; }

// Build cssHooks for each property
while ( j-- ) {
  property = prefix + leadingUppercase( properties[j] );

  if ( property in divStyle ) {

    // px isn't the default unit of this property
    $.cssNumber[ properties[j] ] = true;

    // populate cssProps
    $.cssProps[ properties[j] ] = property;

    // MozTranform requires a complete hook because "px" is required in translate
    property === "MozTransform" && ($.cssHooks[ properties[j] ] = {
      get: function( elem, computed ) {
        return (computed ?
          // remove "px" from the computed matrix
          $.css( elem, property ).split("px").join(""):
          elem.style[property]
        );
      },
      set: function( elem, value ) {
        // add "px" to matrices
        /matrix\([^)p]*\)/.test(value) && (
          value = value.replace(/matrix((?:[^,]*,){4})([^,]*),([^)]*)/, "matrix$1$2px,$3px")
        );
        elem.style[property] = value;
      }
    });

  }
}

function leadingUppercase( word ) {
  return word.slice(0,1).toUpperCase() + word.slice(1);
}

})( jQuery, window, document );