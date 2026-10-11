# Photo cut-out tool

Used by `cut.js` to remove the background from wrestler photos, on the device. Downloaded only the first time a photo is cut out.

- `u2netp.onnx` — U²-Netp salient-object model (Apache-2.0), from https://github.com/xuebinqin/U-2-Net via the rembg releases.
- `ort.wasm.min.js`, `ort-wasm-simd-threaded.mjs`, `ort-wasm-simd-threaded.wasm` — onnxruntime-web 1.20.1 (MIT), https://github.com/microsoft/onnxruntime.
- `person.onnx` — MediaPipe Selfie Segmentation (Apache-2.0, from the @mediapipe/selfie_segmentation package), converted from TFLite to ONNX (its one custom transpose-convolution op replaced by a standard ConvTranspose; outputs match the original within 1e-4). Used alongside U²-Netp so clothing isn't dropped.
