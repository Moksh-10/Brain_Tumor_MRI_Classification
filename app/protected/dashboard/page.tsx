// "use client"

// import type React from "react"

// import { useState, useRef } from "react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// interface PredictionResult {
//   predicted_class: string
//   confidence: number
//   class_probabilities: Record<string, number>
//   grad_cam_data: string
// }

// export default function DashboardPage() {
//   const [file, setFile] = useState<File | null>(null)
//   const [preview, setPreview] = useState<string | null>(null)
//   const [loading, setLoading] = useState(false)
//   const [result, setResult] = useState<PredictionResult | null>(null)
//   const [error, setError] = useState<string | null>(null)
//   const fileInputRef = useRef<HTMLInputElement>(null)

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const selectedFile = e.target.files?.[0]
//     if (selectedFile) {
//       setFile(selectedFile)
//       const reader = new FileReader()
//       reader.onload = (event) => {
//         setPreview(event.target?.result as string)
//       }
//       reader.readAsDataURL(selectedFile)
//       setError(null)
//       setResult(null)
//     }
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!file) {
//       setError("Please select an image")
//       return
//     }

//     setLoading(true)
//     setError(null)

//     try {
//       const formData = new FormData()
//       formData.append("file", file)

//       const response = await fetch("/api/predict", {
//         method: "POST",
//         body: formData,
//       })

//       if (!response.ok) {
//         throw new Error("Prediction failed")
//       }

//       const data = await response.json()
//       setResult(data)
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "An error occurred")
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="grid gap-6">
//       <div>
//         <h1 className="text-4xl font-bold text-foreground mb-2">Upload MRI Image</h1>
//         <p className="text-muted-foreground">Upload a brain MRI scan for classification and Grad-CAM visualization</p>
//       </div>

//       <div className="grid md:grid-cols-2 gap-6">
//         {/* Upload Section */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Upload Image</CardTitle>
//             <CardDescription>JPG, PNG up to 10MB</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//               <div
//                 className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50"
//                 onClick={() => fileInputRef.current?.click()}
//               >
//                 <input
//                   ref={fileInputRef}
//                   type="file"
//                   accept="image/*"
//                   className="hidden"
//                   onChange={handleFileChange}
//                   disabled={loading}
//                 />
//                 {preview ? (
//                   <div className="relative w-full h-64">
//                     <img src={preview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-contain" />
//                   </div>
//                 ) : (
//                   <div className="py-12">
//                     <p className="text-muted-foreground">Click or drag image here</p>
//                   </div>
//                 )}
//               </div>

//               {error && <p className="text-sm text-red-500">{error}</p>}

//               <Button type="submit" disabled={!file || loading} className="w-full">
//                 {loading ? "Processing..." : "Predict"}
//               </Button>
//             </form>
//           </CardContent>
//         </Card>

//         {/* Results Section */}
//         {result && (
//           <Card>
//             <CardHeader>
//               <CardTitle>Prediction Result</CardTitle>
//             </CardHeader>
//             <CardContent className="flex flex-col gap-4">
//               <div>
//                 <p className="text-sm text-muted-foreground">Predicted Class</p>
//                 <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 capitalize">
//                   {result.predicted_class}
//                 </p>
//               </div>

//               <div>
//                 <p className="text-sm text-muted-foreground">Confidence</p>
//                 <div className="flex items-center gap-2">
//                   <div className="flex-1 bg-muted rounded-full h-2">
//                     <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${result.confidence * 100}%` }} />
//                   </div>
//                   <span className="text-sm font-semibold">{(result.confidence * 100).toFixed(2)}%</span>
//                 </div>
//               </div>

//               <div>
//                 <p className="text-sm text-muted-foreground mb-3">Class Probabilities</p>
//                 <div className="space-y-2">
//                   {Object.entries(result.class_probabilities).map(([cls, prob]) => (
//                     <div key={cls} className="flex items-center gap-2">
//                       <span className="text-sm capitalize w-20">{cls}</span>
//                       <div className="flex-1 bg-muted rounded h-2">
//                         <div className="bg-indigo-600 h-2 rounded" style={{ width: `${(prob as number) * 100}%` }} />
//                       </div>
//                       <span className="text-xs text-muted-foreground w-12 text-right">
//                         {((prob as number) * 100).toFixed(1)}%
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         )}
//       </div>

//       {/* Grad-CAM Visualization */}
//       {result && preview && (
//         <Card>
//           <CardHeader>
//             <CardTitle>Grad-CAM Visualization</CardTitle>
//             <CardDescription>Shows which regions of the image influenced the prediction</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="grid md:grid-cols-2 gap-6">
//               <div>
//                 <p className="text-sm font-semibold mb-2">Original Image</p>
//                 <div className="relative w-full h-80 bg-muted rounded-lg overflow-hidden">
//                   <img src={preview || "/placeholder.svg"} alt="Original" className="w-full h-full object-contain" />
//                 </div>
//               </div>
//               <div>
//                 <p className="text-sm font-semibold mb-2">Grad-CAM Heatmap</p>
//                 <div className="relative w-full h-80 bg-muted rounded-lg overflow-hidden">
//                   {/* <p className="text-center text-muted-foreground py-40">Heatmap visualization</p> */}
//                   <img
//                     src={`data:image/png;base64,${result.grad_cam_image}`}
//                     alt="Grad-CAM Heatmap"
//                     className="w-full h-full object-contain"
//                   />

//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   )
// }

"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PredictionResult {
  predicted_class: string;
  confidence: number;
  class_probabilities: Record<string, number>;
  grad_cam_image: string;
}

export default function DashboardPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select an image");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Prediction failed");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Upload MRI Image
        </h1>
        <p className="text-muted-foreground">
          Upload a brain MRI scan for classification and Grad-CAM visualization
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Image</CardTitle>
            <CardDescription>JPG, PNG up to 10MB</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div
                className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={loading}
                />
                {preview ? (
                  <div className="relative w-full h-64">
                    <img
                      src={preview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="py-12">
                    <p className="text-muted-foreground">
                      Click or drag image here
                    </p>
                  </div>
                )}
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button
                type="submit"
                disabled={!file || loading}
                className="w-full"
              >
                {loading ? "Processing..." : "Predict"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results Section */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Prediction Result</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Predicted Class</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 capitalize">
                  {result.predicted_class}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Confidence</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${result.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold">
                    {(result.confidence * 100).toFixed(2)}%
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-3">
                  Class Probabilities
                </p>
                <div className="space-y-2">
                  {Object.entries(result.class_probabilities).map(
                    ([cls, prob]) => (
                      <div key={cls} className="flex items-center gap-2">
                        <span className="text-sm capitalize w-20">{cls}</span>
                        <div className="flex-1 bg-muted rounded h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded"
                            style={{ width: `${(prob as number) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-12 text-right">
                          {((prob as number) * 100).toFixed(1)}%
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Grad-CAM Visualization */}
      {result && preview && (
        <Card>
          <CardHeader>
            <CardTitle>Grad-CAM Visualization</CardTitle>
            <CardDescription>
              Shows which regions of the image influenced the prediction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-semibold mb-2">Original Image</p>
                <div className="relative w-full h-80 bg-muted rounded-lg overflow-hidden">
                  <img
                    src={preview || "/placeholder.svg"}
                    alt="Original"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold mb-2">Grad-CAM Heatmap</p>
                <div className="relative w-full h-80 bg-muted rounded-lg overflow-hidden">
                  {/* <p className="text-center text-muted-foreground py-40">Heatmap visualization</p> */}
                  <img
                    src={`data:image/png;base64,${result.grad_cam_image}`}
                    alt="Grad-CAM Heatmap"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

