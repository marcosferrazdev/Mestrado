import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient.js"; // Certifique-se de que o caminho está correto
import { toast, Toaster } from "react-hot-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingForgot, setLoadingForgot] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos.");
      setLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Por favor, insira um e-mail válido.");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          toast.error(
            "E-mail não confirmado. Por favor, verifique sua caixa de entrada."
          );
        } else {
          toast.error("Erro ao fazer login: " + error.message);
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        toast.success("Login realizado com sucesso!");
        navigate("/home");
      }
    } catch (error) {
      toast.error("Erro ao fazer login. Tente novamente.");
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Por favor, insira seu e-mail para redefinir a senha.");
      return;
    }

    setLoadingForgot(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${import.meta.env.VITE_APP_URL}/reset-password`,
      });

      if (error) {
        toast.error("Erro ao enviar o e-mail de recuperação: " + error.message);
        setLoadingForgot(false);
        return;
      }

      toast.success(
        "E-mail de recuperação enviado! Verifique sua caixa de entrada."
      );
    } catch (error) {
      toast.error("Erro ao enviar o e-mail de recuperação. Tente novamente.");
    } finally {
      setLoadingForgot(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center py-4 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-lg shadow-md">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">
          Login
        </h2>

        {loadingForgot ? (
          <div className="flex flex-col items-center justify-center h-48">
            <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
            <p className="mt-4 text-gray-600">
              Enviando e-mail de recuperação...
            </p>
          </div>
        ) : (
          <>
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Digite seu e-mail"
                  disabled={loading}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Digite sua senha"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                  disabled={loading || loadingForgot}
                >
                  Esqueceu sua senha?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-md text-white font-medium ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {loading ? "Entrando..." : "Entrar"}
              </button>
            </form>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Não tem uma conta?{" "}
                <button
                  onClick={() => navigate("/register")}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  Cadastre-se
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
