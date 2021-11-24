const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

 renderer.setClearColor(0xe8a295,1);
//global variables
const start_position= 3
const end_position= -start_position
const text= document.querySelector(".text")
const Time_limit=10
let gameStat = "loading"
let isLookingBack=true
 function createCube(size,positionX,rotationY=0,color=0x4c9c2d){
    const geometry = new THREE.BoxGeometry(size.w,size.h,size.d );
    const material = new THREE.MeshBasicMaterial( {color: color} );
    const cube = new THREE.Mesh( geometry, material );

    scene.add( cube );
    cube.position.x=positionX;
    cube.rotation.y=rotationY;
    return cube;
   
 }
const light = new THREE.AmbientLight( 0xffffff ); 
scene.add( light )

camera.position.z = 5;

const loader= new THREE.GLTFLoader()


function delay(ms){
   return new Promise(resolve => setTimeout(resolve,ms));
}
class Doll{
    constructor(){
        loader.load("../models/scene.gltf", (gltf) => {
            scene.add( gltf.scene);
            gltf.scene.scale.set(0.4,.4,.4,.4);
            gltf.scene.position.set(0,-1,0);
            this.doll=gltf.scene
        })

    }
    lookBack(){
        gsap.to(this.doll.rotation,{y:-3.15,duration:.45})
        setTimeout(()=> isLookingBack= true , 150)
    }
    lookForward(){
       gsap.to(this.doll.rotation,{y:0,duration:.45})
       setTimeout(()=> isLookingBack= false , 450)


    }
    async start(){
       this.lookBack()
       await delay((Math.random()* 1000)+1000)
       this.lookForward()
       await delay((Math.random()* 750)+750)
       this.start()
   }
}

function createTrack(){
    createCube({w: start_position*2+.2 , h: 1.5, d: 1},0,0,0x244a15).position.z=-1;

   createCube({w: .2 , h: 1.5, d: 1},start_position,-.35)
   createCube({w: .2 , h: 1.5, d: 1},end_position,.35)


}
createTrack();

class Player{
    constructor(){
        const geometry = new THREE.SphereGeometry( .2, 32, 16 );
        const material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
        const sphere = new THREE.Mesh( geometry, material );
        sphere.position.z=1;
        sphere.position.x=start_position;
        scene.add( sphere );
        this.player=sphere
        this.playerInfo={
            positionX:start_position,
            velocity:0
        }
    }
    run(){
     this.playerInfo.velocity=.03;
    }
    stop(){
        gsap.to(this.playerInfo,{velocity:0,duration:.1,ease:"none"})
    }
    check(){
       if(this.playerInfo.velocity>0 && !isLookingBack){
       
           gameStat="over";
           text.innerText="You Lose"

       }
       if(this.playerInfo.positionX<end_position+ .4){
       
        gameStat="win"
        text.innerText="You Win"

    }
    }
    update(){
        this.check()
        this.playerInfo.positionX -= this.playerInfo.velocity
        this.player.position.x=this.playerInfo.positionX
    }
    
}
let doll=new Doll()
const player=new Player()

async function init(){
    await delay(500)
    text.innerText="Starting in 3"
    await delay(500)
    text.innerText="Starting in 2"
    await delay(500)
    text.innerText="Starting in 1"
    await delay(500)
    text.innerText="Go🎯"
    startGame()

}
function startGame(){
    gameStat="started"
    let progressBar=createCube({w:8,h:.1,d:1},0)
    progressBar.position.y=3.35
    gsap.to(progressBar.scale,{x:0,duration:Time_limit})
    doll.start()
    setTimeout(()=> {
if(gameStat!="over"){
    text.innerText="You Ran out of time"
    gameStat="over"
}
    },Time_limit * 1000);
}
init()

setTimeout(()=>{
        doll.start()
},1000);

function animate() {
    if(gameStat== "over") return
      renderer.render( scene, camera );
      requestAnimationFrame( animate );
      player.update()

}

animate();
window.addEventListener('resize',onWindowResize, false);
function onWindowResize(){
    camera.aspect=window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );

}

window.addEventListener('keydown',(e)=>{
    if(gameStat != "started") return
    if(e.key=="ArrowUp"){
        player.run()
    }
})
window.addEventListener('keyup',(e)=>{
    if(e.key=="ArrowUp"){
        player.stop()
    }
})