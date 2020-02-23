window.Tomato = window.classes.Tomato =
class Tomato extends Shape {
  constructor() {
    super("positions", "normals", "texture_coords");
    Capped_Cylinder.insert_transformed_copy_into(this, [30,30],
      Mat4.translation([0, 0, 0]).times(Mat4.scale([1, 1, 0.4])));
  }
};

window.Beef = window.classes.Beef =
class Beef extends Shape {
  constructor() {
    super("positions", "normals", "texture_coords");
    const meatPoints = Vec.cast( [0,0,.6], [1,0,.6], [1.2,0,.35], [1.2,0,.25], [1,0,0], [0,0,0]);
    Surface_Of_Revolution.insert_transformed_copy_into(this, [7,7, meatPoints],
      Mat4.translation([0, 0, 0]).times(Mat4.scale([1, 1, 1])));
  }
};

window.Cheese = window.classes.Cheese =
class Cheese extends Shape {
  constructor() {
    super("positions", "normals", "texture_coords");
    Cube.insert_transformed_copy_into(this, [],
      Mat4.translation([0, 0, 0]).times(Mat4.scale([1, 1, 0.05])));
  }
};

window.BunBase = window.classes.BunBase =
class BunBase extends Shape {
  constructor() {
    super("positions", "normals", "texture_coords");
    const baseBunPoints = Vec.cast([0, 0, .9], [.9, 0, .9], [1.2, 0, .75], [1.4, 0, .4], [1.5, 0, 0], [0, 0, 0]);
    Surface_Of_Revolution.insert_transformed_copy_into(this, [30, 30, baseBunPoints],
      Mat4.translation([0, 0, 0]).times(Mat4.scale([1, 1, 1])));
  }
};

window.BunTop = window.classes.BunTop =
class BunTop extends Shape {
  constructor() {
    super("positions", "normals", "texture_coords");
    Capped_Cylinder.insert_transformed_copy_into(this, [15,15],
      Mat4.translation([0, 0, 0]).times(Mat4.scale([1, 1, 0.4])));
  }
};

// Hitbox wireframe models.
// Reuse for rendering hitboxes of different objects by calling draw() with the same model transforms.
// Constructor takes a color and renders the hitbox with that color.
window.Hitbox_Outline = window.classes.Hitbox_Outline =
class Hitbox_Outline extends Shape {
  constructor(color) {
    super("positions", "colors"); // Name the values we'll define per each vertex.

    this.positions.push(...Vec.cast([1, -1, -1], [1, -1, 1], [1, -1, -1], [-1, -1, -1], [1, -1, -1], [1, 1, -1],
      [1, -1, 1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, -1, -1], [-1, -1, 1],
      [-1, -1, -1], [-1, 1, -1], [-1, -1, 1], [-1, 1, 1], [1, 1, -1], [1, 1, 1],
      [1, 1, -1], [-1, 1, -1], [1, 1, 1], [-1, 1, 1], [-1, 1, -1], [-1, 1, 1]));

    this.color = color;
    this.colors.push(...Vec.cast(...Array(24).fill(this.color)));
    this.indexed = false;       // Do this so we won't need to define "this.indices".
  }

  draw(graphics_state, transform, material) {
    super.draw(graphics_state, transform, material, "LINES");
  }
};


// Hitboxes for actual collision detection.
// Should be maintained as a class variable in each SpawnedObject.
// SpawnedObject's constructor should include the model used so it can be passed into constructor of Hitbox.)
window.Hitbox = window.classes.Hitbox =
class Hitbox {
  constructor(object)
  {
    // Get maximum x/y/z from object vertices
    this.maxX = 2 * Math.max(...object.positions.map(pos => pos[0]));
    this.minX = 2 * Math.min(...object.positions.map(pos => pos[0]));
    this.maxY = Math.max(...object.positions.map(pos => pos[1]));
    this.minY = Math.min(...object.positions.map(pos => pos[1]));
    this.maxZ = 2 * Math.max(...object.positions.map(pos => pos[2]));
    this.minZ = 2 * Math.min(...object.positions.map(pos => pos[2]));
  }
  updatePos(transform)
  {
    this.minX = Math.min(transform.times(Vec.of(-1,0,0,1)).to3()[0]);
    this.maxX = Math.max(transform.times(Vec.of(1,0,0,1)).to3()[0]);
    this.minY = Math.min(transform.times(Vec.of(0,-1,0,1)).to3()[1]);
    this.maxY = Math.max(transform.times(Vec.of(0,1,0,1)).to3()[1]);
    this.minZ = Math.min(transform.times(Vec.of(0,0,-1,1)).to3()[2]);
    this.maxZ = Math.max(transform.times(Vec.of(0,0,1,1)).to3()[2]);
  }

  logPos()
  {
    console.log("Min X = " + this.minX);
    console.log("Max X = " + this.maxX);
    console.log("Min Y = " + this.minY);
    console.log("Max Y = " + this.maxY);
    console.log("Min Z = " + this.minZ);
    console.log("Max Z = " + this.maxZ);
  }

  collides(target_box)
  {
    // Get maximum x/y/z from object
    return  (this.minX <= target_box.maxX && this.maxX >= target_box.minX) &&
      (this.minY <= target_box.maxY && this.maxY >= target_box.minY) &&
      (this.minZ <= target_box.maxZ && this.maxZ >= target_box.minZ);
  }
};

class SpawnedObject
{
    constructor( spawnPosition, object_model, color, isGood )
    {
        this.objectTransform = spawnPosition;
        this.lifetime = 40; //in seconds
        this.velocity = 0.001; //will break down into xyz transform
        this.model = object_model;
        this.color = color;
        this.hitbox = new Hitbox(object_model);
        this.isGood = isGood;  // true => then is a item that gives points: false => then destroys burger

        /*
        //generate random x,y,z target coordinate to shoot at
        let ranX = Math.floor(Math.random() );  
        let ranY = Math.floor(Math.random()  );  
        let ranZ = Math.ceil(Math.random() );  

        let magnitude = Math.pow(Math.pow(ranX - this.getPosX(),2) + Math.pow(ranY - this.getPosY(),2) + Math.pow(0 - this.getPosZ(),2),1/2);
        this.velocityX = (ranX-this.getPosX() / magnitude) * this.velocity;
        this.velocityY = (ranY-this.getPosY() / magnitude) * this.velocity;
        this.velocityZ = (ranZ-this.getPosZ() / magnitude) * this.velocity;
        */

        
        // USE FOR TESTING (SHOOTS AT ORIGIN)
        // (negate to shoot towards player)
        this.velocityX = -this.getPosX() * this.velocity;
        this.velocityY = (-this.getPosY()-30) * this.velocity;
        this.velocityZ = -this.getPosZ() * this.velocity;
        
    }

    //updates objectTransform by incremental velocity values of object
    move()
    {
        //this.objectTransform = this.objectTransform.times( Mat4.translation([ this.velocityX,this.velocityY,this.velocityZ ]) );
        this.objectTransform = Mat4.translation([ this.velocityX,this.velocityY,this.velocityZ ]).times(this.objectTransform);
        this.hitbox.updatePos(this.objectTransform);
        //this.hitbox.logPos();
    }

    getPosX()
    {
        return this.objectTransform[0][3];
    }

    getPosY()
    {
        return this.objectTransform[1][3];
    }

    getPosZ()
    {
        return this.objectTransform[2][3];
    }

}

class Burger
{
  constructor( spawnPosition, object_model )
  {
    this.burgerTransform = spawnPosition;
    this.hitbox = new Hitbox(object_model);
    this.burgerStack = [];

    this.velocityX = 0;
    this.velocityY = 0;
    this.velocityZ = 0;
  }

  //updates burgerTransform by incremental velocity values of object
  move()
  {
    this.burgerTransform = this.burgerTransform.times( Mat4.translation([ this.velocityX,this.velocityY,this.velocityZ ]) );
  }

  getPosX()
  {
      return this.burgerTransform[0][3];
  }

  getPosY()
  {
      return this.burgerTransform[1][3];
  }

  getPosZ()
  {
      return this.burgerTransform[2][3];
  }
}

window.Team_Burger_Builders_Game_Scene = window.classes.Team_Burger_Builders_Game_Scene =
class Team_Burger_Builders_Game_Scene extends Scene_Component
{
  constructor( context, control_box )     // The scene begins by requesting the camera, shapes, and materials it will need.
  { 
    super(   context, control_box );    // First, include a secondary Scene that provides movement controls:
    this.context = context;
    if( !context.globals.has_controls   )
      context.register_scene_component( new Movement_Controls( context, control_box.parentElement.insertCell() ) );

    const r = context.width/context.height;
    context.globals.graphics_state.camera_transform = Mat4.translation([ 5,-10,-30 ]);  // Locate the camera here (inverted matrix).
    context.globals.graphics_state.projection_transform = Mat4.perspective( Math.PI/4, r, .1, 1000 );
    
    const grillPoints = Vec.cast([0,0,2],[0.8,0,1.9],[1.1,0,1.7],[1.5,0,1.5],[1.8,0,1.4],[2,0,1.35],[1.8,0,1.2],[1.75,0,1],[1.65,0,0.6],[1.2,0,0.4],[0,0,0]);
    const birdPoopPoints = Vec.cast([0,0,1],[.1,0,.85],[.2,0,.71],[.31,0,.55],[.4,0,.4],[.25,0,.1],[0,0,0]);

    const row_operation   = (s,p)   => Vec.of(    -1,2*s-1,Math.random()/2 );
    const column_operation = (t,p,s) => Vec.of( 2*t-1,2*s-1,Math.random()/2 );          
                                                      // At the beginning of our program, load one of each of these shape

    const shapes = {  box: new Cube(),
                      square: new Square(),
                      burger: new Torus( 16, 16 ),
                      ingred_hitbox: new Hitbox_Outline(Color.of(0,1,0,1)), // Green for ingredients
                      burger_hitbox: new Hitbox_Outline(Color.of(0,0,1,1)), // Blue for burger
                      hazard_hitbox: new Hitbox_Outline(Color.of(1,0,0,1)),  // Red for stage hazards
                      lettuce: new Grid_Patch( 10, 10, row_operation, column_operation),
                      topBun: new BunTop(),
                      baseBun: new BunBase(),
                      beef: new Beef(),
                      tomato: new Tomato(),
                      cheese: new Cheese(),
                      bunBottom: new Regular_2D_Polygon(30,30),
                      treeTrunk: new Cylindrical_Tube(15,15),
                      treeLeaves: new Closed_Cone(30,30),
                      grillLeg: new Cylindrical_Tube(20,20),
                      grillBody: new Surface_Of_Revolution( 30, 30, grillPoints ),
                      smoke: new Regular_2D_Polygon(30,30),
                      ball: new Subdivision_Sphere(4),
                      birdMouth: new Closed_Cone(15,15)
                   };              // At the beginning of our program, load one of each of these shape

    this.ingredients = [ "lettuce", "beef", "tomato", "cheese"];
    this.submit_shapes( context, shapes );            // it would be redundant to tell it again.  You should just re-use
                                                      // the one called "box" more than once in display() to draw
                                                      // multiple cubes.  Don't define more than one blueprint for the
                                                      // same thing here.
    //Camera
    this.cameraTransform = Mat4.inverse( context.globals.graphics_state.camera_transform ); //initial camera location

    shapes.square.texture_coords = shapes.square.texture_coords.map(v=>Vec.of(v[0], v[1]));
    //Materials
    this.materials =
    {
      white: context.get_instance( Basic_Shader ).material(),
      clay: context.get_instance( Phong_Shader ).material( Color.of( .9,.5,.9, 1 ), { ambient: .4, diffusivity: .4 } ),
      phong: context.get_instance( Phong_Shader ).material( Color.of( 1,1,0,1 ) ),
      texture_1: context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,1 ), {texture: context.get_instance("assets/texture_1.png", true), ambient:1}),
      phong2: context.get_instance( Phong_Shader ).material( Color.of( 1,1,0,1 ), {ambient:1} ),
      grass: context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,1 ), {texture: context.get_instance("assets/grass_texture.jpg",true), ambient:1}),
      //background texture
      bush: context.get_instance( Phong_Shader ). material( Color.of(0,0,0,1), {texture: context.get_instance("assets/bushs.jpg", true), ambient:1, diffusivity : .4, specularity : .1} ),
      treeTrunk: context.get_instance( Phong_Shader ). material( Color.of(0,0,0,1), {texture: context.get_instance("assets/treetrunk.png", true), ambient:.8, diffusivity: 1, specularity : .1} ),
      treeLeaves: context.get_instance( Phong_Shader ). material( Color.of(0,0,0,1), {texture: context.get_instance("assets/leaves.png", true), ambient:.8, diffusivity: 1} ),
      skySide: context.get_instance( Phong_Shader ). material( Color.of(0,0,0,1), {texture: context.get_instance("assets/sky1.jpg", true), ambient:1} ),
      grillChimney: context.get_instance( Phong_Shader ).material( Color.of( .2891,.2891,.2891, 1 ), { ambient: 1} ),
      grill: context.get_instance( Phong_Shader ).material( Color.of( .1094,.1094,.1094, 1 ), { ambient: 1 , specularity : .1} ),
      smoke: context.get_instance( Phong_Shader ).material(Color.of( 1,1,1, 1 ), { ambient: 0} ),
      birdHead: context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1), {texture: context.get_instance("assets/birdhead.png", true), ambient:1, specularity : .1} ),
      birdBody: context.get_instance( Phong_Shader ).material(Color.of( 1,1,1, 1 ), { ambient: 1,specularity : .1} ),
      //skyTop: context.get_instance( Phong_Shader ). material( Color.of(0,0,0,1), {texture: context.get_instance("assets/sky2.jpg", true), ambient:1} ),
      //burger Ingredients
      cheese: context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1), {texture: context.get_instance("assets/cheese.jpg", true), ambient:1} ),
      beef: context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1),{texture: context.get_instance("assets/meat.png", true), ambient:1} ),
      lettuce: context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1),{texture: context.get_instance("assets/lettuce.png", true), ambient:1} ),
      bun: context.get_instance( Phong_Shader ).material( Color.of( 0.8431,0.6078,0.1412,1 ) ,{ ambient: 1, diffusivity: .4 } ),
      bunBottom: context.get_instance( Phong_Shader ).material( Color.of( 1,0.9647,0.8588,1 ) ,{ ambient: 1, diffusivity: .4 } ),
      tomato: context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1),{texture: context.get_instance("assets/tomato1.png", true), ambient:1} ),
      //rotten Ingredients
      rTomato: context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1),{texture: context.get_instance("assets/rottenTomato.png", true), ambient:1} ),
      rLettuce: context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1),{texture: context.get_instance("assets/rottenLettuce.png", true), ambient:1} ),
      rCheese: context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1),{texture: context.get_instance("assets/rottenCheese.png", true), ambient:1} ),
      rBeef: context.get_instance( Phong_Shader ).material( Color.of(0.169,0.114,0.055,1),{ambient:1} ),
      birdPoop: context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1),{texture: context.get_instance("assets/birdpoop.png", true), ambient:1,  specularity: .1} ),
      rottenMaterial: context.get_instance( Phong_Shader ).material( Color.of( 0,0.2,0.2, 1 ), { ambient: .4, diffusivity: .4 } )
    };

    //Custom Colors
    this.red  = context.get_instance( Phong_Shader ).material( Color.of( 1,0,0, 1 ), { ambient: .4, diffusivity: .4 } );
    this.green  = context.get_instance( Phong_Shader ).material( Color.of( 0,1,0, 1 ), { ambient: .4, diffusivity: .4 } );
    this.blue  = context.get_instance( Phong_Shader ).material( Color.of( 0,0,1, 1 ), { ambient: .4, diffusivity: .4 } );
    this.orange  = context.get_instance( Phong_Shader ).material( Color.of( 1,0.5,0, 1 ), { ambient: .4, diffusivity: .4 } );

    //Lights
    this.lights = [ new Light( Vec.of( 0,5,5,1 ), Color.of( 1, .4, 1, 1 ), 100000 ) ];


    //main burger transform
    this.burgerTransform = Mat4.identity().times(Mat4.scale([1,1,1]));//HAVE TO UPDATE HITBOX SIZE LATER
    this.getPosition(this.burgerTransform);
  

    //collection of all spawned objects
    this.allSpawnedObjects = [];

    //Burger
    this.burger = new Burger(this.burgerTransform, shapes.box);
    //give burger stack the bottom bun as first item in stack;
    this.burger.burgerStack.push(new SpawnedObject(this.burgerTransform, this.shapes.baseBun, this.materials.bun, true));

    //Hitboxes
    this.show_hitbox = false;

    //Spawn Clock
    this.spawnClock = 0;

    //Game Score
    this.totScore = 0;
    this.curScore = 0;
    this.lives = 3;
  }
  drawTree(graphics_state, x,y,z)
  {
    this.shapes.treeTrunk.draw(graphics_state, Mat4.identity().times(Mat4.translation(Vec.of(x,y,z))).times(Mat4.rotation(Math.PI / 2, Vec.of(1,0,0))).times(Mat4.scale(Vec.of(2,2,50))), this.materials.treeTrunk);
    this.shapes.treeLeaves.draw(graphics_state, Mat4.identity().times(Mat4.translation(Vec.of(x,y + 26,z))).times(Mat4.rotation(Math.PI * 3 / 2, Vec.of(1,0,0))).times(Mat4.scale(Vec.of(5,5,2))), this.materials.treeLeaves);
    this.shapes.treeLeaves.draw(graphics_state, Mat4.identity().times(Mat4.translation(Vec.of(x,y + 22,z))).times(Mat4.rotation(Math.PI * 3 / 2, Vec.of(1,0,0))).times(Mat4.scale(Vec.of(7,7,4))), this.materials.treeLeaves);
    this.shapes.treeLeaves.draw(graphics_state, Mat4.identity().times(Mat4.translation(Vec.of(x,y + 15,z))).times(Mat4.rotation(Math.PI * 3 / 2, Vec.of(1,0,0))).times(Mat4.scale(Vec.of(9,9,5))), this.materials.treeLeaves);  
    this.shapes.treeLeaves.draw(graphics_state, Mat4.identity().times(Mat4.translation(Vec.of(x,y+7,z))).times(Mat4.rotation(Math.PI * 3 / 2, Vec.of(1,0,0))).times(Mat4.scale(Vec.of(12,12,7))), this.materials.treeLeaves);
    this.shapes.treeLeaves.draw(graphics_state, Mat4.identity().times(Mat4.translation(Vec.of(x,y,z))).times(Mat4.rotation(Math.PI * 3 / 2, Vec.of(1,0,0))).times(Mat4.scale(Vec.of(13,13,7))), this.materials.treeLeaves);
  }
  drawBird(graphics_state, x,y,z)
  {
    const t_temp = graphics_state.animation_time/10000;
    this.shapes.ball.draw(graphics_state, Mat4.identity().times(Mat4.rotation(Math.PI * t_temp/2, Vec.of(0,1,0))).times(Mat4.translation(Vec.of(x,y,z))), this.materials.birdHead);
    this.shapes.ball.draw(graphics_state, Mat4.identity().times(Mat4.rotation(Math.PI * t_temp/2, Vec.of(0,1,0))).times(Mat4.translation(Vec.of(x,y,z-1.9))).times(Mat4.scale(Vec.of(1,1,2))), this.materials.birdBody);
    this.shapes.ball.draw(graphics_state, Mat4.identity().times(Mat4.rotation(Math.PI * t_temp/2, Vec.of(0,1,0))).times(Mat4.translation(Vec.of(x,y,z))).times(Mat4.rotation(Math.PI / 8 * Math.sin(t_temp)/2, Vec.of(0,0,1))).times(Mat4.translation(Vec.of(1.5,.5,-1.9))).times(Mat4.rotation(Math.PI * 0.9, Vec.of(0,0,-1))).times(Mat4.scale(Vec.of(1,0.4,0.25))), this.materials.phong2);
    this.shapes.ball.draw(graphics_state, Mat4.identity().times(Mat4.rotation(Math.PI * t_temp/2, Vec.of(0,1,0))).times(Mat4.translation(Vec.of(x,y,z))).times(Mat4.rotation(Math.PI / 8 * Math.sin(t_temp - Math.PI)/2, Vec.of(0,0,1))).times(Mat4.translation(Vec.of(-1.5,+.5,-1.9))).times(Mat4.rotation(Math.PI * 0.9, Vec.of(0,0,1))).times(Mat4.scale(Vec.of(1,0.4,0.25))), this.materials.phong2);
    this.shapes.ball.draw(graphics_state, Mat4.identity().times(Mat4.rotation(Math.PI * t_temp/2, Vec.of(0,1,0))).times(Mat4.translation(Vec.of(x,y+.5,z-3.8))).times(Mat4.rotation(Math.PI * 0.5, Vec.of(0,1,0))).times(Mat4.scale(Vec.of(0.5,0.5,0.5))), this.materials.birdBody);
    this.shapes.birdMouth.draw(graphics_state, Mat4.identity().times(Mat4.rotation(Math.PI * t_temp/2, Vec.of(0,1,0))).times(Mat4.translation(Vec.of(x+.1,y-.8,z+0.7))).times(Mat4.rotation(Math.PI * 2.25 , Vec.of(1,0,0))).times(Mat4.scale(Vec.of(0.3,0.3,0.3))), this.materials.phong2);
  }
  drawBush(graphics_state, x,y,z)
  {
    var i;
    let thickness = 5;
    for (i=0; i < thickness; i++) {
      this.shapes.square.draw(graphics_state, Mat4.identity().times(Mat4.translation(Vec.of(x,y,z))).times(Mat4.rotation(Math.PI * i/thickness, Vec.of(0,1,0))).times(Mat4.scale(Vec.of(3,1,2))), this.materials.bush);
      this.shapes.square.draw(graphics_state, Mat4.identity().times(Mat4.translation(Vec.of(x,y+1,z))).times(Mat4.rotation(Math.PI * i/thickness, Vec.of(0,1,0))).times(Mat4.scale(Vec.of(2.3,1,2))), this.materials.bush);
      this.shapes.square.draw(graphics_state, Mat4.identity().times(Mat4.translation(Vec.of(x,y+2,z))).times(Mat4.rotation(Math.PI * i/thickness, Vec.of(0,1,0))).times(Mat4.scale(Vec.of(1.8,1,2))), this.materials.bush);
      this.shapes.square.draw(graphics_state, Mat4.identity().times(Mat4.translation(Vec.of(x,y+2.6,z))).times(Mat4.rotation(Math.PI * i/thickness, Vec.of(0,1,0))).times(Mat4.scale(Vec.of(1,1,2))), this.materials.bush);

      this.shapes.square.draw(graphics_state, Mat4.identity().times(Mat4.translation(Vec.of(x+2.6,y,z))).times(Mat4.rotation(Math.PI * i/thickness, Vec.of(0,1,0))).times(Mat4.scale(Vec.of(3,1,2))), this.materials.bush);
      this.shapes.square.draw(graphics_state, Mat4.identity().times(Mat4.translation(Vec.of(x+2.6,y+1,z))).times(Mat4.rotation(Math.PI * i/thickness, Vec.of(0,1,0))).times(Mat4.scale(Vec.of(2.3,1,2))), this.materials.bush);
      this.shapes.square.draw(graphics_state, Mat4.identity().times(Mat4.translation(Vec.of(x+2.6,y+2,z))).times(Mat4.rotation(Math.PI * i/thickness, Vec.of(0,1,0))).times(Mat4.scale(Vec.of(1.8,1,2))), this.materials.bush);
      this.shapes.square.draw(graphics_state, Mat4.identity().times(Mat4.translation(Vec.of(x+2.6,y+2.6,z))).times(Mat4.rotation(Math.PI * i/thickness, Vec.of(0,1,0))).times(Mat4.scale(Vec.of(1,1,2))), this.materials.bush);
 
      this.shapes.square.draw(graphics_state, Mat4.identity().times(Mat4.translation(Vec.of(x+2,y,z+1))).times(Mat4.rotation(Math.PI * i/thickness, Vec.of(0,1,0))).times(Mat4.scale(Vec.of(3,1,2))), this.materials.bush);
      this.shapes.square.draw(graphics_state, Mat4.identity().times(Mat4.translation(Vec.of(x+2,y+1,z+1))).times(Mat4.rotation(Math.PI * i/thickness, Vec.of(0,1,0))).times(Mat4.scale(Vec.of(2.3,1,2))), this.materials.bush);
      this.shapes.square.draw(graphics_state, Mat4.identity().times(Mat4.translation(Vec.of(x+2,y+2,z+1))).times(Mat4.rotation(Math.PI * i/thickness, Vec.of(0,1,0))).times(Mat4.scale(Vec.of(1.8,1,2))), this.materials.bush);
      this.shapes.square.draw(graphics_state, Mat4.identity().times(Mat4.translation(Vec.of(x+2,y+2.6,z+1))).times(Mat4.rotation(Math.PI * i/thickness, Vec.of(0,1,0))).times(Mat4.scale(Vec.of(1,1,2))), this.materials.bush);
 
      this.shapes.square.draw(graphics_state, Mat4.identity().times(Mat4.translation(Vec.of(x-1,y,z+1))).times(Mat4.rotation(Math.PI * i/thickness, Vec.of(0,1,0))).times(Mat4.scale(Vec.of(3,1,2))), this.materials.bush);
      this.shapes.square.draw(graphics_state, Mat4.identity().times(Mat4.translation(Vec.of(x-1,y+1,z+1))).times(Mat4.rotation(Math.PI * i/thickness, Vec.of(0,1,0))).times(Mat4.scale(Vec.of(2.3,1,2))), this.materials.bush);
      this.shapes.square.draw(graphics_state, Mat4.identity().times(Mat4.translation(Vec.of(x-1,y+2,z+1))).times(Mat4.rotation(Math.PI * i/thickness, Vec.of(0,1,0))).times(Mat4.scale(Vec.of(1.8,1,2))), this.materials.bush);
      this.shapes.square.draw(graphics_state, Mat4.identity().times(Mat4.translation(Vec.of(x-1,y+2.6,z+1))).times(Mat4.rotation(Math.PI * i/thickness, Vec.of(0,1,0))).times(Mat4.scale(Vec.of(1,1,2))), this.materials.bush);
    }

  }
  drawGrill(graphics_state, x,y,z)
  {
    this.shapes.grillBody.draw(graphics_state, Mat4.identity().times(Mat4.translation(Vec.of(x,y,z))).times(Mat4.rotation(Math.PI *3 / 2, (Vec.of(1,0,0)))).times(Mat4.scale(Vec.of(2.5,1,2.5))), this.materials.grill);
    this.shapes.grillLeg.draw(graphics_state, Mat4.identity().times(Mat4.translation(Vec.of(x+2,y-1,z-1))).times(Mat4.rotation(Math.PI *3 / 2, (Vec.of(1,0,0)))).times(Mat4.rotation(Math.PI * 0.9, (Vec.of(0,1,0)))).times(Mat4.scale(Vec.of(0.5,0.5,7))), this.materials.grill);
    this.shapes.grillLeg.draw(graphics_state, Mat4.identity().times(Mat4.translation(Vec.of(x,y-2,z+1))).times(Mat4.rotation(Math.PI * 0.4 , (Vec.of(1,0,0)))).times(Mat4.scale(Vec.of(0.5,0.5,5))), this.materials.grill);
    this.shapes.grillLeg.draw(graphics_state, Mat4.identity().times(Mat4.translation(Vec.of(x-2,y-1,z-1))).times(Mat4.rotation(Math.PI * 0.6, (Vec.of(1,0,0)))).times(Mat4.rotation(Math.PI  * 0.9, (Vec.of(0,1,0)))).times(Mat4.scale(Vec.of(0.5,0.5,7))), this.materials.grill);
    this.shapes.grillLeg.draw(graphics_state, Mat4.identity().times(Mat4.translation(Vec.of(x-2,y+5,z-1))).times(Mat4.rotation(Math.PI * 3 / 2, (Vec.of(1,0,0)))).times(Mat4.scale(Vec.of(0.3,0.3,5))), this.materials.grillChimney);
    this.drawSmoke(graphics_state, x-2.5,y+7.6,z-1.5);
  }
  drawSmoke(graphics_state, x,y,z)
  {
    for(let i = 0; i < 25; i++)
      this.shapes.smoke.draw(graphics_state, Mat4.identity().times(Mat4.translation(Vec.of(x+Math.random(0,0.5),y+Math.random(0,0.5),z+Math.random(0,0.5)))).times(Mat4.scale(Vec.of(0.08,0.08,1))), this.materials.smoke);
    for(let i = 0; i < 5; i++)
      this.shapes.smoke.draw(graphics_state, Mat4.identity().times(Mat4.translation(Vec.of(x+Math.random(),y+Math.random() + 1,z+Math.random()))).times(Mat4.scale(Vec.of(0.08,0.08,1))), this.materials.smoke);
  }
  drawBackground(graphics_state)
  {
    //Trees
    this.drawTree(graphics_state, 30,25,30);
    this.drawTree(graphics_state, -50,25,-30);
    this.drawTree(graphics_state, -78,25,-66);
    this.drawTree(graphics_state, -92,25,-120);
    this.drawTree(graphics_state, -125,25,-97);
    this.drawTree(graphics_state, 169,25,-152);
    this.drawTree(graphics_state, 89,25,17);
    this.drawTree(graphics_state, 53,25,-73);
    this.drawTree(graphics_state, -21,25,96);
    this.drawTree(graphics_state, 30,25,-163);
    this.drawTree(graphics_state, 22,25,184);
    this.drawTree(graphics_state, -130,25,-109);
    this.drawTree(graphics_state, 30,25,30);
    this.drawTree(graphics_state, 30,25,30);

    //Grills
    this.drawBush(graphics_state, -25,2,-77);
    this.drawBush(graphics_state, 92,2,-89);
    this.drawBush(graphics_state, -33,2,-56);
    this.drawBush(graphics_state, 39,2,-109);
    this.drawBush(graphics_state, 76,2,30);

    //Bird
    this.drawGrill(graphics_state, -40,5,-40);
    //this.drawBirdPoop(graphics_state, -10,5,-10);
    this.drawBird(graphics_state, -100,100,-170);
    this.drawBird(graphics_state, -120,100,-150);
    this.drawBird(graphics_state, 120,100,150);

    //Skyboxes
    this.shapes.square.draw(graphics_state, Mat4.identity().times(Mat4.translation(Vec.of(200,200,0))).times(Mat4.rotation(Math.PI / 2, Vec.of(0,1,0))).times(Mat4.scale(Vec.of(200,200,1))), this.materials.skySide);
    this.shapes.square.draw(graphics_state, Mat4.identity().times(Mat4.translation(Vec.of(0,200,200))).times(Mat4.rotation(Math.PI, Vec.of(0,1,0))).times(Mat4.scale(Vec.of(200,200,1))), this.materials.skySide);
    this.shapes.square.draw(graphics_state, Mat4.identity().times(Mat4.translation(Vec.of(-200,200,0))).times(Mat4.rotation(Math.PI * 3 / 2, Vec.of(0,1,0))).times(Mat4.scale(Vec.of(200,200,1))), this.materials.skySide);
    this.shapes.square.draw(graphics_state, Mat4.identity().times(Mat4.translation(Vec.of(0,200,-200))).times(Mat4.rotation(Math.PI * 2, Vec.of(0,1,0))).times(Mat4.scale(Vec.of(200,200,1))), this.materials.skySide);
    this.shapes.square.draw(graphics_state, Mat4.identity().times(Mat4.translation(Vec.of(0,400,0))).times(Mat4.rotation(Math.PI / 2, Vec.of(1,0,0))).times(Mat4.scale(Vec.of(200,200,1))), this.materials.skySide);
    this.shapes.square.draw(graphics_state, Mat4.identity().times(Mat4.rotation(Math.PI/2, [1,0,0])).times(Mat4.scale([200,200,200])), this.materials.grass);
  }
  
  //returns random transform from wthin set bounds (In front of camera)
  getRandomTransform()
  {
       var ranX = Math.floor(Math.random() * 200) - 100;  // returns a random integer from -99 to 100
       var ranY = Math.floor(Math.random() * 50) + 100;  // returns a random integer from 101 to 149
       var ranZ = Math.floor(Math.random() * 100) - 200;  // returns a random integer from -199 to -100
       return Mat4.identity().times(Mat4.translation([ranX,ranY,ranZ]))
  } 

  getRandomShape()
  {
    return this.ingredients[Math.floor(Math.random()*this.ingredients.length)];
  }

  //returns x, y, or z given model_transform of any object
  getPositionX (model_transform)
  {
      return model_transform[0][3];
  }

  getPositionY (model_transform)
  {
      return model_transform[1][3];
  }

  getPositionZ (model_transform)
  {
      return model_transform[2][3];
  }

  getPosition (model_transform)
  {
    console.log ("X: " + this.getPositionX(model_transform) + " Y: " + this.getPositionY(model_transform) + " Z: " + this.getPositionZ (model_transform));
  }

  make_control_panel()             // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
  {
    this.live_string( box => { box.textContent = "TOTAL SCORE: " + this.totScore} ); this.new_line(); this.new_line();
    this.live_string( box => { box.textContent = "CURRENT SCORE: " + this.curScore} ); this.new_line(); this.new_line();
    //this.live_string( box => { box.textContent = "LIVES: " + this.lives} ); this.new_line(); this.new_line();

    //Burger Movement Controls
    this.key_triggered_button( "Move Fowards", [ "i" ], () => this.burger.velocityZ = -1, undefined, () => this.burger.velocityZ = 0);
    this.key_triggered_button( "Move Backwards", [ "k" ], () => this.burger.velocityZ = 1, undefined, () => this.burger.velocityZ = 0); this.new_line();

    this.key_triggered_button( "Move Left", [ "j" ], () => this.burger.velocityX = -0.6, undefined, () => this.burger.velocityX = 0);
    this.key_triggered_button( "Move Right", [ "l" ], () => this.burger.velocityX = 0.6, undefined, () => this.burger.velocityX = 0); this.new_line();

    this.key_triggered_button( "Move Up", [ "u" ], () => this.burger.velocityY = 0.5, undefined, () => this.burger.velocityY = 0);
    this.key_triggered_button( "Move Down", [ "n" ], () => this.burger.velocityY = -0.5, undefined, () => this.burger.velocityY = 0);  this.new_line(); this.new_line();

    this.key_triggered_button( "Show Hitboxes",     [ "h" ], () =>
    {
      this.show_hitbox = !this.show_hitbox;
    } );
  }

  display(graphics_state )
  {
    graphics_state.lights = this.lights;        // Use the lights stored in this.lights.
    let model_transform = Mat4.identity();
    const t = graphics_state.animation_time/1000, dt = graphics_state.animation_delta_time/1000;
    this.spawnClock += dt;

    //Draws Background Objects/Scene
    this.drawBackground(graphics_state);

    let burger_transform = Mat4.identity();
    burger_transform = burger_transform.times(Mat4.translation([2,2,2]));

    //Spawned Ingredients Management
    if(this.spawnClock > .5)
    {
      this.spawnClock = 0;
      let is_rotten = Math.floor(Math.random()*100) > 80;
      let randshape = this.getRandomShape();
      let trans = this.getRandomTransform().times(Mat4.rotation(Math.PI/2, [1,0,0]));

      this.allSpawnedObjects.push(new SpawnedObject(trans, this.shapes[randshape],
           this.materials[is_rotten? ("rottenMaterial") : randshape], !is_rotten));
    }
    //tell objects to move
    //update lifetime of objects
    //cull objects if lifetime <= 0 or if objects hit ground
    for(let i=(this.allSpawnedObjects.length-1); i>-1; i--)
    {
      this.allSpawnedObjects[i].move();
      // if( this.context.shapes_in_use[shape] ) {                 // If two scenes give any shape the same name as an existing one, the
      //   this.gpu_shapes[shape] = this.context.shapes_in_use[shape];   // existing one is used instead and the new shape is thrown out.
      // } else {
      //   this.gpu_shapes[shape] = this.context.shapes_in_use[shape] = this.allSpawnedObjects[i].hitbox;
      // }
      // this.gpu_shapes[shape].copy_onto_graphics_card( this.context.gl );

      //Collisions Logic
      for(let k=0; k<this.burger.burgerStack.length; k++)
      {
        //if collided and isGood == true (HITING GOOD ITEMS)
        if (this.allSpawnedObjects[i].hitbox.collides(this.burger.burgerStack[k].hitbox))
        {
          console.log("COLLISION");
          if (this.allSpawnedObjects[i].isGood == true)
          {

            //move camera back to fit in large stack every time stack expands
            this.cameraTransform = graphics_state.camera_transform.times(Mat4.translation([0,0,-1]));
            graphics_state.camera_transform = this.cameraTransform;

            //Adding ingredient to burger stack
            //TODO: lower object before adding to stack to remove air space
            let nIngredInStack = this.burger.burgerStack.length;
            console.log(nIngredInStack * -2);
            // this.allSpawnedObjects[i].objectTransform = this.allSpawnedObjects[i].objectTransform.times(Mat4.translation([0,-(2**nIngredInStack),0]));
            // this.allSpawnedObjects[i].hitbox.updatePos(this.allSpawnedObjects[i].objectTransform);
            this.burger.burgerStack.push(this.allSpawnedObjects[i]);
            //console.log(this.burger.burgerStack);

            //Removing collided ingredient from free collection
            delete this.allSpawnedObjects[i];
            this.allSpawnedObjects.splice(i,1);

            //Adding Points
            this.curScore += 5;
            if(this.burger.burgerStack.length == 6)
            {
              //move camera closer to burger once burger reset
              this.cameraTransform = graphics_state.camera_transform.times(Mat4.translation([0,0,(this.burger.burgerStack.length-1)]));
              graphics_state.camera_transform = this.cameraTransform;

              this.totScore += this.curScore;
              this.curScore = 0;
              this.burger.burgerStack.splice(1,this.burger.burgerStack.length-1);
            }
          }
          //if collided and isGood == false (HITING BAD ITEMS)
          else if(this.allSpawnedObjects[i].isGood == false)
          {
              //move camera closer to burger once burger reset
              this.cameraTransform = graphics_state.camera_transform.times(Mat4.translation([0,0,(this.burger.burgerStack.length-1)]));
              graphics_state.camera_transform = this.cameraTransform;

              this.curScore = 0;
              this.burger.burgerStack.splice(1,this.burger.burgerStack.length-1);
              this.lives--;
          }
        }
      }

      this.allSpawnedObjects[i].lifetime = this.allSpawnedObjects[i].lifetime - dt;

      if(this.allSpawnedObjects[i].lifetime <= 0 || this.allSpawnedObjects[i].getPosY() <= 0)
      {
        this.allSpawnedObjects.splice(i,1);
        //console.log("Culled Object: " + i);
      }
    }
    //console.log("Spawn Count: " + this.allSpawnedObjects.length);
    
    //Burger Movement Logic
    //updates positions of items within burger stack Acorrding to transform of burger
    for(let i=0; i<this.burger.burgerStack.length; i++)
    {
      this.burger.burgerStack[i].objectTransform = this.burger.burgerTransform.times(Mat4.translation([0,i*0.5,0]));
      this.burger.hitbox.updatePos(this.burger.burgerTransform); //update hitbox every frame for burger
      this.burger.burgerStack[i].hitbox.updatePos(this.burger.burgerStack[i].objectTransform); //update hitbox every frame for each element in burger stack
    }
    //move burger back within bounds if out of bounds
    if(this.burger.getPosX() < -100)
    {
        this.burger.burgerTransform = this.burger.burgerTransform.times(Mat4.translation([0.5,0,0]));
        this.burger.velocityX = 0;
    }
    if(this.burger.getPosX() > 100)
    {
        this.burger.burgerTransform = this.burger.burgerTransform.times(Mat4.translation([-0.5,0,0]));
        this.burger.velocityX = 0;
    }
    if(this.burger.getPosY() < 1)
    {
        this.burger.burgerTransform = this.burger.burgerTransform.times(Mat4.translation([0,0.5,0]));
        this.burger.velocityY = 0;
    }
    if(this.burger.getPosY() > 40)
    {
        this.burger.burgerTransform = this.burger.burgerTransform.times(Mat4.translation([0,-0.5,0]));
        this.burger.velocityY = 0;
    }
    if(this.burger.getPosZ() < -100)
    {
        this.burger.burgerTransform = this.burger.burgerTransform.times(Mat4.translation([0,0,0.5]));
        this.burger.velocityZ = 0;
    }
    if(this.burger.getPosZ() > 100)
    {
        this.burger.burgerTransform = this.burger.burgerTransform.times(Mat4.translation([0,0,-0.5]));
        this.burger.velocityZ = 0;
    }
    this.burger.move();
    //this.burger.hitbox.logPos();

    //Draws Our Burger's Stack
    if (this.show_hitbox)
    {
      for(let i=0; i<this.burger.burgerStack.length; i++)
      {
        this.shapes.burger_hitbox.draw(graphics_state, this.burger.burgerStack[i].objectTransform.times(Mat4.scale([2,1,2])),
            this.materials.white);
      }
    }
    for(let i=0; i<this.burger.burgerStack.length; i++)
    {
      this.burger.burgerStack[i].model.draw(graphics_state, this.burger.burgerStack[i].objectTransform.times(Mat4.translation([0,i === 0 ? 0 : -0.5,0]).times(Mat4.rotation(Math.PI/2, [1,0,0]))),
          this.burger.burgerStack[i].color);
    }


    //Draws Random Ingredients
    for (let i=0; i<this.allSpawnedObjects.length; i++)
    {
      let nIngredInStack = this.burger.burgerStack.length;
      if (this.show_hitbox) {
        if (this.allSpawnedObjects[i].isGood) {
          this.shapes.ingred_hitbox.draw(graphics_state, this.allSpawnedObjects[i].objectTransform.times(Mat4.scale([2,2,1])), this.materials.white);
        } else {
          this.shapes.hazard_hitbox.draw(graphics_state, this.allSpawnedObjects[i].objectTransform.times(Mat4.scale([2,2,1])), this.materials.white);
        }
      }
      this.allSpawnedObjects[i].model.draw(graphics_state, this.allSpawnedObjects[i].objectTransform, this.allSpawnedObjects[i].color);

    }

  }

};




