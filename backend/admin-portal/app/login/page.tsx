import LoginForm from "./LoginForm";
import Image from "next/image";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-6">
      <section className="w-full max-w-5xl flex flex-col md:flex-row items-stretch justify-center gap-10">
        <div className="bg-[#B8DEE2] p-10 md:p-14 flex-1 rounded-[44px] flex flex-col justify-center">
          <h1 className=" font-medium text-5xl leading-tight mb-2 text-center bg-gradient-to-r from-[#379f4c] to-[#44a7ab] bg-clip-text text-transparent">
            Welcome back!
          </h1>
          <p className="text-[#2E7D4F]/90 text-sm mb-2 text-center">
            Learn to Empower. Empower to Hope.
          </p>
          <p className="text-[#7E8F8F] text-sm mb-4 text-center">
            Sign in to upload videos and data to InspireEd
          </p>

          <div className="max-w-[360px]">
            <LoginForm />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-6">
            <Image
              src="/assets/logo-transparentbg.png"
              alt="InspirEd"
              width={260}
              height={260}
              priority
              className="h-auto w-[320px] md:w-[360px]"
            />
            <div className="font-medium text-6xl tracking-wide">
              <span className="text-[#44a7ab]">Inspir</span>
              <span className="text-[#379f4c]">Ed</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

