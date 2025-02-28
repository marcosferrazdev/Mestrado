import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient.js"; // Certifique-se de que o caminho está correto
import { toast, Toaster } from "react-hot-toast";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validação básica
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
        navigate("/home"); // Redireciona para /home após o login
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

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${import.meta.env.VITE_APP_URL}/reset-password`, // Usa a variável de ambiente
      });

      if (error) {
        toast.error("Erro ao enviar o e-mail de recuperação: " + error.message);
        return;
      }

      toast.success(
        "E-mail de recuperação enviado! Verifique sua caixa de entrada."
      );
    } catch (error) {
      toast.error("Erro ao enviar o e-mail de recuperação. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center py-4 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-lg shadow-md">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">
          Login
        </h2>
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
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Digite sua senha"
              disabled={loading}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-indigo-600 hover:text-indigo-800"
              disabled={loading}
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
      </div>
    </div>
  );
}

export default Login;
