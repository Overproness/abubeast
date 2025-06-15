import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function useRequireAuth(redirectTo = "/auth/login") {
  const { isAuthenticated, loading, authChecked } = useAuth();
  const router = useRouter();
  const [redirected, setRedirected] = useState(false);
  const retryCount = useRef(0);
  const maxRetries = 3;

  useEffect(() => {
    let isMounted = true;
    let timeoutId = null;

    // Set a maximum timeout for authentication check
    timeoutId = setTimeout(() => {
      if (isMounted && !redirected) {
        console.log(
          "[useRequireAuth] Auth check timeout reached, checking for token evidence"
        );

        // Last-ditch effort - check for token cookie
        const cookies = document.cookie.split(";").map((c) => c.trim());
        const hasTokenCookie = cookies.some((c) => c.startsWith("token="));

        if (!hasTokenCookie) {
          console.log("[useRequireAuth] No token found, redirecting");
          setRedirected(true);
          router.push(
            `${redirectTo}?from=${window.location.pathname}&reason=timeout`
          );
        }
      }
    }, 7000); // 7 seconds timeout

    const checkAuth = () => {
      if (!loading && authChecked) {
        if (!isAuthenticated && !redirected) {
          if (retryCount.current < maxRetries) {
            console.log(
              `[useRequireAuth] Not authenticated, retry ${
                retryCount.current + 1
              }/${maxRetries}`
            );
            retryCount.current++;
            setTimeout(checkAuth, 1000);
          } else {
            console.log(
              "[useRequireAuth] Not authenticated after retries, redirecting"
            );
            setRedirected(true);
            router.push(
              `${redirectTo}?from=${window.location.pathname}&reason=notauthenticated`
            );
          }
        }
      } else if (!loading && !authChecked && retryCount.current < maxRetries) {
        console.log("[useRequireAuth] Auth not checked yet, retrying");
        retryCount.current++;
        setTimeout(checkAuth, 1000);
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [isAuthenticated, loading, authChecked, router, redirectTo, redirected]);

  return { isAuthenticated, loading, isAuthReady: authChecked };
}
