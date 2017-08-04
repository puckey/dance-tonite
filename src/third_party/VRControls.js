/**
 * @author dmarcos / https://github.com/dmarcos
 * @author mrdoob / http://mrdoob.com
 */
module.exports = function( THREE ){

	THREE.VRControls = function (
    object,
    onError,
    param = {
      position: true
    }
  ) {

		var scope = this;

		var vrDisplay, vrDisplays;

		var standingMatrix = new THREE.Matrix4();

		var frameData = null;

		if ( 'VRFrameData' in window ) {

			frameData = new VRFrameData();

		}

		function gotVRDisplays( displays ) {

			vrDisplays = displays;

			if ( displays.length > 0 ) {

				vrDisplay = displays[ 0 ];

			} else {

				if ( onError ) onError( 'VR input not available.' );

			}

		}

		if ( navigator.getVRDisplays ) {

			navigator.getVRDisplays().then( gotVRDisplays ).catch ( function () {

				console.warn( 'THREE.VRControls: Unable to get VR Displays' );

			} );

		}

		// the Rift SDK returns the position in meters
		// this scale factor allows the user to define how meters
		// are converted to scene units.

		this.scale = 1;

		// If true will use "standing space" coordinate system where y=0 is the
		// floor and x=0, z=0 is the center of the room.
		this.standing = false;

		// Distance from the users eyes to the floor in meters. Used when
		// standing=true but the VRDisplay doesn't provide stageParameters.
		this.userHeight = 1.6;

		this.getVRDisplay = function () {

			return vrDisplay;

		};

		this.setVRDisplay = function ( value ) {

			vrDisplay = value;

		};

		this.getVRDisplays = function () {

			console.warn( 'THREE.VRControls: getVRDisplays() is being deprecated.' );
			return vrDisplays;

		};

		this.getStandingMatrix = function () {

			return standingMatrix;

		};

		this.update = function () {

			if ( vrDisplay ) {

				var pose;

				if ( vrDisplay.getFrameData ) {

					vrDisplay.getFrameData( frameData );
					pose = frameData.pose;

				} else if ( vrDisplay.getPose ) {

					pose = vrDisplay.getPose();

				}

				if ( pose.orientation !== null ) {

					object.quaternion.fromArray( pose.orientation );

				}

        if (param.position) {
          if (param.position && pose.position !== null ) {

            object.position.fromArray( pose.position );

          } else {

            object.position.set( 0, 0, 0 );

          }
        }

				if ( this.standing && param.position ) {

					if ( vrDisplay.stageParameters ) {

						object.updateMatrix();

						const { sittingToStandingTransform } = vrDisplay.stageParameters;
						if( isIdentityMatrix( sittingToStandingTransform ) ){
							object.matrix.identity();
							object.applyMatrix( defaultMatrix );
						}
						else{
							standingMatrix.fromArray( sittingToStandingTransform );
							object.applyMatrix( standingMatrix );
						}

					} else {

						object.position.setY( object.position.y + this.userHeight );

					}

				}

				object.position.multiplyScalar( scope.scale );

			}

		};

		this.resetPose = function () {

			if ( vrDisplay ) {

				vrDisplay.resetPose();

			}

		};

		this.resetSensor = function () {

			console.warn( 'THREE.VRControls: .resetSensor() is now .resetPose().' );
			this.resetPose();

		};

		this.zeroSensor = function () {

			console.warn( 'THREE.VRControls: .zeroSensor() is now .resetPose().' );
			this.resetPose();

		};

		this.dispose = function () {

			vrDisplay = null;

		};

	};
}

const AVERAGE_USER_HEIGHT = 1.6;
const translation = new THREE.Matrix4().makeTranslation( 0, AVERAGE_USER_HEIGHT, 0 );
const rotation = new THREE.Matrix4().makeRotationY( 0 );
const defaultMatrix = new THREE.Matrix4().multiplyMatrices( translation, rotation );

const identityMatrixArray = [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

function isIdentityMatrix( matrixArray ){
	for( let i=0; i<matrixArray.length; i++ ){
		if( matrixArray[ i ] !== identityMatrixArray[ i ] ){
			return false;
		}
	}
	return true;
}