(function start(process, require, console) {
    "use strict";

    var plist           = require('plist'),
        fs              = require('fs'),

        library         = void 0,

        musicFolder     = void 0,
        remoteFolder    = void 0,
        playlistFolder  = void 0;


    /**
     * Get parameters via arguments
     */
    function getParameters(process) {
        var homeFolder  = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'],
            args        = process.argv.splice(2),
            l           = void 0,
            i           = void 0;

        args    = args.join(' ').split(/[\s=]+/);
        l       = args.length;

        musicFolder     = homeFolder + '/Music';
        remoteFolder    = homeFolder + '/Music';
        playlistFolder  = homeFolder + '/Music';

        for (i = 0; i < l; i += 2) {

            switch (args[i]) {
            case '--music':
            case '-m':
                musicFolder     = args[(i + 1)].replace('~', homeFolder);
                remoteFolder    = musicFolder;
                break;

            case '--playlists':
            case '-p':
                playlistFolder  = args[(i + 1)].replace('~', homeFolder);
                break;

            case '--directory':
            case '-d':
                remoteFolder    = args[(i + 1)].replace('~', homeFolder);
                break;
            }

        }
    }


    /**
     * Read iTunes Library XML file (PLIST);
     *
     * @param method callback
     * @return void
     */
    function readItunesLibraryXML(callback) {

        try {


            plist.parseFile(musicFolder + "/iTunes/iTunes Music Library.xml", function (error, data) {

                if (!error) {
                    /*
                    Major Version
                    Minor Version
                    Date
                    Application Version
                    Features
                    Show Content Ratings
                    Music Folder
                    Library Persistent ID
                    Tracks
                    Playlists
                     */

                    library = data[0];

                    if (callback) {
                        callback();
                    }
                } else {
                    console.log('Could not parse the iTunes Music Library', error);
                }

            });
        } catch (exception) {
            console.log('Could not read the iTunes Music Library', exception);
        }

    }


    /**
     * Create a playlist (M3U-format)
     * @param  {String} name
     * @param  {Array} tracks
     * @return void
     */
    function createPlayList(name, tracks) {

        var output      = '',
            i           = void 0,
            length      = tracks.length,
            addTrack    = function (trackId) {
                var track   = library.Tracks[trackId];

                output += '#EXTINF:' + track['Total Time'] + ', ' + track.Artist + ' - ' + track.Name + "\n";
                output += track.Location.replace('file://localhost' + musicFolder, remoteFolder).replace(/%20/g, ' ') + "\n\n";
            };

        output += '#EXTM3U' + "\n";

        for (i = 0; i < length; i += 1) {
            addTrack(tracks[i]['Track ID']);
        }

        try {
            fs.writeFileSync(playlistFolder + '/' + name.replace(/ /g, '-') + '.m3u', output, 'utf-8');
        } catch (exception) {
            console.log('Could not write m3u-file', exception);
        }
    }

    /**
     * Get playlists from Library
     * @return {[type]}
     */
    function getPlayLists() {

        var playlists   = library.Playlists,
            index       = void 0,
            playlist    = void 0,
            skip        = [
                4,      // Music
                2,      // Movies
                5,      // Books
                19,     // Purchased
                22,     // iTunes DJ
                205,    // Music Videos
                17,     // Voice Memos
                26,     // Genius
                200     // 90's Music
            ];

        for (index in playlists) {

            if (playlists.hasOwnProperty(index)) {

                playlist    = playlists[index];

                if (skip.indexOf(playlist['Distinguished Kind']) === -1 && playlist.Master !== true && playlist['Playlist Items'] !== undefined) {
                    createPlayList(playlist.Name, playlist['Playlist Items']);
                }

            }

        }

    }


    // initialize parameters
    getParameters(process);

    // start by reading the library
    readItunesLibraryXML(getPlayLists);


})(process, require, console);