import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "./firebase.js";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [createAccount, setCreateAccount] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPass, setSignupPass] = useState("");
  const [passRepeat, setPassRepeat] = useState("");
  const [signupError, setSignupError] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [errorKey, setErrorKey] = useState(0);
  const [resetErrorKey, setResetErrorKey] = useState(0);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      if (!userCredential.user.emailVerified) {
        setLoginError(
          `Please check your inbox / spam folder - a verification email was sent to "${email}".`,
        );
        setErrorKey((prev) => prev + 1);
        setEmail("");
        setPassword("");
      } else {
        onLogin(userCredential.user);
      }
    } catch {
      setLoginError("Wrong email address or password.");
      setErrorKey((prev) => prev + 1);
      setEmail("");
      setPassword("");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSignUp(e) {
    e.preventDefault();
    if (signupPass !== passRepeat) {
      setSignupError("Passwords don't match, please try again.");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        signupEmail,
        signupPass,
      );
      await sendEmailVerification(userCredential.user);
      setVerificationSent(true);
      setSignupEmail("");
      setSignupPass("");
      setPassRepeat("");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setSignupError(
          "An account with this email already exists. Try logging in instead, or reset your password.",
        );
      } else if (error.code === "auth/missing-email") {
        setSignupError("Please enter a valid email address.");
      } else if (error.code === "auth/missing-password") {
        setSignupError("Please enter a password.");
      } else {
        setSignupError(error.message);
      }
      setSignupEmail("");
      setSignupPass("");
      setPassRepeat("");
    }
  }

  async function handleForgotPassword(e) {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetEmailSent(true);
      setResetError("");
    } catch (error) {
      if (error.code === "auth/invalid-email") {
        setResetError("Please enter a valid email address.");
      } else if (error.code === "auth/missing-email") {
        setResetError("Please enter your email address.");
      } else if (error.code === "auth/too-many-requests") {
        setResetError("Too many attempts. Please try again later.");
      } else {
        setResetError(error.message);
      }
      setResetErrorKey((prev) => prev + 1);
      setResetEmailSent(false);
    }
  }

  function handleCloseForgotPasswordModal() {
    setShowForgotPassword(false);
    setResetError("");
    setResetEmailSent(false);
    setResetEmail("");
  }

  return (
    <div className="login-page">
      <div className="hero-text-wrap">
        <div>
          <h1 className="hero-text">
            Manage your shopping lists <br></br>with CartMate!
          </h1>
        </div>
      </div>
      <p className="app-description">
        Create, share and manage your lists.
        <br></br> Plan and shop smarter — all with CartMate.
        <br></br>Join now!
      </p>
      <div className="login-card-wrap">
        <div className="login-card">
          {loginError && (
            <div
              key={errorKey}
              className="error-message anim-shake overlay-toast"
            >
              <p>{loginError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <input
              disabled={isLoading}
              className="text-input"
              type="email"
              maxLength={254}
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              disabled={isLoading}
              className="text-input"
              type="password"
              maxLength={100}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              className="btn-primary btn-shine"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Loading... Please wait." : "Log in"}
            </button>
          </form>

          <button
            className="btn-forgot"
            disabled={isLoading}
            onClick={() => {
              setShowForgotPassword(!showForgotPassword);
              setLoginError("");
            }}
          >
            Forgot password
          </button>

          {showForgotPassword && (
            <div
              className="modal-overlay"
              onClick={handleCloseForgotPasswordModal}
            >
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="dismiss-btn"
                  onClick={handleCloseForgotPasswordModal}
                >
                  ✖
                </button>
                <form onSubmit={handleForgotPassword} className="auth-form">
                  <p className="section-subtitle">
                    Enter your email address to receive a password reset link.
                  </p>
                  <input
                    className="text-input"
                    id="reset-email"
                    type="email"
                    maxLength={254}
                    placeholder="Email"
                    value={resetEmail}
                    disabled={resetEmailSent}
                    onChange={(e) => setResetEmail(e.target.value)}
                  />
                  <input type="submit" className="btn-primary" />
                </form>

                {resetEmailSent && (
                  <div className="success-message overlay-below anim-success">
                    <p>Check your inbox / spam folder.</p>
                  </div>
                )}
                {resetError && (
                  <div
                    key={resetErrorKey}
                    className="error-message anim-shake overlay-below"
                  >
                    <p>{resetError}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            className="btn-secondary"
            disabled={isLoading}
            onClick={() => {
              setCreateAccount(!createAccount);
              setLoginError("");
              setResetError("");
              setResetEmailSent(false);
            }}
          >
            New account
          </button>
          {createAccount && (
            <div className="reveal-section">
              <p className="section-subtitle">
                Enter your email address and choose a password to get started.
              </p>
              <form onSubmit={handleSignUp} className="auth-form">
                <input
                  className="text-input"
                  id="signup-email"
                  type="email"
                  maxLength={254}
                  placeholder="Email*"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                />

                <input
                  className="text-input"
                  id="signup-password"
                  type="password"
                  minLength={6}
                  maxLength={100}
                  placeholder="Password*"
                  value={signupPass}
                  onChange={(e) => setSignupPass(e.target.value)}
                />

                <input
                  className="text-input"
                  id="signup-password-repeat"
                  type="password"
                  maxLength={100}
                  placeholder="Repeat password*"
                  value={passRepeat}
                  onChange={(e) => setPassRepeat(e.target.value)}
                />
                <input
                  type="submit"
                  disabled={
                    isLoading ||
                    signupEmail.trim() === "" ||
                    signupPass.trim() === "" ||
                    passRepeat.trim() === ""
                  }
                  value="Create account"
                  className="btn-primary"
                />
              </form>
              {signupError && (
                <div>
                  <p>{signupError}</p>
                  <button onClick={() => setSignupError("")}>X</button>
                </div>
              )}
              {verificationSent && (
                <p>
                  Please check your email inbox / spam folder to confirm your
                  account.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
