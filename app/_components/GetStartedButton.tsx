'use client';

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function GetStartedButton() {
    const { user, signInWithGoogle } = useAuth();

    return user ? (
        <Link href="/dashboard">
            <Button size="lg" className="bg-gray-800 hover:bg-black text-white">
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
        </Link>
    ) : (
        <Button size="lg" className="bg-gray-800 hover:bg-black text-white" onClick={signInWithGoogle}>
            Get started
            <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
    );
}