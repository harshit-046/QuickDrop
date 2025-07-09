import * as z from "zod";

export const signUpSchema = z.object({
    email: z.string().min(1,{message: "Email is required"}).email({message: "Please provide an valid email"}),
    password: z.string().min(1,{message: "Password is required"}).min(8,{message: "Password must be minimum of 8 characters"})
})