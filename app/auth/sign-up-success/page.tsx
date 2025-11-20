import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card className="border-green-200 dark:border-green-900">
            <CardHeader>
              <CardTitle className="text-2xl text-green-600 dark:text-green-400">Account Created!</CardTitle>
              <CardDescription>Check your email to confirm your account</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                We've sent a confirmation email to your inbox. Please click the link in the email to verify your account
                before logging in.
              </p>
              <Link href="/auth/login">
                <Button className="w-full">Back to Login</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
