import { _decorator, gfx, Material, postProcess, renderer, rendering, Vec4, CCFloat } from 'cc';

const {ccclass, property, menu} = _decorator;

const {SettingPass, PostProcessSetting, BlitScreenPass, ForwardPass,} = postProcess

@ccclass('SobelPostProcess')
@menu('PostProcess/Sobel')
export class SobelPostProcess extends PostProcessSetting {
    @property({type: CCFloat, range: [0, 1], slide: true, step: 0.01})
    intensity = 1;

    @property(Material)
    _material: Material | undefined;

    @property(Material)
    get material() {
        return this._material;
    }

    set material(v) {
        this._material = v;
    }
}


export class SobelPass extends SettingPass {
    name = 'CustomPass'
    outputNames: string[] = ['CustomPassColor']
    params = new Vec4

    get setting() {
        return this.getSetting(SobelPostProcess);
    }

    // checkEnable(camera: renderer.scene.Camera): boolean {
    //     let setting = this.setting;
    //     return setting?.material && super.checkEnable(camera);
    // }

    render(camera: renderer.scene.Camera, ppl: rendering.Pipeline) {
        const cameraID = this.getCameraUniqueID(camera);

        let context = this.context;
        context.clearBlack()

        let input0 = this.lastPass.slotName(camera, 0);
        let output = this.slotName(camera);

        let setting = this.setting;
        let forwardPass = builder.getPass(ForwardPass);
        let depth = forwardPass.slotName(camera, 1);

        this.params.x = setting.intensity;

        if (setting.material) {
            setting.material.setProperty('params', this.params);

            // if (setting.showDepth) {
            //     input0 = depth;
            // }

            context.material = setting.material;
            context
                .updatePassViewPort()
                .addRenderPass('post-process', `${this.name}${cameraID}`)
                .setPassInput(input0, 'inputTexture')
                .setPassInput(depth, 'depthTexture')
                .addRasterView(output, gfx.Format.RGBA8)
                .blitScreen(0)
                .version();
        }

    }
}

let builder = rendering.getCustomPipeline('Custom') as postProcess.PostProcessBuilder;
if (builder) {
    builder.insertPass(new SobelPass, BlitScreenPass);
}
