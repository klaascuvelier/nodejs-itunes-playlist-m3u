var plist           = require('plist'),
    fs              = require('fs'),

    library         = void 0,

    musicFolder     = '/Users/klaascuvelier/Music',
    remoteFolder    = '/home/xbmc/Music',
    playlistFolder  = '/Users/klaascuvelier'
    ;


readItunesLibraryXML(getPlayLists);


/**
 * Read iTunes Library XML file (PLIST);
 *
 * @param method callback
 * @return void
 */
function readItunesLibraryXML(callback)
{
    plist.parseFile(musicFolder + "/iTunes/iTunes Music Library.xml", function (error, data) {

        if (!error)
        {
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
        }
        else {
            console.log('Could not read the iTunes Music Library', error);
        }

    });

}

/**
 * Get playlists from Library
 * @return {[type]}
 */
function getPlayLists() {

    var playlists   = library.Playlists,
        index       = void 0,
        playlist    = void 0;

i = 0;

    for (index in playlists)
    {

        if (playlists.hasOwnProperty(index)) {

            playlist    = playlists[index];
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

            if (skip.indexOf(playlist['Distinguished Kind']) === -1 && playlist.Master !== true && typeof playlist['Playlist Items'] !== 'undefined')
            {
                createPlayList(playlist.Name, playlist['Playlist Items']);
            }
           
        }

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

    for (i = 0; i < length; i++)
    {
        addTrack(tracks[i]['Track ID']);
    }
    
    fs.writeFileSync(playlistFolder + '/' + name.replace(/ /g, '-') + '.m3u', output, 'utf-8');
}