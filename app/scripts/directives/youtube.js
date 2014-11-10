/**
 * Created by tom on 10/31/14.
 */
'use strict';
angular
    .module('jetgrizzlyApp')
    .directive('youtube', function ($window) {
      return {
        restrict: 'E',
        scope   : {
          height : '@',
          width  : '@',
          videoId: '@'
        },
        template: '<div></div>',
        link    : function (scope, element) {
          var tag = document.createElement('script');
          tag.src = "https://www.youtube.com/iframe_api";
          var firstScriptTag = document.getElementsByTagName('script')[0];
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
          var player;
          $window.onYouTubeIframeAPIReady = function () {
            player = new YT.Player(element.children()[0], {
              playerVars: {
                autoplay      : 0,
                html5         : 1,
                theme         : "light",
                modesbranding : 0,
                color         : "white",
                iv_load_policy: 3,
                showinfo      : 0,
                controls      : 0
              },

              height : scope.height,
              width  : scope.width,
              videoId: scope.videoId
            });
          };
        }
      }
    });
