'use strict';

/**
 * @ngdoc service
 * @name jetgrizzlyApp.playerState
 * @description
 * # playerState
 * Factory in the jetgrizzlyApp.
 */
angular.module('jetgrizzlyApp')
  .factory('playerState', function (config, $window, $q, $firebase, lodash) {
    var youtubeRef = new $window.Firebase(config.firebase.url+'/youTube');
    var $youtubeRef = $firebase(youtubeRef);
    var currentVideoObject = $youtubeRef.$asObject();


    //var currentVideoObject  = {
    //  isPlaying:false,
    //  currentVideo:""
    //};

    // video change is deferred so that player plays next when appropiate
    var deferredVideoChange = $q.defer();


    // listen to value changes on firebase to resolve the promise when video changes
    youtubeRef.on('value',function(snapshot){
      var data = snapshot.val();
      if(!(currentVideoObject.id && data.id)) return;
      if(currentVideoObject.id !== data.id){
        if(data.id){
          data.startTime = data.startTime || Date.now();
          // video change is resolved so that players can react to it
          deferredVideoChange.resolve(data);

          // after resolving we defer again for the next video
          deferredVideoChange = $q.defer();

          // we keep track of current video to detect videoChanges and delegate property access.
          currentVideoObject = data;
        }
      }
    });
    // public API here
    return {
      setCurrentVideo: function(video){
        console.dir(video);
        currentVideoObject = lodash.reduce(video,function(m, v, k){
          if (k.charAt(0) !== '$'){
            m[k] = v;
          }
          return m;
        }, {
          startTime: Date.now(),
          isPlaying: true
        });
        return currentVideoObject;
      },
      isPlaying: function(){
        return currentVideoObject.isPlaying;
      },
      getCurrentVideoId: function () {
        return currentVideoObject.id;
      },
      getCurrentVideoObject: function(){
        return currentVideoObject;
      },
      getCurrentVideoTime: function() {
        return Math.floor((Date.now()-currentVideoObject.startTime)/1000);
      },
      ready:function() {
        // if the deferredVideoChange is resolved, the video will have startTime
        if(currentVideoObject.startTime) {
          var d = $q.defer();
          // we resolve a promise at once with the current video
          d.resolve(currentVideoObject);
          return d.promise;
        } else {
          // if not we get the deferred video change promise
          return this.getNextVideo();
        }
      },
      getNextVideo: function() {
        return deferredVideoChange.promise;
      }
    };
  });
