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

var gameStart = false;

var tracks;
var numTracks;

var unCoveredTracks = [];

var elapsedTime = 0;
var oldTime = 0;

var uniqueRelease = false;
var oldHold = false;
var holdNow = false;

function preload() {
  soundFormats('mp3');
  console.log("loading sounds")
  errorSound = loadSound('assets/error.mp3');
  track1 = loadSound('assets/track1.mp3');
  track2 = loadSound('assets/track2.mp3');
  track3 = loadSound('assets/track3.mp3');
  track4 = loadSound('assets/track4.mp3');
  console.log("sounds loaded")

}

// function setup() {
//   createCanvas(400, 400);
// }


function setup() {
  ///for sounds: create audio context

  // getAudioContext().suspend();
  tracks = [track1,track2,track3,track4];
  numTracks = tracks.length;


  var canvas = createCanvas(800, 400);
  canvas.parent("sketch-holder");
  //create a sprite and add the 3 animations
  actor = createSprite(400, 200, 32, 32);

  // ben_sheet = loadSpriteSheet('assets/Ben_Dig.png', 40, 40, 3);
  // ben_walk_animation = loadAnimation(ben_sheet);
  // ben_dig_animation = loadAnimation(ben_sheet);

  var stand = actor.addAnimation('floating','assets/Ben_Stand.png');
  stand.offY = 0;

  move = actor.addAnimation('moving','assets/Ben_stand.png','assets/Ben_Walk_1.png','assets/Ben_Walk_2.png','assets/Ben_Walk_3.png','assets/Ben_Walk_4.png','assets/Ben_Walk_5.png');
  dig = actor.addAnimation('digging','assets/Ben_Stand.png','assets/Ben_Dig_1.png','assets/Ben_Dig_2.png','assets/Ben_Dig_3.png','assets/Ben_Stand.png');
  dig.life = 30;
  dig.looping = true;
  dig.frameDelay = 8;
  bg = new Group();

  let numClods = 8;
  // specialClods = Array.from({length: 4}, () => Math.floor(Math.random() * numClods));

  var specialClods = [1, 7,2,4];
  // while(specialClods.length < numClods){
  //     var r = Math.floor(Math.random() * 5);
  //     if((specialClods.indexOf(r) === -1)&& (r<5)) specialClods.push(r);
  // }

  console.log("special clods: "+str(specialClods))

  //create some background for visual reference
  for(var i=0; i<numClods; i++)
  {
    //create a sprite and add the 3 animations
    var rock = createSprite(random(100, width-100), random(100, height-100));
    //cycles through rocks 0 1 2
    rock.addAnimation('normal', 'assets/dirtclod.png');
    if (specialClods.includes(i)){
      console.log("adding track "+str(specialClods.indexOf(i))+" to clod "+str(i))
      rock.trackIndex=specialClods.indexOf(i);
      
    }
    else{
      rock.trackIndex=-1;
    }
    rock.clodNumber = i;
    bg.add(rock);
  }

  //frame = loadImage('assets/frame.png');
  oldTime = millis();
}

// function draw() {
//   background(220);
// }


function draw() {
  holdNow = mouseIsPressed;
  uniqueRelease = !holdNow&&oldHold;
  oldHold = holdNow;


  if(unCoveredTracks.length<4){
    elapsedTime = (millis()-oldTime)/1000.0
  }

  background(123, 63, 0);
  

  //mouse trailer, the speed is inversely proportional to the mouse distance
  if(holdNow){
    actor.velocity.x = (camera.mouseX-actor.position.x)/60;
    actor.velocity.y = (camera.mouseY-actor.position.y)/60;
  }
  else{
    actor.velocity.x = 0;
    actor.velocity.y = 0;
  }

  movethresh = .1;

  if(abs(actor.velocity.x)<movethresh){
    actor.velocity.x=0
  }
  if(abs(actor.velocity.y)<movethresh){
    actor.velocity.y=0
  }

  if(uniqueRelease){
    console.log(uniqueRelease)
    actor.changeAnimation('digging')
    dig.rewind();
    dig.play();
    // if (!actor.overlap(bg,processAudio)){errorSound.play();}
    stop();
    actor.overlap(bg,processAudio)
  }

  else if(holdNow&&(abs(actor.velocity.x)<movethresh)&&(abs(actor.velocity.y)<movethresh)){
    actor.changeAnimation('floating');
    //console.log('floating')
    //flip horizontally
  }
  else if(holdNow){
    actor.changeAnimation('moving');
    //console.log('moving')
    //console.log(actor.velocity.x,actor.velocity.y)
  }
  else{
    //console.log("dig: "+str(dig.getFrame()))
    if((dig.getFrame()==4)){
      dig.stop();
      actor.changeAnimation('floating')
      //console.log("time to float")
    }
  }
  camera.zoom=2;


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
      fill(100,100,0,100);
  }
  else{
    fill(200, 200, 0, 80);
  }
  
  //shadow
  ellipse(actor.position.x, actor.position.y+16, 20, 6);

  thickn = 20;
  lightrad = 300;

  for(let r = 0;r<width;r+=thickn){
    let adjustBrightness = map(r, 0, lightrad, 0, 255);
    noFill();
    stroke(color(0,0,0,adjustBrightness));
    strokeWeight(thickn);
    ellipse(actor.position.x,actor.position.y,r,r);
  }

  // var dt = .2;
  // var R =20;
  // lightrad = 200;


  // for(let r=0;r<width/3;r+=R){

  //   let adjustBrightness = map(r, 0, lightrad, 0, 255);
  //   for(t = 0;t<2*3.14;t+=dt){
  //     noStroke();
  //     fill(color(0,0,0,adjustBrightness));
  //     ellipse(actor.position.x+r*cos(t),actor.position.y+r*sin(t),R+r*dt,R+r*dt);
  //   }
  // }


  //character on the top
  drawSprite(actor); 
  strokeWeight(1);
  fill(128);
  stroke(128); 
  textAlign(CENTER,CENTER)
  if(unCoveredTracks.length>=4){
    text("You found all the stems! time: "+elapsedTime.toFixed(2),actor.position.x,actor.position.y-75)
  }
  else{
    text('time: '+elapsedTime.toFixed(2),actor.position.x,actor.position.y-75)
  } 
  
  
}

function checkClodNumber(sprite1,sprite2){
  //console.log(sprite2.clodNumber)
}

function processAudio(sprite1,sprite2){
  //first stop all sounds
  for(let k =0;k<numTracks;k++){
    tracks[k].stop();
  }
  errorSound.stop();

  if(sprite2.trackIndex>=0){
    if (!unCoveredTracks.includes(sprite2.trackIndex)){
      unCoveredTracks.push(sprite2.trackIndex);
      console.log(unCoveredTracks)
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
  
