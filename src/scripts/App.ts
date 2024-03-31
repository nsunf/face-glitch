import CameraCanvas from './CameraCanvas';
import ParticlesCanvas from './ParticlesCanvas';
import FaceManager from './FaceManager';
import { Face } from '@tensorflow-models/face-detection';

// import imgSrc from '../images/portrait.jpg';
// import imgSrc from '../images/portrait2.jpg';
import imgSrc from '../images/face1_1080.jpeg';
// import imgSrc from '../images/face2.jpeg';

class App {
  private lastTimeStamp = 0;
  private frameTimer = 0;
  private frameRate = 60;

  private loadingEl: HTMLDivElement|null;
  private blindEl: HTMLDivElement|null;
  private faceManagers: FaceManager[] = [];

  private cameraCanvas: CameraCanvas; 
  private particlesCanvas: ParticlesCanvas;

  constructor() {
    this.loadingEl = document.querySelector('.loading');
    this.blindEl = document.querySelector('.blind');

    while (this.faceManagers.length !== 5) {
      this.faceManagers.push(new FaceManager());
    }

    this.cameraCanvas = new CameraCanvas();
    this.particlesCanvas = new ParticlesCanvas();
  }

  toggleBlind(on: boolean) {
    if (this.blindEl) {
      this.blindEl.style.background = `rgba(0, 0, 0, ${on ? 0.9 : 0})`; 
    }
  }

  async init() {
    if (!this.loadingEl) return;
    this.loadingEl.style.display = 'flex';

    await this.cameraCanvas.setCamera();
  }

  async render() {
    this.cameraCanvas.playVideo();
    // this.cameraCanvas.drawImage(imgSrc)
    let faces = await this.cameraCanvas.detectFace();
    
    this.setFaceManager(faces);

    // console.log('인식된 얼굴 개수 : ' + this.faceManagers.filter(manager => manager.face).length)

    // this.cameraCanvas.toggleBlur(faces.length === 0);
    this.toggleBlind(faces.length === 0);

    this.particlesCanvas.clear();

    this.faceManagers.forEach((manager, i) => {
      // manager.drawFaceTracker(this.particlesCanvas.ctx, manager.id);
      manager.draw(this.cameraCanvas.ctx, this.particlesCanvas.ctx);
    })

    const text1Div: HTMLDivElement|null = document.querySelector('.text--1');
    const text2Div: HTMLDivElement|null = document.querySelector('.text--2');
    if (text1Div && text2Div && this.blindEl) {
      let on = this.faceManagers.filter(manager => manager.face).length > 0;
      text1Div.style.transition = on ? 'opacity 2s 3500ms' : 'opacity 2s'; 
      text1Div.style.opacity = on ? '0' : '1'; 
      text2Div.style.animation = on ? '6s linear 5500ms textFadeIn': 'unset';
      this.blindEl.style.transition = on ? '10s 2s' : '10s';
    }
  }

  async animate(timeStamp = 0) {
    let deltaTime = timeStamp - this.lastTimeStamp;
    if (this.frameTimer > 1000/this.frameRate) {
      await this.render();
      this.frameTimer = 0;
    } else {
      this.frameTimer += deltaTime;
    }
    this.lastTimeStamp = timeStamp;
    requestAnimationFrame(async timeStamp => {await this.animate(timeStamp)});
  }

  setFaceManager(faces: Face[]) {
    if (faces.length === 0) this.faceManagers.forEach(manager => manager.reset());

    let preFaces = this.faceManagers.filter(manager => manager.face);
    let numOfNewFaces = faces.length;
    let numOfPreFaces = preFaces.length;
    if (numOfPreFaces === 0) {
      // 새로운 얼굴 탐지
      this.faceManagers.forEach((manager, i) => {
        if (i === numOfNewFaces) return;
        manager.setFace(faces[i]);
      })
    } else if (numOfNewFaces < numOfPreFaces) {
      // 얼굴 개수 줄어듦
      let usedManagerID: number[] = [];
      faces.forEach(face => {
        let nearestManager: FaceManager|undefined;
        let nearestDist = 10000;
        preFaces.forEach((manager, i) => {
          let dist = manager.getFaceOffset(face);
          if (nearestDist > dist) {
            nearestDist = dist;
            nearestManager = manager;
           usedManagerID.push(manager.id);
          }
        })
        nearestManager?.setFace(face);
      })
      preFaces.forEach(manager => {
        if (!usedManagerID.includes(manager.id)) manager.reset();
      })
    } else {
      // 얼굴 개수 추가
      let usedFaceIdx: number[] = [];
      preFaces.forEach(manager => {
        let nearestFace: Face|undefined;
        let nearestDist = 10000;
        faces.forEach((face, i) => {
          let dist = manager.getFaceOffset(face);
          if (nearestDist > dist) {
            nearestFace = face;
            nearestDist = dist;
            usedFaceIdx.push(i);
          }
        })
        if (nearestFace) manager.setFace(nearestFace);
      })
      let emptyManagers = this.faceManagers.filter(manager => manager.face === undefined);
      let idx = 0;
      faces.forEach((face, i) => {
        if (!usedFaceIdx.includes(i)) {
          emptyManagers[idx].setFace(face);
          idx++;
        }
      })
    }
    
/*
    // 이전 얼굴과 새로운 얼굴의 개수가 다를 때
    if (faces.length !== lastLengthOfFaces) {
      console.log('얼굴 얼굴과 새로운 얼굴의 개수가 다를 때');
      // 이전 얼굴 개수가 0 일때
      if (lastLengthOfFaces === 0) {
        console.log('이전 얼굴 개수가 0');
        faces.forEach((face, i) => {
          this.faceManagers[i].face = face;
        })
      } else if (lastLengthOfFaces > faces.length) {
      // 이전 얼굴의 개수가 많고 새로운 얼굴의 개수가 적을 때
        console.log('이전 얼굴의 개수가 많고 새로운 얼굴의 개수가 적을 때');

        let usedManagerID: number[] = [];

        faces.forEach(face => {
          let idx = 0;
          let leastOffset = 10000;
          this.faceManagers.filter(manager => manager.face).forEach(manager => {
            let offset = manager.getFaceOffset(face);
            if (leastOffset > offset) {
              idx = this.faceManagers.findIndex(_manager => _manager.id === manager.id);
              leastOffset = offset;
              usedManagerID.push(manager.id);
            }
          })
          this.faceManagers[idx].setFace(face);
        })
        this.faceManagers
          .filter(manager => manager.face && !usedManagerID.includes(manager.id))
          .forEach(manager => manager.reset());
      } else if (lastLengthOfFaces < faces.length) {
        // 이전 얼굴의 개수가 적고 새로운 얼굴의 개수가 많을 때
        console.log('이전 얼굴의 개수가 적고 새로운 얼굴의 개수가 많을 때');
        this.faceManagers.sort(manager => manager.face ? -1 : 1);

        let numOfFaces = faces.length;
        this.faceManagers.forEach((manager, i) => {
          if (numOfFaces <= 0) return;
          if (manager.face) {
            let idx = 0;
            let leastOffset = 10000;
            faces.forEach((face, i) => {
              let offset = manager.getFaceOffset(face);
              if (leastOffset > offset) {
                leastOffset = offset;
                idx = i;
              }
            })
            this.faceManagers[i].setFace(faces[idx]);
          } else {
            this.faceManagers[i].setFace(faces[faces.length - numOfFaces]);
          }
          numOfFaces--;
        })
      }
    } else {
    // 이전 얼굴과 새로운 얼굴의 개수가 같을 때
      console.log('이전 얼굴과 새로운 얼굴의 개수가 같을 때');
      faces.forEach(face => {
        let id = 0;
        let leastOffset = 10000;
        this.faceManagers.filter(manager => manager.face).forEach(manager => {
          let offset = manager.getFaceOffset(face);
          if (offset < leastOffset) {
            leastOffset = offset;
            id = manager.id;
          }
        })
        let idx = this.faceManagers.findIndex(manager => manager.id === id);
        this.faceManagers[idx].setFace(face);
      })
    }
    */
   
  }

  async launch() {
    await this.init();
    this.cameraCanvas.setVideoOnloadedData(async () => {
      await this.cameraCanvas.faceDetector.setDetector();
      if (this.loadingEl) this.loadingEl.style.display = 'none';
      this.animate();
    })
  }
}

export default App;