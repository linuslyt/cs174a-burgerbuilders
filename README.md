
# CS174A Final Project Report
## Team Burger Builders
## Our Project and Project Instructions
Random hamburger ingredients and rotten food are falling out of the sky. Catch as many ingredients as possible in order to gain a higher score. <br />
Use the `i k j l u n` keys to move your burger FORWARDS BACKWARDS LEFT RIGHT UP DOWN <br />
Use the `h` key toggle displaying color-coordinated hitboxes. <br />
Blue = Burger stack object, Green = good ingredient, Red = rotten ingredient. <br />
Dodge rotten ingredients as they will cause you to restart your current score. <br />
You have to catch at least 5 good ingredients in a row to add your current score to your total score <br />

![alt text](https://github.com/intro-graphics-master-F19/term-project-team-burger-builders/blob/master/CS174_Final_Project_Gameplay_Screenshot.png)
###### *Screenshot during run of our game*

## Team Contributions
### Yifan Zhang:
I implemented all object models and backgrounds using all the shapes built in the dependency.js. For each object, I defined them in const shapes and this.materials. For some shapes, I used surface of revolutions, which I drew points on a chart and put them in Vec.cast. For some materials, I used texture mapping with 128 * 128 images learnt in assignment 4. Also, I implemented most of our draw methods except the drawBackground. The thing that I found interesting is implementing bushes and smoke. I used a for loop to implement bushes. Each loop draws four squares for each cluster. Each next loop draws another four squares with a different angle that is varied by the variable i and a variable called thickness in the loop (Math.PI * i / thickness). For smoke, I drew a couple of circles and make them translate in a certain range with math.random(). 
I also put music on our game. A website called w3schools helped me on that (https://www.w3schools.com/tags/att_audio_autoplay.asp). I was going to make it play automatically, but it did not work. It only plays automatically sometimes. I did a search on the reason for it, and found out that it is probably because Google Chrome does not allow autoplay. 

### Linus Lam:
I implemented collision detection by creating a Hitbox class that automatically scales to the model of the object. The Burger and every SpawnedObject contains an instance of Hitbox; every SpawnedObject is kept track of in an array, and during each draw, the SpawnedObjects are iterated through to see if they collide with any objects in the current Burger stack. 
Initially, I made it such that ingredients would only be caught if they collided with the top of the Burger stack. However, the game proved to be surprisingly hard, so we opted to add ingredients as long as they collided with any part of the Burger stack. 
I chose to use axis-aligned bounding boxes for the Hitbox, so collision detection could be performed without additional transformations that would take extra time to compute. Code was adopted from this Mozilla tutorial: https://developer.mozilla.org/en-US/docs/Games/Techniques/3D_collision_detection

I also implemented a Hitbox_Outline class to draw the hitboxes as colored cube outlines. The H key will draw the hitboxes on top of every object, color coded according to the object type = Blue for objects in the Burger stack, Green for ingredients, and Red for hazards (rotten ingredients).

I attempted to implement shadows in the branch dev_shadows. After reading https://webglfundamentals.org/webgl/lessons/webgl-shadows.html and http://learnwebgl.brown37.net/11_advanced_rendering/shadows.html, I added code to create a depth texture, as well as shader glsl code that took a depth texture and rendered fragments in shadow or light. I then traced through the entire tiny-graphics pipeline for rendering shapes, and tried to implement two-pass rendering (rendering to a depth texture, then to the canvas’s framebuffer). However, I found that drawing our scene twice per frame slowed the game down significantly, and would cause movement to become slow/jittery. Because of that, combined with an increasing lack of time, I decided to stop development on shadows. The branch dev_shadows was never merged, but can still be viewed on the repo.

Other optimizations:
I refactored code for drawing shapes manually into Shape subclasses.
I extended the SpawnedObject subclass to streamline object creation and support hitboxes.

### Brian Nguyen:
I worked on spawning, movement and management of ingredients using the allSpawnedObjects array that contained all the randomly spawned fresh or rotten ingredients. Those spawned objects of the SpawnedObject class would have member variables such as lifetime, transform or velocity which were updated every frame in order to determine if we should cull them, where to draw them and where they should be moving to. Ingredients onced spawned at a random position above would fly towards random locations on our game map. I also built the Burger class which contained a stack of all the spawned ingredients that would be stored upon collision with our burger. In addition, I built the movement controls for our burger that would move the burger according to a velocity-based system within set bounds within our game map.

I also worked on the logic that would determine what happens when an ingredient, fresh or rotten, collides with our burger. Fresh ingredients hitting the burger would be added to the stack and removed from free-falling collection of spawned ingredients and cause the burger to reset and add to our total score if enough were caught; Rotten ingredients would reset our burger. Completing the burger would then change the score and update the display of total points on the GUI accordingly.
