//virtual camera
//move the mouse around
//the sprite follows the mouse but appears at the center of the sketch
//because the camera is following it

var actor;
var bg;
var frame;
//the scene is twice the size of the canvas
var SCENE_W = 800;
var SCENE_H = 400;

var context;

let errorSound;
let track1;
let track2;
let track3;
let track4;

var tracks;
var numTracks;

var unCoveredTracks = [];

function preload() {
  soundFormats('mp3', 'ogg','wav');
  errorSound = loadSound('assets/error.wav');
  track1 = loadSound('assets/track1.mp3');
  track2 = loadSound('assets/track2.mp3');
  track3 = loadSound('assets/track3.mp3');
  track4 = loadSound('assets/track4.mp3');

  tracks = [track1,track2,track3,track4];
  numTracks = tracks.length;

}




function setup() {
  ///for sounds: create audio context

  // getAudioContext().suspend();


  createCanvas(800, 400);

  //create a sprite and add the 3 animations
  actor = createSprite(400, 200, 32, 32);

  var myAnimation = actor.addAnimation('floating', 'assets/stickman_walk_4.png');
  myAnimation.offY = 0;

  actor.addAnimation('moving','assets/stickman_walk_1.png', 'assets/stickman_walk_4.png');

  bg = new Group();

  let numClods = 8;
  specialClods = Array.from({length: 4}, () => Math.floor(Math.random() * numClods));
  console.log("special clods: "+str(specialClods))

  //create some background for visual reference
  for(var i=0; i<numClods; i++)
  {
    //create a sprite and add the 3 animations
    var rock = createSprite(random(0, width), random(0, height));
    //cycles through rocks 0 1 2
    rock.addAnimation('normal', 'assets/dirtclod.png');
    if (specialClods.includes(i)){
      console.log("adding track "+str(specialClods.indexOf(i))+" to clod "+str(i))
      rock.trackIndex=specialClods.indexOf(i);
      
    }
    rock.clodNumber = i;
    bg.add(rock);
  }

  //frame = loadImage('assets/frame.png');
}


function draw() {

  background(123, 63, 0);


  //mouse trailer, the speed is inversely proportional to the mouse distance
  actor.velocity.x = (camera.mouseX-actor.position.x)/60;
  actor.velocity.y = (camera.mouseY-actor.position.y)/60;

  movethresh = .1;

  if(abs(actor.velocity.x)<movethresh){
    actor.velocity.x=0
  }
  if(abs(actor.velocity.y)<movethresh){
    actor.velocity.y=0
  }

  if((abs(actor.velocity.x)<movethresh)&&(abs(actor.velocity.y)<movethresh)){
    actor.changeAnimation('floating');
    //console.log('floating')
    //flip horizontally
  }
  else{
    actor.changeAnimation('moving');
    //console.log('moving')
    //console.log(actor.velocity.x,actor.velocity.y)
  }
  camera.zoom=3;

  if(mouseIsPressed){
    // if (!actor.overlap(bg,processAudio)){errorSound.play();}
    stop();
    actor.overlap(bg,processAudio)
  }

  //set the camera position to the actor position
  camera.position.x = actor.position.x;
  camera.position.y = actor.position.y;

  //limit the actor movements
  if(actor.position.x < 0)
    actor.position.x = 0;
  if(actor.position.y < 0)
    actor.position.y = 0;
  if(actor.position.x > SCENE_W)
    actor.position.x = SCENE_W;
  if(actor.position.y > SCENE_H)
    actor.position.y = SCENE_H;

  //draw the scene
  //rocks first
  drawSprites(bg);

  //shadow using p5 drawing
  noStroke();
  if(actor.overlap(bg,checkClodNumber)){
      fill(0,255,0,100);
  }
  else{
    fill(200, 200, 0, 80);
  }
  
  //shadow
  ellipse(actor.position.x, actor.position.y+16, 32, 10);
  //character on the top
  drawSprite(actor);  
  
  
}

function checkClodNumber(sprite1,sprite2){
  console.log(sprite2.clodNumber)
}

function processAudio(sprite1,sprite2){
  //first stop all sounds
  for(let k =0;k<numTracks;k++){
    tracks[k].stop();
  }
  errorSound.stop();

  if(sprite2.trackIndex>0){
    if (!unCoveredTracks.includes(sprite2.trackIndex)){
      unCoveredTracks.push(sprite2.trackIndex);
    }
    for(let k=0;k<unCoveredTracks.length;k++){
      tracks[unCoveredTracks[k]].play();
    }
    // tracks[sprite2.trackIndex].play();
  }
  else{
    errorSound.play();
  }

}
  //Combine two audio .wav buffers and assign to audio control and play it.
  function combineWavsBuffers(buffer1, buffer2) {
          
          //Combine array bytes of original wavs buffers
          var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
          tmp.set( new Uint8Array(buffer1), 0 );
          tmp.set( new Uint8Array(buffer2), buffer1.byteLength );

          //Get buffer1 audio data to create the new combined wav
          var audioData = getAudioData.WavHeader.readHeader(new DataView(buffer1));
          console.log('Audio Data: ', audioData); 


          //Send combined buffer and send audio data to create the audio data of combined 
          var arrBytesFinal = getWavBytes( tmp, {
            isFloat: false,       // floating point or 16-bit integer
            numChannels: audioData.channels,
            sampleRate: audioData.sampleRate,
          })              
              
          //Create a Blob as Base64 Raw data with audio/wav type
          var myBlob = new Blob( [arrBytesFinal] , { type : 'audio/wav; codecs=MS_PCM' });
          var combineBase64Wav;
          var readerBlob = new FileReader();
          readerBlob.addEventListener("loadend", function() {
              combineBase64Wav = readerBlob.result.toString();
              //Assign to audiocontrol to play the new combined wav.
              var audioControl = document.getElementById('audio');
              audioControl.src = combineBase64Wav;
              audioControl.play();              
          });
          readerBlob.readAsDataURL(myBlob);

          console.log( "Buffer1 Size: "  + buffer1.byteLength );
          console.log( "Buffer2 Size: "  + buffer1.byteLength );
          console.log( "Combined Size: " + arrBytesFinal.byteLength );
          
          return combineBase64Wav;

  }
        
            
        
        //Other functions //////////////////////////////////////////////////////////////
         
        // Returns Uint8Array of WAV bytes
        function getWavBytes(buffer, options) {
          const type = options.isFloat ? Float32Array : Uint16Array
          const numFrames = buffer.byteLength / type.BYTES_PER_ELEMENT
        
          const headerBytes = getWavHeader(Object.assign({}, options, { numFrames }))
          const wavBytes = new Uint8Array(headerBytes.length + buffer.byteLength);
        
          // prepend header, then add pcmBytes
          wavBytes.set(headerBytes, 0)
          wavBytes.set(new Uint8Array(buffer), headerBytes.length)
        
          return wavBytes
        }
        
        // adapted from https://gist.github.com/also/900023
        // returns Uint8Array of WAV header bytes
        function getWavHeader(options) {
          const numFrames =      options.numFrames
          const numChannels =    options.numChannels || 2
          const sampleRate =     options.sampleRate || 44100
          const bytesPerSample = options.isFloat? 4 : 2
          const format =         options.isFloat? 3 : 1
        
          const blockAlign = numChannels * bytesPerSample
          const byteRate = sampleRate * blockAlign
          const dataSize = numFrames * blockAlign
        
          const buffer = new ArrayBuffer(44)
          const dv = new DataView(buffer)
        
          let p = 0
        
          function writeString(s) {
            for (let i = 0; i < s.length; i++) {
              dv.setUint8(p + i, s.charCodeAt(i))
            }
            p += s.length
          }
        
          function writeUint32(d) {
            dv.setUint32(p, d, true)
            p += 4
          }
        
          function writeUint16(d) {
            dv.setUint16(p, d, true)
            p += 2
          }
        
          writeString('RIFF')              // ChunkID
          writeUint32(dataSize + 36)       // ChunkSize
          writeString('WAVE')              // Format
          writeString('fmt ')              // Subchunk1ID
          writeUint32(16)                  // Subchunk1Size
          writeUint16(format)              // AudioFormat
          writeUint16(numChannels)         // NumChannels
          writeUint32(sampleRate)          // SampleRate
          writeUint32(byteRate)            // ByteRate
          writeUint16(blockAlign)          // BlockAlign
          writeUint16(bytesPerSample * 8)  // BitsPerSample
          writeString('data')              // Subchunk2ID
          writeUint32(dataSize)            // Subchunk2Size
        
          return new Uint8Array(buffer)
        }


        function getAudioData(){
    
        
            function WavHeader() {
                this.dataOffset = 0;
                this.dataLen = 0;
                this.channels = 0;
                this.sampleRate = 0;
            }
            
            function fourccToInt(fourcc) {
                return fourcc.charCodeAt(0) << 24 | fourcc.charCodeAt(1) << 16 | fourcc.charCodeAt(2) << 8 | fourcc.charCodeAt(3);
            }
            
            WavHeader.RIFF = fourccToInt("RIFF");
            WavHeader.WAVE = fourccToInt("WAVE");
            WavHeader.fmt_ = fourccToInt("fmt ");
            WavHeader.data = fourccToInt("data");
            
            WavHeader.readHeader = function (dataView) {
                var w = new WavHeader();
            
                var header = dataView.getUint32(0, false);
                if (WavHeader.RIFF != header) {
                    return;
                }
                var fileLen = dataView.getUint32(4, true);
                if (WavHeader.WAVE != dataView.getUint32(8, false)) {
                    return;
                }
                if (WavHeader.fmt_ != dataView.getUint32(12, false)) {
                    return;
                }
                var fmtLen = dataView.getUint32(16, true);
                var pos = 16 + 4;
                switch (fmtLen) {
                    case 16:
                    case 18:
                        w.channels = dataView.getUint16(pos + 2, true);
                        w.sampleRate = dataView.getUint32(pos + 4, true);
                        break;
                    default:
                        throw 'extended fmt chunk not implemented';
                }
                pos += fmtLen;
                var data = WavHeader.data;
                var len = 0;
                while (data != header) {
                    header = dataView.getUint32(pos, false);
                    len = dataView.getUint32(pos + 4, true);
                    if (data == header) {
                        break;
                    }
                    pos += (len + 8);
                }
                w.dataLen = len;
                w.dataOffset = pos + 8;
                return w;
            };
        
            getAudioData.WavHeader = WavHeader;
        
        }
        

