jQuery(document).ready(function(){
  jQuery("#term").on("keypress", function(event){
    if (event.keyCode == 13) doSearch();
  });
});

function listArtists(){
  var url = "/aether/artists";
  var params = {};
  jQuery.get(url, params, function(result){
    if (result.error) alert("There was an error retrieving the artist list.");
    else{
      var target = jQuery("#result");
      if (!target) return;
      target.html("<table><tr><td>Artist</td></tr></table>");
      var table = jQuery("#result table");
      var artists = result.artists;
      if (!artists || !artists.length) return;
      for (var i = 0; i < artists.length; i++){
        var artist = artists[i];
        var id = artist.id;
        var name = artist ? artist.display_name : "&nbsp;";
        table.append("<tr><td><a href=\"#\" onclick=\"searchByArtist('" + id + "');return false;\">" + name + "</a></td></tr>");
      }
    }
  }); 
}

function searchByArtist(artistId){
  var url = "/aether/artist/" + artistId;
  var params = {};
  jQuery.get(url, params, function(result){
    if (result.error) alert("There was an error during search.");
    else{
      var target = jQuery("#result");
      if (!target) return;
      target.html("<table><tr><td>Artist</td><td>Album</td><td>Title</td></tr></table>");
      var table = jQuery("#result table");
      var songs = result.songs;
      if (!songs || !songs.length) return;
      for (var i = 0; i < songs.length; i++){
        var song = songs[i];
        var id = song.id;
        var title = song.display_name;
        var album = song.album ? song.album.display_name : "&nbsp;";
        var artist = song.artist ? song.artist.display_name : "&nbsp;";
        table.append("<tr><td>" + artist + "</td><td>" + album + "</td><td><a href=\"#\" onclick=\"openSong('" + id + "');return false;\">" + title + "</a></td></tr>");
      }
    }
  });
}

function doSearch(){
  var field = jQuery("#field").val();
  var term = jQuery("#term").val();
  var url = "/aether/search";
  var params = {"field" : field, "term" : term};
  jQuery.post(url, params, function(result){
    if (result.error) alert("There was an error during search.");
    else{
      var target = jQuery("#result");
      if (!target) return;
      target.html("<table><tr><td>Artist</td><td>Album</td><td>Title</td></tr></table>");
      var table = jQuery("#result table");
      var songs = result.songs;
      if (!songs || !songs.length) return;
      for (var i = 0; i < songs.length; i++){
        var song = songs[i];
        var id = song.id;
        var title = song.display_name;
        var album = song.album ? song.album.display_name : "&nbsp;";
        var artist = song.artist ? song.artist.display_name : "&nbsp;";
        table.append("<tr><td>" + artist + "</td><td>" + album + "</td><td><a href=\"#\" onclick=\"openSong('" + id + "');return false;\">" + title + "</a></td></tr>");
      }
    }
  }); 
}

function openSong(id){
  var target = jQuery("#player");
  if (!target) return;
  target.html("<span>loading song ...</span>");

  var url = "/aether/song/" + id;
  var html = "<audio id=\"audio\" controls=\"controls\" autoplay=\"autoplay\">";
  html += "<source src=\"" + url + "\" type=\"audio/mpeg\" />";
  html += "<p>browser does NOT support tag</p></audio>";
  target.html(html);
  var audio = document.getElementById("audio");
  audio.volume = 0.5;
}
