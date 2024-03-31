class Camera {
  public initialized = false;
  public videoEl?: HTMLVideoElement;

  constructor() {
    this.initialized = false;
  }
  async setCamera() {
    // let mediaConfig: MediaStreamConstraints = { video: { facingMode: "user", width: 1920, height: 1080 }, audio: false };
    let mediaConfig: MediaStreamConstraints = { video: { facingMode: "user", width: 1440, height: 1440 }, audio: false };
    let mediaStream = await navigator.mediaDevices.getUserMedia(mediaConfig);

    const videoTrack = mediaStream.getVideoTracks()[0]
    console.log(videoTrack.getSettings().width + " :: " + videoTrack.getSettings().height);

    this.videoEl = document.createElement('video');

    // document.body.appendChild(this.videoEl);

    this.videoEl.hidden = true;
    this.videoEl.srcObject = mediaStream;
    this.videoEl.autoplay = true;
    this.videoEl.playsInline = true;

    this.videoEl.setAttribute("muted", "muted");

    this.videoEl.play();
    this.initialized = true;
  }

  playVideo() {
    if (this.videoEl)
      this.videoEl.play();
  }
}

export default Camera;