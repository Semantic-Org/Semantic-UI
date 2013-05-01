# timespan

A simple implementation of TimeSpans in Javascript.

## Installation in node.js

### Installing npm (node package manager)
``` bash
  $ curl http://npmjs.org/install.sh | sh
```

### Installing timespan
``` bash
  [sudo] npm install timespan
```

## Usage 
You have two options when creating a new TimeSpan object: either explicitly instantiate it using the TimeSpan constructor function or use a helper method to create from a specific length of time.

### Using the new constructor

``` js
  var timespan = require('timespan');
  var ts = new timespan.TimeSpan();
```

The constructor takes 5 parameters, all which are optional and which can be used to initialize the TimeSpan to a given value. These parameters are: `milliseconds`, `seconds`, `minutes`, `hours`, `days`.

``` js
  //
  // Initializes the TimeSpan to 4 Minutes, 16 Seconds and 0 Milliseconds.
  //
  var ts = new TimeSpan(0,16,4)

  //
  // Initializes the TimeSpan to 3 hours, 4 minutes, 10 seconds and 0 msecs.
  //
  var ts = new TimeSpan(0,10,64,2);
```

### Using Construction Helper Method(s) 
You can initialize a new TimeSpan by calling one of these Functions:

``` js
  timespan.FromSeconds(/* seconds */);
  timespan.FromMinutes(/* minutes */);
  timespan.FromHours(/* hours */);
  timespan.FromDays(/* hours */);
    
  //
  // This behaves differently, see below
  //
  timespan.FromDates(start, end);
```

The first four helper methods take a single numeric parameter and create a new TimeSpan instance. e.g. `timespan.FromSeconds(45)` is equivalent to `new TimeSpan(0,45)`. If the parameter is invalid/not a number, it will just be treated as 0 no error will be thrown.

`timespan.FromDates()` is different as it takes two dates. The TimeSpan will be the difference between these dates.

If the second date is earlier than the first date, the TimeSpan will have a negative value. You can pass in "true" as the third parameter to force the TimeSpan to be positive always.

``` js
  var date1 = new Date(2010, 3, 1, 10, 10, 5, 0);
  var date2 = new Date(2010, 3, 1, 10, 10, 10, 0);
  var ts = TimeSpan.FromDates(date2, date1);
  var ts2 = TimeSpan.FromDates(date2, date1, true);
  
  //
  // -5, because we put the later date first
  //
  console.log(ts.totalSeconds()); 
  
  //
  // 5, because we passed true as third parameter
  //
  console.log(ts2.totalSeconds()); 
```


### Adding / Subtracting TimeSpans
There are several functions to add or subtract time:

``` js
  ts.addMilliseconds()
  ts.addSeconds()
  ts.addMinutes()
  ts.addHours()
  ts.addDays()
  ts.subtractMilliseconds()
  ts.subtractSeconds()
  ts.subtractMinutes()
  ts.subtractHours()
  ts.subtractDays()
```

All these functions take a single numeric parameter. If the parameter is invalid, not a number, or missing it will be ignored and no Error is thrown.

``` js
  var ts = new TimeSpan();
  ts.addSeconds(30);
  ts.addMinutes(2);
  ts.subtractSeconds(60);
  
  //
  // ts will now be a timespan of 1 minute and 30 seconds
  //
```

The parameter can be negative to negate the operation `ts.addSeconds(-30)` is equivalent to `ts.subtractSeconds(30)`.

### Interacting with Other TimeSpan instances
These are the functions that interact with another TimeSpan:

``` js
  ts.add()
  ts.subtract()
  ts.equals()
```

add and subtract add/subtract the other TimeSpan to the current one:

``` js
  var ts = TimeSpan.FromSeconds(30);
  var ts2 = TimeSpan.FromMinutes(2);
  ts.add(ts2);
  
  //
  // ts is now a TimeSpan of 2 Minutes, 30 Seconds
  // ts2 is unchanged
  //
```

equals checks if two TimeSpans have the same time:

``` js
  var ts = TimeSpan.FromSeconds(30);
  var ts2 = TimeSpan.FromSeconds(30);
  var eq = ts.equals(ts2); // true
  ts2.addSeconds(1);
  var eq2 = ts.equals(ts2); // false
```

### Retrieving the Value of a TimeSpan
There are two sets of functions to retreive the function of the TimeSpan: those that deal with the full value in various measurements and another that gets the individual components.

#### Retrieve the full value

``` js
  ts.totalMilliseconds()
  ts.totalSeconds()
  ts.totalMinutes()
  ts.totalHours()
  ts.totalDays()
```

These functions convert the value to the given format and return it. The result can be a floating point number. These functions take a single parameter roundDown which can be set to true to round the value down to an Integer.

``` js
  var ts = TimeSpan.fromSeconds(90);
  console.log(ts.totalMilliseconds()); // 90000
  console.log(ts.totalSeconds());      // 90
  console.log(ts.totalMinutes());      // 1.5
  console.log(ts.totalMinutes(true));  // 1
```

#### Retrieve a component of the TimeSpan

``` js
  ts.milliseconds
  ts.seconds
  ts.minutes
  ts.hours
  ts.days
```

These functions return a component of the TimeSpan that could be used to represent a clock. 

``` js
  var ts = TimeSpan.FromSeconds(90);
  console.log(ts.seconds()); // 30
  console.log(ts.minutes()); // 1
```

Basically these value never "overflow" - seconds will only return 0 to 59, hours only 0 to 23 etc. Days could grow infinitely. All of these functions automatically round down the result:

``` js
  var ts = TimeSpan.FromDays(2);
  ts.addHours(12);
  console.log(ts.days());  // 2
  console.log(ts.hours()); // 12
```

## Remark about Backwards Compatibility
Version 0.2.x was designed to work with [node.js][0] and backwards compatibility to the browser-based usage was not considered a high priority. This will be fixed in future versions, but for now if you need to use this in the browser, you can find the 0.1.x code under `/browser`.

#### Author: [Michael Stum](http://www.stum.de)
#### Contributors: [Charlie Robbins](http://github.com/indexzero)

[0]: http://nodejs.org 