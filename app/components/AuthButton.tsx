"use client";

import { useState, useEffect, useRef } from "react";
import { FaUser, FaSignOutAlt, FaTimes } from "react-icons/fa";
import { useSupabase } from "@/app/providers/SupabaseProvider";
import { toast } from "sonner";
import HCaptcha from "@hcaptcha/react-hcaptcha";

const AuthButton = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const captchaRef = useRef<HCaptcha>(null);
  const { supabase } = useSupabase();
  const [user, setUser] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      if (!supabase) return;

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setUser(data.session.user);
      }
    };

    checkUser();

    // Check for dark mode
    if (typeof window !== "undefined") {
      setIsDarkMode(document.documentElement.classList.contains("dark"));

      // Listen for theme changes
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === "class") {
            setIsDarkMode(document.documentElement.classList.contains("dark"));
          }
        });
      });

      observer.observe(document.documentElement, { attributes: true });
      return () => observer.disconnect();
    }
  }, [supabase]);

  // Reset form when switching between login and signup
  useEffect(() => {
    // Reset captcha when switching to signup
    if (!isLogin && captchaRef.current) {
      captchaRef.current.resetCaptcha();
    }
    setCaptchaToken("");
  }, [isLogin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      setUser(data.user);
      setShowAuthModal(false);
      toast.success("Logged in successfully!");
    }
  };

  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token);
  };

  const verifyCaptcha = async (token: string) => {
    try {
      const response = await fetch("/api/verify-captcha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error("Error verifying captcha:", error);
      return false;
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }

    // Validate captcha for signup
    if (!isLogin && !captchaToken) {
      toast.error("Please complete the captcha verification");
      return;
    }

    setLoading(true);

    try {
      // Only verify captcha for signup, not for login
      if (!isLogin) {
        const isCaptchaValid = await verifyCaptcha(captchaToken);
        if (!isCaptchaValid) {
          setLoading(false);
          toast.error("Captcha verification failed. Please try again.");
          if (captchaRef.current) {
            captchaRef.current.resetCaptcha();
          }
          return;
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      // Create a profile after signup
      if (data.user) {
        await supabase.from("profiles").insert({
          id: data.user.id,
          username,
          created_at: new Date().toISOString(),
        });
      }

      setLoading(false);

      if (error) {
        toast.error(error.message);
        if (captchaRef.current) {
          captchaRef.current.resetCaptcha();
        }
      } else {
        setShowAuthModal(false);
        toast.success(
          "Signed up successfully! Please check your email for verification."
        );
      }
    } catch (err) {
      setLoading(false);
      toast.error("An error occurred during signup. Please try again.");
      console.error("Signup error:", err);
      if (captchaRef.current) {
        captchaRef.current.resetCaptcha();
      }
    }
  };

  const handleLogout = async () => {
    if (!supabase) return;

    await supabase.auth.signOut();
    setUser(null);
    toast.success("Logged out successfully!");
  };

  return (
    <>
      <button
        onClick={() => (user ? handleLogout() : setShowAuthModal(true))}
        className={`p-2 rounded-full flex items-center transition-colors focus:outline-none focus:ring-2 ${
          isDarkMode
            ? "bg-gray-800 bg-opacity-50 hover:bg-opacity-70 focus:ring-accent"
            : "bg-light-secondary hover:bg-opacity-90 focus:ring-light-accent"
        }`}
        aria-label={user ? "Log out" : "Log in or sign up"}
      >
        {user ? (
          <>
            <FaSignOutAlt
              className={`w-5 h-5 ${
                isDarkMode ? "text-red-300" : "text-light-error"
              }`}
            />
            <span
              className={`ml-2 hidden md:inline text-sm ${
                isDarkMode ? "text-white" : "text-light-text"
              }`}
            >
              Logout
            </span>
          </>
        ) : (
          <>
            <FaUser
              className={`w-5 h-5 ${
                isDarkMode ? "text-accent" : "text-light-accent"
              }`}
            />
            <span
              className={`ml-2 hidden md:inline text-sm ${
                isDarkMode ? "text-white" : "text-light-text"
              }`}
            >
              Login / Signup
            </span>
          </>
        )}
      </button>

      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div
            className={`p-6 rounded-lg w-full max-w-md ${
              isDarkMode
                ? "bg-gray-900"
                : "bg-light-primary border border-light-secondary"
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2
                className={`text-2xl font-bold ${
                  isDarkMode ? "text-white" : "text-light-text"
                }`}
              >
                {isLogin ? "Login" : "Sign Up"}
              </h2>
              <button
                onClick={() => setShowAuthModal(false)}
                className={`p-2 rounded-full ${
                  isDarkMode
                    ? "text-gray-400 hover:text-white hover:bg-gray-700"
                    : "text-light-text hover:text-light-accent hover:bg-light-secondary"
                }`}
                aria-label="Close modal"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={isLogin ? handleLogin : handleSignup}>
              {!isLogin && (
                <div className="mb-4">
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? "text-white" : "text-light-text"
                    }`}
                  >
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`w-full p-2 rounded ${
                      isDarkMode
                        ? "bg-gray-800 text-white"
                        : "bg-white border border-light-secondary text-light-text"
                    }`}
                    required
                  />
                </div>
              )}

              <div className="mb-4">
                <label
                  className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? "text-white" : "text-light-text"
                  }`}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full p-2 rounded ${
                    isDarkMode
                      ? "bg-gray-800 text-white"
                      : "bg-white border border-light-secondary text-light-text"
                  }`}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? "text-white" : "text-light-text"
                  }`}
                >
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full p-2 rounded ${
                    isDarkMode
                      ? "bg-gray-800 text-white"
                      : "bg-white border border-light-secondary text-light-text"
                  }`}
                  required
                  minLength={6}
                />
              </div>

              {/* hCaptcha - only show for signup */}
              {!isLogin && (
                <div className="mb-4 flex justify-center">
                  <HCaptcha
                    sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY || ""}
                    onVerify={handleCaptchaVerify}
                    ref={captchaRef}
                    theme={isDarkMode ? "dark" : "light"}
                  />
                </div>
              )}

              <div className="flex justify-between items-center">
                <button
                  type="submit"
                  className={`py-2 px-4 rounded ${
                    isDarkMode
                      ? "btn-primary"
                      : "bg-light-accent text-white hover:bg-opacity-90"
                  }`}
                  disabled={loading}
                >
                  {loading ? "Loading..." : isLogin ? "Login" : "Sign Up"}
                </button>

                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className={`text-sm ${
                    isDarkMode ? "text-accent" : "text-light-accent"
                  }`}
                >
                  {isLogin
                    ? "Need an account? Sign up"
                    : "Already have an account? Login"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AuthButton;
