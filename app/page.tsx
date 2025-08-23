import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Code, Gem, GitBranch } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "./_components/Navbar";
import GetStartedButton from "./_components/GetStartedButton";

export default function Home() {
  const features = [
    {
      icon: <BookOpen className="h-8 w-8 text-blue-500 dark:text-blue-400" />,
      title: "25+ templates",
      description: "Responsive, and mobile-first project on the web"
    },
    {
      icon: <GitBranch className="h-8 w-8 text-green-500 dark:text-green-400" />,
      title: "Customizable",
      description: "Components are easily customized and extendable"
    },
    {
      icon: <Code className="h-8 w-8 text-purple-500 dark:text-purple-400" />,
      title: "Free to Use",
      description: "Every component and plugin is well documented"
    },
    {
      icon: <Gem className="h-8 w-8 text-red-500 dark:text-red-400" />,
      title: "24/7 Support",
      description: "Contact us 24 hours a day, 7 days a week"
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-200 min-h-screen overflow-x-hidden">
      <Navbar />

      <main className="container mx-auto px-6 pt-24 pb-16 md:pt-32 md:pb-20 text-center">
        <Link 
            href="#" 
            className="inline-flex items-center gap-2 border border-green-300 dark:border-green-700 rounded-full px-3 py-1 text-sm mb-6 bg-green-50 dark:bg-green-950 hover:bg-green-100 dark:hover:bg-green-900 transition-colors"
        >
          From Idea to Code in Seconds →
        </Link>
        
        <h1 className="text-5xl md:text-7xl font-bold leading-tight">
          Convert Wireframe To
          <br />
          <span className="bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full px-4 mt-2 inline-block">Code</span>
        </h1>

        <p className="max-w-2xl mx-auto mt-6 text-gray-600 dark:text-gray-400 text-lg">
          Revolutionize your content creation with our AI-powered app, delivering engaging and high-quality apps in seconds.
        </p>

        <div className="mt-8 flex justify-center">
            <GetStartedButton />
        </div>
      </main>

      <section className="container mx-auto px-6 pb-24 flex justify-center">
        <Image 
            src="/Wireframetocode.png" 
            alt="Diagram showing a wireframe converting to code" 
            width={800} 
            height={400} 
            className="border rounded-lg bg-white dark:bg-gray-900 p-4 shadow-sm"
        />
      </section>

      <section className="relative w-full py-12">
        <div className="w-[95%] mx-auto py-8 rounded-2xl shadow-lg border border-white/20 dark:border-gray-800/20 bg-white/30 dark:bg-gray-900/30 backdrop-blur-md">
            <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
                <ul className="flex items-center justify-center md:justify-start animate-marquee">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-4 mx-8 flex-shrink-0" style={{width: '300px'}}>
                        <div className="mt-1">{feature.icon}</div>
                        <div>
                          <h3 className="font-semibold text-lg">{feature.title}</h3>
                          <p className="text-sm text-gray-700 dark:text-gray-400">{feature.description}</p>
                          <Link href="#" className="text-sm font-semibold text-blue-600 mt-1 inline-block">Learn more &rarr;</Link>
                        </div>
                      </li>
                    ))}
                    {features.map((feature, index) => (
                      <li key={`duplicate-${index}`} className="flex items-start gap-4 mx-8 flex-shrink-0" style={{width: '300px'}}>
                        <div className="mt-1">{feature.icon}</div>
                        <div>
                          <h3 className="font-semibold text-lg">{feature.title}</h3>
                          <p className="text-sm text-gray-700 dark:text-gray-400">{feature.description}</p>
                          <Link href="#" className="text-sm font-semibold text-blue-600 mt-1 inline-block">Learn more &rarr;</Link>
                        </div>
                      </li>
                    ))}
                </ul>
            </div>
        </div>
      </section>

      <div className="h-24"></div> 
    </div>
  );
}