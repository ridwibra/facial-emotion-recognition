import React, { useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import * as blazeface from "@tensorflow-models/blazeface";
import NextImage from "next/image";

const emotions = {
  0: { en: "Angry", ar: "غاضب" },
  1: { en: "Disgust", ar: "اشمئزاز" },
  2: { en: "Fear", ar: "خوف" },
  3: { en: "Happy", ar: "سعيد" },
  4: { en: "Neutral", ar: "محايد" },
  5: { en: "Sad", ar: "حزين" },
  6: { en: "Surprise", ar: "مفاجأة" },
};

function Still() {
  const [imgSrc, setImgSrc] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [pred, setPred] = useState();
  const [model, setModel] = useState();
  const [faceModel, setFaceModel] = useState(null);
  const [emotion, setEmotion] = useState(null);

  async function loadModel() {
    // Set the backend to use the CPU
    tf.setBackend("cpu");
    const loadedModel = await tf.loadLayersModel("/tfjs_model_new/model.json");
    setModel(loadedModel);
  }

  useEffect(() => {
    loadModel();
  }, []);

  useEffect(() => {
    async function loadFaceModel() {
      const faceModel = await blazeface.load();
      setFaceModel(faceModel);
    }
    loadFaceModel();
  }, []);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    // Check if the selected file is empty (canceled)
    if (!file) {
      // Display a message to the user
      alert("File upload canceled");
      return;
    }
    if (file && model && file.type.startsWith("image/")) {
      setIsLoading(true);
      setImgSrc(URL.createObjectURL(file));
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = async () => {
        // Detect faces using BlazeFace
        const predictions = await faceModel.estimateFaces(img);

        if (predictions.length > 0) {
          // Preprocess the image data
          const tensor = tf.browser
            .fromPixels(img)
            .resizeNearestNeighbor([48, 48])
            .mean(2)
            .toFloat()
            .expandDims()
            .expandDims(-1);

          // Make a prediction using the model
          const emotionPredictions = await model.predict(tensor).dataSync();

          // Get the predicted emotion in English and Arabic
          const index = tf.argMax(emotionPredictions).dataSync()[0];
          const predictedEmotion = emotions[index];

          // Update the state with the prediction result
          setPred(predictedEmotion);
          setIsLoading(false);
          setEmotion(null);
        } else {
          setPred(null);
          setEmotion({
            en: "No face detected",
            ar: "لم يتم العثور على وجه",
          });
        }
      };
    } else {
      setImgSrc(null);
      setPred(null);
      alert("Invalid file type. Please choose an image file.");
    }
  };

  const handleClearImage = () => {
    setImgSrc(null);
    setPred(null);
  };

  return (
    <div className="h-3/4 w-screen p-6 bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-medium text-black mb-4">Image/Photo</h1>
      <p className="text-gray-500 mb-4">
        Accepted file types: images of any kind
      </p>
      <label
        htmlFor="fileInput"
        className="text-blue-500 hover:text-blue-800 cursor-pointer mb-4"
      >
        Choose an image
      </label>
      <input
        id="fileInput"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      {pred && (
        <p className="text-gray-700 mb-4">
          Prediction: {pred && `${pred.en} / ${pred.ar}`}
        </p>
      )}
      {emotion && (
        <p className="text-gray-700 mb-4">
          {emotion.en} / {emotion.ar}
        </p>
      )}
      {imgSrc && (
        <>
          <NextImage
            src={imgSrc}
            alt="Chosen image"
            width={300}
            height={300}
            objectFit="contain"
            className="rounded-lg mb-4"
          />
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mb-4"
            onClick={handleClearImage}
          >
            Clear Image
          </button>
        </>
      )}
      {/* {isLoading && <p className="text-gray-500 mb-4">Loading...</p>} */}
    </div>
  );
}

export default Still;

///////////////////////////////////////////////////////////////////////////////////////////////
// import React, { useState, useEffect } from "react";
// import * as tf from "@tensorflow/tfjs";
// import * as blazeface from "@tensorflow-models/blazeface";
// import NextImage from "next/image";

// const emotions = {
//   0: { en: "Angry", ar: "غاضب" },
//   1: { en: "Disgust", ar: "اشمئزاز" },
//   2: { en: "Fear", ar: "خوف" },
//   3: { en: "Happy", ar: "سعيد" },
//   4: { en: "Neutral", ar: "محايد" },
//   5: { en: "Sad", ar: "حزين" },
//   6: { en: "Surprise", ar: "مفاجأة" },
// };

// function Still() {
//   const [imgSrc, setImgSrc] = useState();
//   const [isLoading, setIsLoading] = useState(false);
//   const [pred, setPred] = useState();
//   const [model, setModel] = useState();
//   const [faceModel, setFaceModel] = useState(null);
//   const [emotion, setEmotion] = useState(null);

//   async function loadModel() {
//     // Set the backend to use the CPU
//     tf.setBackend("cpu");
//     const loadedModel = await tf.loadLayersModel("/tfjs_model_new/model.json");
//     setModel(loadedModel);
//   }

//   useEffect(() => {
//     loadModel();
//   }, []);

//   useEffect(() => {
//     async function loadFaceModel() {
//       const faceModel = await blazeface.load();
//       setFaceModel(faceModel);
//     }
//     loadFaceModel();
//   }, []);

//   const handleFileChange = async (event) => {
//     const file = event.target.files[0];
//     // Check if the selected file is empty (canceled)
//     if (!file) {
//       // Display a message to the user
//       alert("File upload canceled");
//       return;
//     }
//     const acceptedExtensions = ["jpeg", "png", "jpg"];
//     const extension =
//       file && file.name ? file.name.split(".").pop().toLowerCase() : null;
//     if (file && model && acceptedExtensions.includes(extension)) {
//       setIsLoading(true);
//       setImgSrc(URL.createObjectURL(file));
//       const img = new Image();
//       img.src = URL.createObjectURL(file);
//       img.onload = async () => {
//         // Detect faces using BlazeFace
//         const predictions = await faceModel.estimateFaces(img);

//         if (predictions.length > 0) {
//           // Preprocess the image data
//           const tensor = tf.browser
//             .fromPixels(img)
//             .resizeNearestNeighbor([48, 48])
//             .mean(2)
//             .toFloat()
//             .expandDims()
//             .expandDims(-1);

//           // Make a prediction using the model
//           const emotionPredictions = await model.predict(tensor).dataSync();

//           // Update the state with the prediction result
//           setPred(emotions[tf.argMax(emotionPredictions).dataSync()[0]]);
//           setIsLoading(false);
//           setEmotion(null);
//         } else {
//           setPred(null);
//           setEmotion({
//             en: "No face detected",
//             ar: "لم يتم العثور على وجه",
//           });
//         }
//       };
//     } else {
//       setImgSrc(null);
//       setPred(null);
//       alert("Invalid file type. Please choose a JPEG, PNG, or JPG file.");
//     }
//   };

//   const handleClearImage = () => {
//     setImgSrc(null);
//     setPred(null);
//   };

//   return (
//     <div className="h-3/4 w-screen p-6 bg-gray-100 flex flex-col items-center justify-center">
//       <h1 className="text-3xl font-medium text-black mb-4">Image/Photo</h1>
//       <p className="text-gray-500 mb-4">
//         Accepted file extensions: .jpeg, .png, .jpg
//       </p>
//       <label
//         htmlFor="fileInput"
//         className="text-blue-500 hover:text-blue-800 cursor-pointer mb-4"
//       >
//         Choose an image
//       </label>
//       <input
//         id="fileInput"
//         type="file"
//         accept="image/jpeg, image/png, image/jpg"
//         className="hidden"
//         onChange={handleFileChange}
//       />
//       {pred && (
//         <p className="text-gray-700 mb-4">
//           Prediction: {pred && `${pred.en} / ${pred.ar}`}
//         </p>
//       )}
//       {emotion && (
//         <p className="text-gray-700 mb-4">
//           {emotion.en} / {emotion.ar}
//         </p>
//       )}
//       {imgSrc && (
//         <>
//           <NextImage
//             src={imgSrc}
//             alt="Chosen image"
//             width={300}
//             height={300}
//             objectFit="contain"
//             className="rounded-lg mb-4"
//           />
//           <button
//             className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mb-4"
//             onClick={handleClearImage}
//           >
//             Clear Image
//           </button>
//         </>
//       )}
//       {/* {isLoading && <p className="text-gray-500 mb-4">Loading...</p>} */}
//     </div>
//   );
// }

// export default Still;

/////////////////////////////////////////////////////////////////////////////

// // // without face detection model
// import React, { useState, useEffect } from "react";
// import * as tf from "@tensorflow/tfjs";
// import NextImage from "next/image";

// const emotions = {
//   0: { en: "anger", ar: "غضب" },
//   1: { en: "fear", ar: "خوف" },
//   2: { en: "happiness", ar: "سعادة" },
//   3: { en: "sadness", ar: "حزن" },
//   4: { en: "surprise", ar: "دهشة" },
//   5: { en: "neutral", ar: "محايد" },
// };

// function Still() {
//   const [imgSrc, setImgSrc] = useState();
//   const [isLoading, setIsLoading] = useState(false);
//   const [pred, setPred] = useState();
//   const [model, setModel] = useState();

//   async function loadModel() {
//     // Set the backend to use the CPU
//     tf.setBackend("cpu");
//     const loadedModel = await tf.loadLayersModel("/tfjs_model_new/model.json");
//     setModel(loadedModel);
//   }

//   useEffect(() => {
//     loadModel();
//   }, []);

//   const handleFileChange = async (event) => {
//     const file = event.target.files[0];
//     const acceptedExtensions = ["jpeg", "png", "jpg"];
//     const extension = file.name.split(".").pop().toLowerCase();
//     if (file && model && acceptedExtensions.includes(extension)) {
//       setIsLoading(true);
//       setImgSrc(URL.createObjectURL(file));
//       const img = new Image();
//       img.src = URL.createObjectURL(file);
//       img.onload = async () => {
//         // Preprocess the image data
//         const tensor = tf.browser
//           .fromPixels(img)
//           .resizeNearestNeighbor([48, 48])
//           .mean(2)
//           .toFloat()
//           .expandDims()
//           .expandDims(-1);
//         // Make a prediction using the model
//         const emotionPredictions = await model.predict(tensor).dataSync();
//         // Update the state with the prediction result
//         setPred(emotions[tf.argMax(emotionPredictions).dataSync()[0]]);
//         setIsLoading(false);
//       };
//     } else {
//       setImgSrc(null);
//       setPred(null);
//       alert("Invalid file type. Please choose a JPEG, PNG, or JPG file.");
//     }
//   };

//   const handleClearImage = () => {
//     setImgSrc(null);
//     setPred(null);
//   };

//   return (
//     <div className="h-3/4 w-screen p-6 bg-gray-100 flex flex-col items-center justify-center">
//       <h1 className="text-3xl font-medium text-black mb-4">Image/Photo</h1>
//       <p className="text-gray-500 mb-4">
//         Accepted file extensions: .jpeg, .png, .jpg
//       </p>
//       <label
//         htmlFor="fileInput"
//         className="text-blue-500 hover:text-blue-800 cursor-pointer mb-4"
//       >
//         Choose an image
//       </label>
//       <input
//         id="fileInput"
//         type="file"
//         accept="image/jpeg, image/png, image/jpg"
//         className="hidden"
//         onChange={handleFileChange}
//       />
//       {pred && (
//         <p className="text-gray-700 mb-4">
//           Prediction: {pred && `${pred.en} / ${pred.ar}`}
//         </p>
//       )}
//       {imgSrc && (
//         <>
//           <NextImage
//             src={imgSrc}
//             alt="Chosen image"
//             width={300}
//             height={300}
//             objectFit="contain"
//             className="rounded-lg mb-4"
//           />
//           <button
//             className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mb-4"
//             onClick={handleClearImage}
//           >
//             Clear Image
//           </button>
//         </>
//       )}
//       {/* {isLoading && <p className="text-gray-500 mb-4">Loading...</p>} */}
//     </div>
//   );
// }

// export default Still;
