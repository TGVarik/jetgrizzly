'use strict';
/*jshint -W020 */
(function(){
var module = angular.module('jetgrizzlyApp.Room', ['ui.router']).config(function ($stateProvider) {
  $stateProvider.state('lobby', {
    url: '/',
    parent: 'app',
    templateUrl: 'views/room/room.html',
    controller: function ($scope, user) {
      $scope.user = user;
    }
  });
}).controller('PlayerController', function ($scope, $window, config, playerState, $firebase) {
  playerState
    .getCurrentVideoObject()
    .$loaded()
    .then(function(obj){
      if (obj.id) return obj;
      var next = $scope.queue[0];
      if (next) {
        $scope.queue.$remove(next)
          .then(function (ref) {
            console.log('removed', ref)
          });
        return playerState.setCurrentVideo(next);
      } else {
        throw 'queue is empty'
      }
    })
    .then(function(obj){
      $scope.yt = {
        width: 640,
        height: 390,
        currentVideo: obj
      };
    })
    .catch(function(e){
      console.error(e);
    });
  })
.directive('youtube', function ($window, config, youtubeApi, playerState) {
  return {
    // elements attribute settings i.e. id, height attrs
    restrict: 'E',
    scope: {
      // bind attrs to our directive scope
      // one way binding - data changed in the view is updated in javascript
      height: '@',
      width: '@',
      currentVideoId: '@videoid'
    },
    // template to put inside of directive
    template: '<div></div>',
    link: function (scope, element) {
      // ensure the playerState service is ready
      playerState.ready().then(function(){
        console.log('player is ready');
        // ensure the youtube api is ready
        youtubeApi.getYT().then(function(YT){
          console.log('yt is ready', scope);
          var currentVideoId = scope.currentVideoId;
          scope.player = new YT.Player(element.children()[0], {
            playerVars: {
              autoplay: 1,
              html5: 1,
              controls: 0,
              showinfo: 0,
              rel: 0,
              enablejsapi:1,
              start: playerState.getCurrentVideoTime()
            },
            // this will allow the view to change in real time
            height: scope.height,
            width: scope.width,
            videoId: currentVideoId,
            events: {
              'onStateChange': function(event){
                //switch (event.data){
                //  case -1:
                //    // video has not started
                //
                //  case 0:
                //  case 1:
                //  case 2:
                //  case 3:
                //  case 4:
                //  case 5:
                //}
                if (event.data === 0){ // Video has ended
                  if(playerState.getCurrentVideoId() !== currentVideoId){
                    // firebase changed before our playback ended so we play it
                    // right away.
                    currentVideoId =playerState.getCurrentVideoId();
                    scope.player.loadVideoById(currentVideoId);
                  }else{
                    // player must wait for next video from server
                    playerState.getNextVideo().then(function(nextVideo){
                      // video wait ended and new video is loaded
                      currentVideoId = nextVideo.currentVideo;
                      scope.player.loadVideoById(currentVideoId);
                    });
                  }
                } else if (event.data === 1) {
                // video is playing

                } else if (event.data === 2) {
                // video is paused
                  // if the video is playing on server
                  if(playerState.isPlaying()){
                    scope.player.playVideo();
                  }
                } else if (event.data === 3) {
                // video is buffering

                } else {
                  console.log(event.data);
                }
              }
            }
          });
        });

      });
    }
  };
  });
})();
