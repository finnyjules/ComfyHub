export const collections = [
  {
    id: 'marketing',
    title: 'Marketing',
    description:
      'Create stunning visuals for social media, ads, and brand content. These workflows help you generate professional marketing assets in minutes.',
    filters: {
      categories: ['image-generation', 'batch-processing'],
      tags: ['product', 'brand', 'fashion', 'brand-design', 'mockup', 'layout-design'],
      techniques: ['Style Transfer', 'ControlNet', 'img2img'],
    },
  },
  {
    id: 'vfx',
    title: 'VFX',
    description:
      'Professional visual effects workflows for compositing, motion graphics, and cinematic post-production.',
    filters: {
      categories: ['video-generation', 'inpainting'],
      tags: ['video', 'video-edit', 'motion-control', 'frame-interpolation', 'style-transfer', 'relight'],
      techniques: ['AnimateDiff', 'SVD', 'Style Transfer', 'Face Swap', 'Inpainting'],
    },
  },
  {
    id: 'architecture',
    title: 'Architecture',
    description:
      'Visualize architectural designs with AI-powered rendering, concept art generation, and 3D-to-image conversion.',
    filters: {
      categories: ['image-generation', '3d', 'upscaling'],
      tags: ['depth-map', 'controlnet', '3d', 'image-to-3d', 'normal-map', 'controlnet-depth'],
      techniques: ['ControlNet', 'ControlNet Depth', 'ControlNet Lineart', 'Depth Map', 'img2img', 'Upscaling'],
    },
  },
  {
    id: 'animation',
    title: 'Animation',
    description:
      'Bring your ideas to life with AI animation workflows — from text-to-video to frame interpolation and motion control.',
    filters: {
      categories: ['video-generation'],
      tags: ['text-to-video', 'image-to-video', 'video', 'frame-interpolation', 'motion-control', 'flf2v'],
      techniques: ['AnimateDiff', 'SVD', 'Frame Interpolation'],
    },
  },
]
