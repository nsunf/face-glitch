class Camera {
  public initialized = false;
  public videoEl?: HTMLVideoElement;

  constructor() {
    this.initialized = false;
  }
  async setCamera() {
    let mediaConfig: MediaStreamConstraints = { video: { facingMode: "user", width: 1920, height: 1080 }, audio: false };
    let mediaStream = await navigator.mediaDevices.getUserMedia(mediaConfig);
    this.videoEl = document.createElement('video');
    this.videoEl.srcObject = mediaStream;
    this.videoEl.autoplay = true;
    this.videoEl.playsInline = true;

    this.initialized = true;
  }
}

export default Camera;