import EffectComposer, { RenderPass, ShaderPass, CopyShader } from 'three-effectcomposer-es6';

import BadTVShader from './lib/BadTVShader';
import StaticShader from './lib/StaticShader';

export default function setup({ renderer, scene, camera }) {
  const composer = new EffectComposer(renderer);
  // composer.setSize(renderer.width, renderer.height);
  const badTVPass = new ShaderPass(BadTVShader);
  badTVPass.uniforms.distortion.value = 0.5;
  badTVPass.uniforms.distortion2.value = 0.25;
  badTVPass.uniforms.speed.value = 0.3;
  badTVPass.uniforms.rollSpeed.value = 0;

  const staticPass = new ShaderPass(StaticShader);
  staticPass.uniforms.amount.value = 0.05;
  staticPass.uniforms.size.value = 3;

  composer.addPass(new RenderPass(scene, camera));
  const copyPass = new ShaderPass(CopyShader);
  copyPass.renderToScreen = true;
  composer.addPass(badTVPass);
  composer.addPass(staticPass);
  composer.addPass(copyPass);

  let shaderTime = 0;

  return {
    render: function () {
      shaderTime += 0.01;
      badTVPass.uniforms.time.value = shaderTime;
      staticPass.uniforms.time.value = shaderTime;
      composer.render(0.1);
    },
    resize: function (width, height) {
      composer.renderTarget1.setSize(width, height);
      composer.renderTarget2.setSize(width, height);
    },
  };
}

