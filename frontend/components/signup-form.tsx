import { hashPassword } from "@/lib/hashPassword";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"


export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {


    async function saveAction(formData: FormData) {
        'use server'
        const email = String(formData.get("email") || "");
        const password = String(formData.get("password") || "");
        const username = email.split("@")[0];
        console.log("email, password, username", email,password,username)
        

        const hashedPassword = await hashPassword(password);
        console.log(formData)

        const res = await fetch("https://min-webb-app-ardhcjbkhgfkdzd2.northeurope-01.azurewebsites.net/register/new", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        });
    }

   
  return (
    
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Skapa Konto</CardTitle>
          <CardDescription>
            Skriv in dina uppgifter nedan för att skapa ett konto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveAction}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Epost</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="epost@epost.se"
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Lösenord</FieldLabel>
                  
                </div>
                <Input id="password" type="password" name="password" required />
              </Field>
              <Field>
                <Button type="submit">Skapa konto</Button>
                
               
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
