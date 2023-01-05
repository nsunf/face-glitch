import '@mediapipe/face_detection';
import '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import * as faceDetection from '@tensorflow-models/face-detection';

class FaceDetector {
  faces: faceDetection.Face[] = [];
  detector?: faceDetection.FaceDetector;

  async setDetector() {
    this.faces = [];
    
    const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
    const detectorConfig: faceDetection.MediaPipeFaceDetectorTfjsModelConfig = {
      runtime: 'tfjs',
      maxFaces: 5
    };
    this.detector = await faceDetection.createDetector(model, detectorConfig);
  }

  async detectFace(input: HTMLImageElement|HTMLVideoElement|HTMLCanvasElement) {
    if (!this.detector) return;
    this.faces = [];

    const estimationConfig = {flipHorizontal: false};
    const faces = await this.detector.estimateFaces(input, estimationConfig);

    this.faces = faces;
    return faces;
  }
}

export default FaceDetector;