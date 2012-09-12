nodejs-itunes-playlist-to-m3u
==============================

Convert iTunes playlists to m3u files.

Works with Smart playlists (top rated and most played) and Genius playlists too.

usage
=====
Default:
```node index.js```

Possible parameters:

`--music, -m` specify the directory where the iTunes folder is in. Default value: `~/Music`

`--playlist, -p` the directory where the m3u files should be placed. Default value: `~/Music`

`--directory, -d` an option to replace the original directory with another directory. This might come in handy if you're exporting the playlists to use on another device. Default value: the value of `--music`

Example:
```node index.js -m ~/Music -p ~/ -d /home/xbmc/Music```
