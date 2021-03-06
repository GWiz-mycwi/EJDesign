/**
 *
 * Audio Note Model
 *
 * audioNote.js
 * @author Kerri Shotts
 * @version 1.0.0
 *
 * Copyright (c) 2013 Packt Publishing
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to the following
 * conditions:
 * The above copyright notice and this permission notice shall be included in all copies
 * or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT
 * OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */
/*jshint
         asi:true,
         bitwise:true,
         browser:true,
         curly:true,
         eqeqeq:false,
         forin:true,
         noarg:true,
         noempty:true,
         plusplus:false,
         smarttabs:true,
         sub:true,
         trailing:false,
         undef:true,
         white:false,
         onevar:false 
 */
/*global define*/
define( [ "yasmf", "app/models/baseNote", "app/models/mediaManager" ], function( _y,
  BaseNote, MediaManager ) {
  var _className = "AudioNote";
  var AudioNote = function() {
    var self = new BaseNote();
    self.subclass( _className );
    /**
     * The media property gives easy access to the underlying Media Manager
     * so that we can ask it to record and play.
     */
    self._media = null;
    self.getMedia = function() {
      return self._media;
    };
    Object.defineProperty( self, "media", {
      get: self.getMedia,
      configurable: true
    } );
    /**
     * We've a different representation - a sound wave
     */
    self._representation = "sound-wave";
    /**
     * New unit labels -- in seconds
     */
    self.unitLabels = [ "app.an.SECONDS", "app.an.SECOND", "app.an.SECONDS" ];
    /**
     * Called to update the duration
     */
    self._updateUnit = function() {
      self.unitValue = self._media.duration / 1000; // we want seconds, not milliseconds
    };
    /**
     * Called to update the modified date (after recording)
     */
    self._updateModificationDate = function() {
      self._modifiedDate = new Date();
    };
    /**
     * Override setting the media contents so that we can create a new Media
     * Manager and start listening for notifications.
     */
    self.overrideSuper( self.class, "setMediaContents", self.setMediaContents );
    self.setMediaContents = function( theMediaContents ) {
      self.super( _className, "setMediaContents", [ theMediaContents ] );
      if ( self._media !== null ) {
        self._media.destroy();
        self._media = null;
      }
      self._media = new MediaManager();
      self._media.init( "cdvfile://localhost/persistent/" + theMediaContents );
      self.notify( "mediaContentsChanged" );
      self._media.addListenerForNotification( "durationUpdated", self._updateUnit );
      self._media.addListenerForNotification( "recordingStopped", self._updateModificationDate );
    };
    Object.defineProperty( self, "mediaContents", {
      get: self.getMediaContents,
      set: self.setMediaContents,
      configurable: true
    } );
    /**
     * Override destroy so we can release the Media Manager
     */
    self.overrideSuper( self.class, "destroy", self.destroy );
    self.destroy = function() {
      self._media.destroy();
      self._media = null;
      self.super( _className, "destroy" );
    };
    return self;
  };
  _y.addTranslations( {
    "app.an.SECOND": {
      "EN": "second",
      "ES": "segundo"
    },
    "app.an.SECONDS": {
      "EN": "seconds",
      "ES": "segundos"
    }
  } );
  return AudioNote;
} );
