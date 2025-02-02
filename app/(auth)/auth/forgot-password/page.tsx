"use client";

import { Input } from "@/components/ui/input";
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

export default function ForgotPasswordPage() {
  // 🔐 Form schema for forgot password
  const forgotPasswordSchema = z.object({
    email: z.string().email(),
  });

  const forgotPasswordForm = useForm<z.infer<typeof forgotPasswordSchema>>({
    defaultValues: {
      email: "",
    },
    mode: "onBlur",
    resolver: zodResolver(forgotPasswordSchema),
  });

  // 📧 Handle forgot password submission
  const handleForgotPassword = async (data: z.infer<typeof forgotPasswordSchema>) => {
    // TODO: Implement forgot password logic
    console.log("Reset password for:", data.email);
  };

  return (
    <div className="relative z-[9999] w-96 gap-8 p-8 text-center">
      <div className="EntryScreen_logo__qjIqU">
        <img
          alt=""
          loading="lazy"
          width="24"
          height="24"
          decoding="async"
          data-nimg="1"
          className="Image_image__5RgVm Image_loaded__qmdFe"
          src="/assets/star.svg"
        />
      </div>
      <span className="text-3xl">
        Forgot Password? 🔑 <br />
        No worries!
      </span>
      <Form {...forgotPasswordForm}>
        <form className="mt-8" onSubmit={forgotPasswordForm.handleSubmit(handleForgotPassword)}>
          <FormField
            control={forgotPasswordForm.control}
            name="email"
            render={({ field }) => (
              <FormItem className="my-4">
                <FormControl>
                  <Input
                    placeholder="Enter your email"
                    className="Field_input__1L5wD h-[50px]"
                    type="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-100" />
              </FormItem>
            )}
          />
          <button className="button w-full" type="submit">
            Reset Password
          </button>
        </form>
      </Form>
    </div>
  );
}
