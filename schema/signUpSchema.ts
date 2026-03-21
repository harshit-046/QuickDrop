import * as z from "zod";

export const signUpSchema = z.object({
    password: z.string().min(1,{message: "Password is required"}).min(8,{message: "Password must be minimum of 8 characters"}),
    passwordConfirmation: z.string().min(1,{message: "Please confirm your password"}).min(8,{message: "Password must be minimum of 8 characters"}),
    email: z.string().min(1,{message: "Email is required"}).email({message: "Please provide an valid email"})
}).refine((data) => (data.password===data.passwordConfirmation), {
    message: "Password do not match",
    path: ["passwordConfirmation"]
})
