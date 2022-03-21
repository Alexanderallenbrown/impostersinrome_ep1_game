var actor;
var ben;
var alex;
var bg;
var frame;
var rocco;

//global variables for animations of ACTOR
let moveBen,digBen,standBen
let moveAlex,digAlex,standAlex
var framenum=0;

//the scene is twice the size of the canvas
var SCENE_W = 800;
var SCENE_H = 400;

var context;

let errorSound;
let track1;
let track2;
let track3;
let track4;

let alexButton,benButton;

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
  errorSound = loadSound('assets/sounds/error.mp3');
  track1 = loadSound('assets/sounds/WIF/track1.mp3');
  track2 = loadSound('assets/sounds/WIF/track2.mp3');
  track3 = loadSound('assets/sounds/WIF/track3.mp3');
  track4 = loadSound('assets/sounds/WIF/track4.mp3');

  roccosound = loadSound('assets/sounds/dog_bark.wav');
  console.log("sounds loaded")

}

// function setup() {
//   createCanvas(400, 400);
// }


function setup() {

  var canvas = createCanvas(SCENE_W, SCENE_H);
  canvas.parent("sketch-holder");
  ///for sounds: create audio context

  // getAudioContext().suspend();
  tracks = [track1,track2,track3,track4];
  numTracks = tracks.length;

  //create Ben's pre-game
  ben = createSprite(SCENE_W*.2,SCENE_H/2,32,32);
  benwave =  loadSpriteSheet('assets/Ben/ben_Wave.png',128,128,8);
  ben.wave = ben.addAnimation('normal',benwave);
  ben.wave.looping = true;
  ben.wave.frameDelay = 8;

  //create Ben's pre-game
  alex = createSprite(SCENE_W*.8,SCENE_H/2,32,32);
  alexwave =  loadSpriteSheet('assets/Alex/alex_Wave.png',160,160,11);
  alex.wave = alex.addAnimation('normal',alexwave);
  alex.wave.looping = true;
  alex.wave.frameDelay = 8;

  moveBen = loadSpriteSheet('assets/Ben/ben_Walk.png',40,40,6);
  moveAlex = loadSpriteSheet('assets/Alex/alex_Walk.png',40,40,7);

  digBen = loadSpriteSheet('assets/Ben/ben_Dig.png',40,40,5);
  digBen.life = 30;
  digBen.looping = true;
  digBen.frameDelay = 8;

  digAlex = loadSpriteSheet('assets/Alex/alex_Dig.png',40,40,5);
  digAlex.life = 30;
  digAlex.looping = true;
  digAlex.frameDelay = 8;

  standAlex = loadSpriteSheet('assets/Alex/alex_Stand.png',40,40,1);
  standBen = loadSpriteSheet('assets/Ben/Ben_Stand.png',40,40,1)

  ///create the actor sprite
  //create a sprite and add the 3 animations
  actor = createSprite(400, 200, 32, 32);
  actorfeet = createSprite(400,200,32,4);//create 'feet'

  ben.onMousePressed = function(){
  stand = actor.addAnimation('floating',standBen);
  move = actor.addAnimation('moving',moveBen);
  dig = actor.addAnimation('digging',digBen);
  dig.life = 30;
  dig.looping = true;
  dig.frameDelay = 8;
  gameStart = true;
  ben.remove();
  alex.remove();
}

alex.onMousePressed = function(){
  stand = actor.addAnimation('floating',standAlex);
  move = actor.addAnimation('moving',moveAlex);
  dig = actor.addAnimation('digging',digAlex)
  dig.life = 30;
  dig.looping = true;
  dig.frameDelay = 8;
  gameStart = true;
  alex.remove();
  ben.remove();
}


  //Rocco
  rocco = createSprite(random(100,SCENE_W-100),random(100,SCENE_H-100),32,32)
  roccoanim = loadSpriteSheet('assets/Dirt/Rocco.png',32,32,3)
  rocco.roccoanim = rocco.addAnimation('normal',roccoanim)
  rocco.roccoanim.frameDelay=15;


  ////group for the dirt clods
  bg = new Group();

  let numClods = 8;
  // specialClods = Array.from({length: 4}, () => Math.floor(Math.random() * numClods));

  var specialClods = [1, 7,2,4];
  // while(specialClods.length < numClods){
  //     var r = Math.floor(Math.random() * 5);
  //     if((specialClods.indexOf(r) === -1)&& (r<5)) specialClods.push(r);
  // }

  console.log("special clods: "+str(specialClods))

  //dirt flying
  dirtanim = loadSpriteSheet('assets/Dirt/dirtclod_ellipse.png',32,32,6);
  dirtanim.looping=false;

  //create some background for visual reference
  for(var i=0; i<numClods; i++)
  {
    //create a sprite and add the 3 animations
    var rock = createSprite(random(100, width-100), random(100, height-100));
    //cycles through rocks 0 1 2
    rock.addAnimation('normal', 'assets/Dirt/dirtclod_ellipse_static.png');
    rock.dirtdig = rock.addAnimation('digging',dirtanim)
    rock.dirtdig.looping = false;


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

  flowerg = new Group();
  floweranim = loadSpriteSheet('assets/Dirt/Flowers.png',32,32,2)
  //create some background for visual reference
  for(var i=0; i<2*numClods; i++)
  {
    //create a sprite and add the 3 animations
    var flower = createSprite(random(100, width-100), random(100, height-100));
    floweranim.frameDelay=32
    //cycles through rocks 0 1 2
    flower.flowerwave = flower.addAnimation('normal',floweranim);
    flower.flowerwave.frameDelay=30
    flowerg.add(flower);
  }

  //frame = loadImage('assets/frame.png');
  oldTime = millis();
}



function draw() {
  

  if(gameStart){
    doGameStarted();
  }
  else{
    doCharacterSelect();
  }
  
}


function doCharacterSelect(){
  background(0,0,0);
  textSize(32);
  fill(255,255,255);
  textAlign(CENTER,CENTER);
  text("Choose Your Fighter",0.5*SCENE_W,0.1*SCENE_H);

  textSize(18);
  text("Ben",ben.position.x,ben.position.y+18+64);
  text("Alex",alex.position.x,alex.position.y+18+64);

  drawSprite(ben);
  drawSprite(alex);

  text("You may need to play in Chrome to hear sound",SCENE_W/2,.9*SCENE_H)
}




function doGameStarted(){

  holdNow = mouseIsPressed;
  uniqueRelease = (framenum>10)&&!holdNow&&oldHold;
  oldHold = holdNow;
  framenum++;

  if(unCoveredTracks.length<4){
    elapsedTime = (millis()-oldTime)/1000.0
  }

  background(123, 63, 0);
  

  //mouse trailer, the speed is inversely proportional to the mouse distance
  if(holdNow&&framenum>10){
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


  //move actor feet with actor
  actorfeet.position.x=actor.position.x;
  actorfeet.position.y=actor.position.y+28;

  if(uniqueRelease){
    console.log(uniqueRelease)
    actor.changeAnimation('digging')
    dig.rewind();
    dig.play();
    // if (!actor.overlap(bg,processAudio)){errorSound.play();}
    stop();
    actorfeet.overlap(bg,processAudio)
    console.log("rocco: "+str(actor.overlap(rocco)))

    if(actor.overlap(rocco)){
      roccosound.play();
      console.log("playing bark")
    }
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

  if (framenum<10){
    actor.changeAnimation('floating);')
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
  drawSprites(flowerg);
  // drawSprites(cactusg);

  //shadow using p5 drawing
  noStroke();
  if(actorfeet.overlap(bg,checkClodNumber)){
      fill(100,100,0,100);
  }
  else{
    fill(200, 200, 0, 80);
  }

  //draw rocco!
  drawSprite(rocco);
  
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
  sprite2.changeAnimation('digging')
  sprite2.dirtdig.rewind();
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
  
