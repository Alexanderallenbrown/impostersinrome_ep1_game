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
  soundFormats('mp3');
  console.log("loading sounds")
  errorSound = loadSound('assets/error.mp3');
  track1 = loadSound('assets/track1.mp3');
  track2 = loadSound('assets/track2.mp3');
  track3 = loadSound('assets/track3.mp3');
  track4 = loadSound('assets/track4.mp3');
  console.log("sounds loaded")

}




function setup() {
  ///for sounds: create audio context

  // getAudioContext().suspend();
  tracks = [track1,track2,track3,track4];
  numTracks = tracks.length;


  createCanvas(800, 400);

  //create a sprite and add the 3 animations
  actor = createSprite(400, 200, 32, 32);

  var myAnimation = actor.addAnimation('floating', 'assets/stickman_walk_4.png');
  myAnimation.offY = 0;

  actor.addAnimation('moving','assets/stickman_walk_1.png', 'assets/stickman_walk_4.png');

  bg = new Group();

  let numClods = 8;
  // specialClods = Array.from({length: 4}, () => Math.floor(Math.random() * numClods));

  var specialClods = [];
  while(specialClods.length < numClods){
      var r = Math.floor(Math.random() * 5);
      if((specialClods.indexOf(r) === -1)&& (r<5)) specialClods.push(r);
  }

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
  camera.zoom=2;

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
  //console.log(sprite2.clodNumber)
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
  
