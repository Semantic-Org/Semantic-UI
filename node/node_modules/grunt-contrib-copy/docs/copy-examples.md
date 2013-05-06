# Usage Examples

```js
copy: {
  main: {
    files: [
      {src: ['path/*'], dest: 'dest/', filter: 'isFile'}, // includes files in path
      {src: ['path/**'], dest: 'dest/'}, // includes files in path and its subdirs
      {expand: true, cwd: 'path/', src: ['**'], dest: 'dest/'}, // makes all src relative to cwd
      {expand: true, flatten: true, src: ['path/**'], dest: 'dest/', filter: 'isFile'} // flattens results to a single level
    ]
  }
}
```
