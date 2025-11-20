import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { exec } from "child_process"
import { promisify } from "util"
import path from "path"

const execAsync = promisify(exec)

// This route handles image predictions using the Grad-CAM model
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert file to base64
    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString("base64")

    const pythonPath = path.join(process.cwd(), "scripts", "predict.py")
    const pythonExecutable = process.env.PYTHON_PATH || "python3"

    try {
      const { stdout } = await execAsync(`${pythonExecutable} "${pythonPath}" "${base64}"`, {
        timeout: 30000, // 30 second timeout
        maxBuffer: 50 * 1024 * 1024, // 50MB buffer for large responses
      })

      const result = JSON.parse(stdout)

      // Store in database
      const { error: insertError } = await supabase.from("predictions").insert({
        user_id: user.id,
        image_filename: file.name,
        image_url: `data:${file.type};base64,${base64}`,
        predicted_class: result.predicted_class,
        confidence: result.confidence,
        grad_cam_data: result.grad_cam_image,
        class_probabilities: result.class_probabilities,
      })

      if (insertError) {
        console.error("Database error:", insertError)
        return NextResponse.json({ error: "Failed to save prediction" }, { status: 500 })
      }

      return NextResponse.json(result)
    } catch (execError: any) {
      console.error("Python execution error:", execError.message)
      return NextResponse.json({ error: "Prediction failed: " + execError.message }, { status: 500 })
    }
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
