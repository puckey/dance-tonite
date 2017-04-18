import * as SDFText from './sdftext';
import Props from './props';

const instructions = {
  waiting: {
    right: 'press to start'
  },
  recording: {
    right: 'press to finish'
  },
  reviewing: {
    right: 'press to submit',
    left: 'press to redo'
  },
  submitting: {
    right: 'submitting'
  }
};

function createTutorial( events ){

  const textCreator = SDFText.creator();

  const rhand = Props.controller.clone();
  const lhand = Props.controller.clone();
  const rText = textCreator.create('');
  const lText = textCreator.create('');
  rhand.add( rText );
  lhand.add( lText );

  Object.keys( instructions ).forEach( function( eventName ){
    events.on( eventName, function(){
      const { left, right } = instructions[ eventName ];
      rText.updateLabel( right );
      lText.updateLabel( left );
    });
  });

  return { rhand, lhand };
}

export default createTutorial;