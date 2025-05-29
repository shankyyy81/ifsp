import React, { useEffect, useRef } from 'react';
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Animation, SceneLoader } from '@babylonjs/core';
import { GLTFFileLoader } from '@babylonjs/loaders';

const SignLanguageAvatar = ({ gestureSequence }) => {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const avatarRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Babylon.js scene
    const engine = new Engine(canvasRef.current, true);
    const scene = new Scene(engine);
    sceneRef.current = scene;

    // Create camera
    const camera = new ArcRotateCamera(
      "camera",
      Math.PI / 2,
      Math.PI / 2.5,
      5,
      Vector3.Zero(),
      scene
    );
    camera.attachControl(canvasRef.current, true);

    // Add lights
    const light = new HemisphericLight(
      "light",
      new Vector3(1, 1, 0),
      scene
    );

    // Register GLTF loader
    SceneLoader.RegisterPlugin(new GLTFFileLoader());

    // Load avatar model
    SceneLoader.ImportMesh(
      "",
      "/",
      "HVGirl.glb",
      scene,
      (meshes) => {
        console.log('Loaded meshes:', meshes);
        // Log all mesh names
        console.log('All mesh names:');
        scene.meshes.forEach(m => console.log(m.name));
        let avatar = meshes[0];
        if (avatar.getChildMeshes && avatar.getChildMeshes().length > 0) {
          avatar = avatar.getChildMeshes()[0];
          console.log('Using child mesh for animation:', avatar);
        }
        avatar.scaling = new Vector3(0.1, 0.1, 0.1);
        avatar.position = new Vector3(0, 0, 0);
        avatarRef.current = avatar;
      }
    );

    // Handle window resize
    const handleResize = () => {
      engine.resize();
    };
    window.addEventListener('resize', handleResize);

    // Start render loop
    engine.runRenderLoop(() => {
      scene.render();
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.dispose();
    };
  }, []);

  // Handle gesture sequence changes
  useEffect(() => {
    if (!gestureSequence || !avatarRef.current) return;

    const playGesture = async (gestureId) => {
      try {
        const response = await fetch(`http://localhost:8002/api/v1/gesture/${gestureId}`);
        const gestureData = await response.json();
        console.log('Playing gesture:', gestureId, gestureData, avatarRef.current);

        // Create animation
        const frameRate = 60;
        const babylonAnimation = new Animation(
          "gestureAnimation",
          "rotation",
          frameRate,
          Animation.ANIMATIONTYPE_VECTOR3,
          Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        // Set keyframes
        const keyFrames = gestureData.keyframes.map(kf => ({
          frame: (kf.time / 1000) * frameRate,
          value: new Vector3(
            kf.rotation.x * (Math.PI / 180),
            kf.rotation.y * (Math.PI / 180),
            kf.rotation.z * (Math.PI / 180)
          )
        }));
        babylonAnimation.setKeys(keyFrames);

        // Apply animation to all meshes in the scene for maximum visibility
        sceneRef.current.meshes.forEach(mesh => {
          mesh.animations = [babylonAnimation];
          sceneRef.current.beginAnimation(mesh, 0, keyFrames.length - 1);
        });

        // Wait for animation to complete
        await new Promise(resolve => setTimeout(resolve, gestureData.duration));
      } catch (error) {
        console.error('Error playing gesture:', error);
      }
    };

    // Play gestures in sequence
    const playSequence = async () => {
      for (const gestureId of gestureSequence) {
        await playGesture(gestureId);
      }
    };

    playSequence();
  }, [gestureSequence]);

  return (
    <div className="avatar-container">
      <canvas ref={canvasRef} className="avatar-canvas" />
      <style>{`
        .avatar-container {
          width: 100%;
          height: 400px;
          position: relative;
          background-color: #f0f0f0;
          border-radius: 8px;
          overflow: hidden;
        }

        .avatar-canvas {
          width: 100%;
          height: 100%;
          touch-action: none;
        }
      `}</style>
    </div>
  );
};

export default SignLanguageAvatar; 