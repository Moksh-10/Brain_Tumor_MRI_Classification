import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function HistoryPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: predictions, error } = await supabase
    .from("predictions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching predictions:", error)
  }

  const predictionList = predictions || []

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Prediction History</h1>
        <p className="text-muted-foreground">View all your previous predictions and results</p>
      </div>

      {predictionList.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No predictions yet</p>
              <Link href="/protected/dashboard">
                <Button>Make Your First Prediction</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {predictionList.map((prediction) => (
            <Card key={prediction.id}>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-4 gap-4 items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Filename</p>
                    <p className="font-medium">{prediction.image_filename}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Prediction</p>
                    <p className="font-semibold capitalize text-blue-600 dark:text-blue-400">
                      {prediction.predicted_class}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Confidence</p>
                    <p className="font-semibold">{(prediction.confidence * 100).toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="text-sm">{new Date(prediction.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
