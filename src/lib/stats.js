(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Stats = factory());
}(this, (function () { 'use strict';

/**
 * @author mrdoob / http://mrdoob.com/
 * heavily modified by @customlogic
 */

var Stats = function () {
	var beginTime = ( performance || Date ).now(), prevTime = beginTime, frames = 0;

	return {

		begin: function () {

			beginTime = ( performance || Date ).now();

		},

		end: function () {

			frames ++;

			var time = ( performance || Date ).now();

			if ( time > prevTime + 1000 ) {
				this.fps = ( frames * 1000 ) / ( time - prevTime );

				prevTime = time;
				frames = 0;

			}



			return time;

		},

		update: function () {

			beginTime = this.end();

		},


	};

};

return Stats;

})));
