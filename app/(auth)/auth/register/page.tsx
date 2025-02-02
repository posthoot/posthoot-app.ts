import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const registerFormSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  }).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

  const registerForm = useForm<z.infer<typeof registerFormSchema>>({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur",
    resolver: zodResolver(registerFormSchema),
  });

  const { data: session } = useSession();

  if (session) {
    redirect("/");
  }

  const handleRegister = async (data: z.infer<typeof registerFormSchema>) => {
    // Handle registration logic here
    // For example, call an API to register the user
    console.log("Registering user:", data);
  };

  return (
    <div className="relative z-[9999] gap-8 p-8 text-center">
      <span className="text-3xl">
        Create an Account
      </span>
      <Form {...registerForm}>
        <form className="mt-8" onSubmit={registerForm.handleSubmit(handleRegister)}>
          <FormField
            control={registerForm.control}
            name="email"
            render={({ field }) => (
              <FormItem className="my-4">
                <FormControl>
                  <Input
                    placeholder="Email"
                    className="Field_input__1L5wD h-[50px]"
                    type="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={registerForm.control}
            name="password"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormControl>
                  <Input
                    placeholder="Password"
                    className="Field_input__1L5wD h-[50px]"
                    type="password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={registerForm.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormControl>
                  <Input
                    placeholder="Confirm Password"
                    className="Field_input__1L5wD h-[50px]"
                    type="password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <button className="button w-full" type="submit">
            Register
          </button>
        </form>
      </Form>
    </div>
  );
}
