export default function bindControllerEvents( bindings, controller ){
  Object.keys( bindings ).forEach( function( eventName ){
    controller.addEventListener( eventName, bindings[ eventName ] );
  });
}