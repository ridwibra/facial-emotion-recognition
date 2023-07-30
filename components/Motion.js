import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import * as blazeface from "@tensorflow-models/blazeface";
import Webcam from "react-webcam";

const emotions = {
  0: { en: "Angry", ar: "غاضب" },
  1: { en: "Disgust", ar: "اشمئزاز" },
  2: { en: "Fear", ar: "خوف" },
  3: { en: "Happy", ar: "سعيد" },
  4: { en: "Neutral", ar: "محايد" },
  5: { en: "Sad", ar: "حزين" },
  6: { en: "Surprise", ar: "مفاجأة" },
};

function Motion() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [emotionModel, setEmotionModel] = useState(null);
  const [faceModel, setFaceModel] = useState(null);
  const [emotion, setEmotion] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);

  // Load the models
  useEffect(() => {
    async function loadModels() {
      const emotionModel = await tf.loadLayersModel(
        "/tfjs_model_new/model.json"
      );
      setEmotionModel(emotionModel);
      const faceModel = await blazeface.load();
      setFaceModel(faceModel);
    }
    loadModels();
  }, []);

  // Run the models on the webcam feed
  useEffect(() => {
    let interval;
    if (emotionModel && faceModel && cameraOn) {
      interval = setInterval(() => {
        detect(emotionModel, faceModel);
      }, 10);
    }
    return () => clearInterval(interval);
  }, [emotionModel, faceModel, cameraOn]);

  const detect = async (emotionModel, faceModel) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get video properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width and height
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas width and height
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Detect faces using Blazeface
      let img = tf.browser.fromPixels(video);
      const predictions = await faceModel.estimateFaces(img);

      if (predictions.length > 0) {
        // Draw a bounding box around the detected face
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
          ctx.clearRect(
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
          );
          ctx.strokeStyle = "red";
          ctx.lineWidth = 5;
          const start = predictions[0].topLeft;
          const end = predictions[0].bottomRight;
          const size = [end[0] - start[0], end[1] - start[1]];

          // Mirror the coordinates of the bounding box
          const mirroredStart = [videoWidth - start[0] - size[0], start[1]];
          ctx.strokeRect(mirroredStart[0], mirroredStart[1], size[0], size[1]);
        }

        // Preprocess the input image for emotion detection
        img = tf.image.resizeBilinear(img, [48, 48]);
        img = tf.mean(img, -1);
        img = img.expandDims(-1);

        // Make a prediction using the emotion model
        const prediction = emotionModel.predict(img.expandDims(0));

        // Process the prediction and update the state
        const emotionIndex = prediction.argMax(-1).dataSync()[0];
        setEmotion(emotions[emotionIndex]);
      } else {
        setEmotion({ en: "No face detected", ar: "لم يتم العثور على وجه" });
      }

      // Dispose the input image
      img.dispose();
    }
  };

  const handleCameraToggle = () => {
    setCameraOn(!cameraOn);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-1">Real-time Video</h1>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-1"
          onClick={handleCameraToggle}
        >
          {cameraOn ? "Turn Camera Off" : "Turn Camera On"}
        </button>
        <div className="flex items-center">
          {/* Display the results */}
          {emotion ? (
            <div className="mt-1">
              <p>
                <span className="text-xl font-bold">Emotion: </span>{" "}
                {emotion.en}--{emotion.ar}
              </p>
              <p className="text-2xl"></p>
              <p className="text-2xl"></p>
            </div>
          ) : (
            cameraOn && (
              <div>
                <p>Please wait</p>
              </div>
            )
          )}
        </div>
        {cameraOn && (
          <>
            <Webcam
              ref={webcamRef}
              muted={true}
              className="mirror"
              style={{
                width: 640,
                height: 480,
              }}
            />
            <canvas
              ref={canvasRef}
              style={{
                position: "absolute",
                marginLeft: "auto",
                marginRight: "auto",
                left: 0,
                right: 0,
                textAlign: "center",
                zIndex: 9,
                width: 640,
                height: 480,
              }}
            />
          </>
        )}

        {!cameraOn && (
          <div className="mt-4">
            <p className="text-xl font-bold">Camera is off</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Motion;

////////////////////////////////////////////////////////////////////////////////////////////
// import React, { useRef, useState, useEffect } from "react";
// import * as tf from "@tensorflow/tfjs";
// import * as blazeface from "@tensorflow-models/blazeface";
// import Webcam from "react-webcam";

// const emotions = {
//   0: { en: "anger", ar: "غضب" },
//   1: { en: "fear", ar: "خوف" },
//   2: { en: "happiness", ar: "سعادة" },
//   3: { en: "sadness", ar: "حزن" },
//   4: { en: "surprise", ar: "دهشة" },
//   5: { en: "neutral", ar: "محايد" },
// };

// function Motion() {
//   const webcamRef = useRef(null);
//   const canvasRef = useRef(null);
//   const [emotionModel, setEmotionModel] = useState(null);
//   const [faceModel, setFaceModel] = useState(null);
//   const [emotion, setEmotion] = useState(null);
//   const [cameraOn, setCameraOn] = useState(false);

//   // Load the models
//   useEffect(() => {
//     async function loadModels() {
//       const emotionModel = await tf.loadLayersModel(
//         "/tfjs_model_new/model.json"
//       );
//       setEmotionModel(emotionModel);
//       const faceModel = await blazeface.load();
//       setFaceModel(faceModel);
//     }
//     loadModels();
//   }, []);

//   // Run the models on the webcam feed
//   useEffect(() => {
//     let interval;
//     if (emotionModel && faceModel && cameraOn) {
//       interval = setInterval(() => {
//         detect(emotionModel, faceModel);
//       }, 10);
//     }
//     return () => clearInterval(interval);
//   }, [emotionModel, faceModel, cameraOn]);

//   const detect = async (emotionModel, faceModel) => {
//     if (
//       typeof webcamRef.current !== "undefined" &&
//       webcamRef.current !== null &&
//       webcamRef.current.video.readyState === 4
//     ) {
//       // Get video properties
//       const video = webcamRef.current.video;
//       const videoWidth = webcamRef.current.video.videoWidth;
//       const videoHeight = webcamRef.current.video.videoHeight;

//       // Set video width and height
//       webcamRef.current.video.width = videoWidth;
//       webcamRef.current.video.height = videoHeight;

//       // Set canvas width and height
//       canvasRef.current.width = videoWidth;
//       canvasRef.current.height = videoHeight;

//       // Detect faces using Blazeface
//       let img = tf.browser.fromPixels(video);
//       const predictions = await faceModel.estimateFaces(img);

//       if (predictions.length > 0) {
//         // Draw a bounding box around the detected face
//         const ctx = canvasRef.current?.getContext("2d");
//         if (ctx) {
//           ctx.clearRect(
//             0,
//             0,
//             canvasRef.current.width,
//             canvasRef.current.height
//           );
//           ctx.strokeStyle = "red";
//           ctx.lineWidth = 5;
//           const start = predictions[0].topLeft;
//           const end = predictions[0].bottomRight;
//           const size = [end[0] - start[0], end[1] - start[1]];

//           // Mirror the coordinates of the bounding box
//           const mirroredStart = [videoWidth - start[0] - size[0], start[1]];
//           ctx.strokeRect(mirroredStart[0], mirroredStart[1], size[0], size[1]);
//         }

//         // Preprocess the input image for emotion detection
//         img = tf.image.resizeBilinear(img, [48, 48]);
//         img = tf.mean(img, -1);
//         img = img.expandDims(-1);

//         // Make a prediction using the emotion model
//         const prediction = emotionModel.predict(img.expandDims(0));

//         // Process the prediction and update the state
//         const emotionIndex = prediction.argMax(-1).dataSync()[0];
//         setEmotion(emotions[emotionIndex]);
//       } else {
//         setEmotion({ en: "No face detected", ar: "لم يتم العثور على وجه" });
//       }

//       // Dispose the input image
//       img.dispose();
//     }
//   };

//   const handleCameraToggle = () => {
//     setCameraOn(!cameraOn);
//   };

//   return (
//     <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
//       <div className="flex flex-col items-center">
//         <h1 className="text-4xl font-bold mb-1">Real-time Video</h1>
//         <button
//           className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-1"
//           onClick={handleCameraToggle}
//         >
//           {cameraOn ? "Turn Camera Off" : "Turn Camera On"}
//         </button>
//         <div className="flex items-center">
//           {/* Display the results */}
//           {emotion ? (
//             <div className="mt-1">
//               <p>
//                 <span className="text-xl font-bold">Emotion: </span>{" "}
//                 {emotion.en}--{emotion.ar}
//               </p>
//               <p className="text-2xl"></p>
//               <p className="text-2xl"></p>
//             </div>
//           ) : (
//             cameraOn && (
//               <div>
//                 <p>Please wait</p>
//               </div>
//             )
//           )}
//         </div>
//         {cameraOn && (
//           <>
//             <Webcam
//               ref={webcamRef}
//               muted={true}
//               className="mirror"
//               style={{
//                 width: 640,
//                 height: 480,
//               }}
//             />
//             <canvas
//               ref={canvasRef}
//               style={{
//                 position: "absolute",
//                 marginLeft: "auto",
//                 marginRight: "auto",
//                 left: 0,
//                 right: 0,
//                 textAlign: "center",
//                 zIndex: 9,
//                 width: 640,
//                 height: 480,
//               }}
//             />
//           </>
//         )}

//         {!cameraOn && (
//           <div className="mt-4">
//             <p className="text-xl font-bold">Camera is off</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Motion;

/////////////////////////////////////////////////////////////////////////

// // without face detection model
// import React, { useRef, useState, useEffect } from "react";
// import * as tf from "@tensorflow/tfjs";
// import Webcam from "react-webcam";

// const emotions = {
//   0: { en: "anger", ar: "غضب" },
//   1: { en: "fear", ar: "خوف" },
//   2: { en: "happiness", ar: "سعادة" },
//   3: { en: "sadness", ar: "حزن" },
//   4: { en: "surprise", ar: "دهشة" },
//   5: { en: "neutral", ar: "محايد" },
// };

// function Motion() {
//   const webcamRef = useRef(null);
//   const [model, setModel] = useState(null);
//   const [emotion, setEmotion] = useState(null);
//   const [cameraOn, setCameraOn] = useState(true);

//   // Load the model
//   useEffect(() => {
//     async function loadModel() {
//       const model = await tf.loadLayersModel("/tfjs_model_use/model.json");
//       setModel(model);
//     }
//     loadModel();
//   }, []);

//   // Run the model on the webcam feed
//   useEffect(() => {
//     if (model && cameraOn) {
//       const interval = setInterval(() => {
//         detect(model);
//       }, 10);
//       return () => clearInterval(interval);
//     } else {
//       setEmotion(null);
//     }
//   }, [model, cameraOn]);

//   const detect = async (model) => {
//     if (
//       typeof webcamRef.current !== "undefined" &&
//       webcamRef.current !== null &&
//       webcamRef.current.video.readyState === 4
//     ) {
//       // Get video properties
//       const video = webcamRef.current.video;
//       const videoWidth = webcamRef.current.video.videoWidth;
//       const videoHeight = webcamRef.current.video.videoHeight;

//       // Set video width and height
//       webcamRef.current.video.width = videoWidth;
//       webcamRef.current.video.height = videoHeight;

//       // Preprocess the input image
//       let img = tf.browser.fromPixels(video);
//       img = tf.image.resizeBilinear(img, [48, 48]);
//       img = tf.mean(img, -1);
//       img = img.expandDims(-1);

//       // Make a prediction
//       const prediction = model.predict(img.expandDims(0));

//       // Process the prediction and update the state
//       const emotionIndex = prediction.argMax(-1).dataSync()[0];
//       setEmotion(emotions[emotionIndex]);
//     } else {
//       setEmotion({ en: "No face detected", ar: "لم يتم العثور على وجه" });
//     }
//   };

//   return (
//     <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
//       <div className="flex flex-col items-center">
//         <h1 className="text-4xl font-bold mb-4">Video Detection</h1>
//         <button
//           className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
//           onClick={() => setCameraOn(!cameraOn)}
//         >
//           {cameraOn ? "Turn Camera Off" : "Turn Camera On"}
//         </button>
//         {cameraOn && (
//           <Webcam
//             ref={webcamRef}
//             muted={true}
//             className="mirror"
//             style={{
//               width: 640,
//               height: 480,
//             }}
//           />
//         )}
//         {/* Display the results */}
//         {emotion && (
//           <div className="mt-4">
//             <p className="text-xl font-bold">Emotion:</p>
//             <p className="text-2xl">{emotion.en}</p>
//             <p className="text-2xl">{emotion.ar}</p>
//           </div>
//         )}
//         {!cameraOn && (
//           <div className="mt-4">
//             <p className="text-xl font-bold">Camera is off</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Motion;
