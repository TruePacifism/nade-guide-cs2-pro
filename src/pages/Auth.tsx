import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const Auth = () => {
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
  });

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(formData.email, formData.password);

    if (error) {
      toast.error("Ошибка входа: " + error.message);
    } else {
      toast.success("Вход выполнен успешно!");
      navigate("/");
    }

    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signUp(
      formData.email,
      formData.password,
      formData.username
    );

    if (error) {
      toast.error("Ошибка регистрации: " + error.message);
    } else {
      toast.success("Регистрация успешна! Проверьте email для подтверждения.");
    }

    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSkip = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="flex items-center justify-between mb-6 absolute top-8 left-4">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            className="flex items-center space-x-2 text-slate-300 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Назад к картам</span>
          </Button>
        </div>
      </div>
      <div className="">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">
              CS2 Grenade Throws
            </CardTitle>
            <CardDescription className="text-slate-300">
              Войдите или создайте аккаунт для сохранения своих раскидок
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-700">
                <TabsTrigger
                  value="signin"
                  className="text-slate-300 data-[state=active]:bg-slate-600 data-[state=active]:text-white"
                >
                  Вход
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="text-slate-300 data-[state=active]:bg-slate-600 data-[state=active]:text-white"
                >
                  Регистрация
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-slate-300">
                      Email
                    </Label>
                    <Input
                      id="signin-email"
                      name="email"
                      autoComplete="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-slate-300">
                      Пароль
                    </Label>
                    <Input
                      id="signin-password"
                      name="password"
                      autoComplete="current-password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    disabled={loading}
                  >
                    {loading ? "Вход..." : "Войти"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-username" className="text-slate-300">
                      Имя пользователя
                    </Label>
                    <Input
                      id="signup-username"
                      name="username"
                      autoComplete="username"
                      type="text"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-slate-300">
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-slate-300">
                      Пароль
                    </Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={loading}
                  >
                    {loading ? "Регистрация..." : "Зарегистрироваться"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
