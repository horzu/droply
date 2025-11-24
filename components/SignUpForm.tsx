"use client";

import { useForm } from "react-hook-form";
import { useSignUp } from "@clerk/nextjs";
import { z } from "zod";
import { signUpSchema } from "@/schemas/signUpSchema";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export default function SignUpForm() {
  const [verifying, setVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signUp, isLoaded, setActive } = useSignUp();

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    if (!isLoaded) return;
    setIsSubmitting(true);
    setAuthError(null);
    try {
      await signUp.create({
        emailAddress: data.email,
        password: data.password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerifying(true);
    } catch (error: any) {
      console.log("Sign up error:", error);
      setAuthError(
        error.errors?.[0]?.message ||
          "An unknown error occurred during signup. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerificationSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;
    setIsSubmitting(true);
    setAuthError(null);
    try {
      const verificationResult = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });
      console.log(verificationResult);
      if (verificationResult.status === "complete") {
        await setActive({ session: verificationResult.createdSessionId });
        // User is now signed in
        router.push("/dashboard"); // Redirect to a welcome page or dashboard
      } else {
        console.log("Verification not complete:", verificationResult);
        setVerificationError(
          "Verification failed. Please check the code and try again."
        );
      }
    } catch (error: any) {
      console.log("Verification error:", error);
      setVerificationError(
        error.errors?.[0]?.message ||
          "An unknown error occurred during verification. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (verifying) {
    return (
      <Card className="w-full max-w-md border border-default-200 bg-default-50 shadow-xl">
        <CardHeader className="flex flex-col gap-1 items-center pb-2">
          <h1 className="text-2xl font-bold text-default-900">
            Verify Your Email
          </h1>
          <p className="text-default-500 text-center">
            We've sent a verification code to your email.
          </p>
        </CardHeader>

        <CardBody className="py-6">
          {verificationError && (
            <div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{verificationError}</span>
            </div>
          )}

          <form onSubmit={handleVerificationSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="verificationCode"
                className="block text-sm font-medium text-default-700"
              >
                Verification Code
              </label>
              <input
                id="verificationCode"
                type="text"
                placeholder="Enter the 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full px-4 py-2 border border-default-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
                autoFocus
              />
            </div>
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {isSubmitting ? "Verifying..." : "Verify Email"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-default-500">Didn't receive the code?</p>
            <button
              onClick={async () => {
                if (signUp) {
                  await signUp.prepareEmailAddressVerification({
                    strategy: "email_code",
                  });
                }
              }}
              className="text-sm text-primary-600 hover:underline"
            >
              Resend Code
            </button>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full max-w-md border border-default-200 bg-default-50 shadow-xl">
        <CardHeader className="flex flex-col gap-1 items-center pb-2">
          <h1 className="text-2xl font-bold text-default-900">
            Create an Account
          </h1>
          <p className="text-default-500 text-center">
            Sign up to get started with Droply!
          </p>
        </CardHeader>

        <Divider />

        <CardBody className="py-6">
          {authError && (
            <div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{authError}</span>
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-default-700"
              >
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                startContent={<Mail className="w-5 h-5 text-default-400" />}
                isInvalid={!!errors.email}
                errorMessage={errors.email?.message}
                {...register("email")}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.email ? "border-danger-500" : "border-default-300"
                }`}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-default-700"
              >
                Password
              </label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                startContent={<Lock className="w-5 h-5 text-default-400" />}
                endContent={
                  <Button
                    isIconOnly
                    variant="light"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-0"
                    type="button"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-default-400" />
                    ) : (
                      <Eye className="w-5 h-5 text-default-400" />
                    )}
                  </Button>
                }
                isInvalid={!!errors.password}
                errorMessage={errors.password?.message}
                {...register("password")}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.passwordConfirmation
                    ? "border-danger-500"
                    : "border-default-300"
                }`}
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="passwordConfirmation"
                className="block text-sm font-medium text-default-700"
              >
                Confirm Password
              </label>
              <Input
                id="passwordConfirmation"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm your password"
                {...register("passwordConfirmation")}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.passwordConfirmation
                    ? "border-danger-500"
                    : "border-default-300"
                }`}
                startContent={<Lock className="w-5 h-5 text-default-400" />}
                endContent={
                  <Button
                    isIconOnly
                    variant="light"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-0"
                    type="button"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5 text-default-400" />
                    ) : (
                      <Eye className="w-5 h-5 text-default-400" />
                    )}
                  </Button>
                }
                isInvalid={!!errors.passwordConfirmation}
                errorMessage={errors.passwordConfirmation?.message}
              />
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-success-500 mt-1" />
                <p className="text-sm text-default-600">
                  By signing up, you agree to our Terms of Service and Privacy
                  Policy.
                </p>
              </div>
            </div>

            <Button
              type="submit"
              color="primary"
              className="w-full py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50"
              isLoading={isSubmitting}
            >
              {isSubmitting ? "Signing Up..." : "Sign Up"}
            </Button>
          </form>
        </CardBody>
        <Divider />
        <CardFooter className="flex justify-center py-4">
          <p className="text-sm text-default-600">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-primary-600 hover:underline">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </>
  );
}
